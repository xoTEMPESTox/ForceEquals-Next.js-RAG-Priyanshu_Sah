import SessionStore from '../../lib/sessionStore';
import VectorStore from '../../lib/vectorStore';
import LLMClient from '../../lib/llmClient';
import Security from '../../lib/security';

export default async function handler(req, res) {
  console.log('--- /api/ask handler started ---');
  
  // Apply CORS
  Security.cors(req, res, () => { console.log('CORS applied'); });
  
  // Check API key
  if (!Security.checkApiKey(req)) {
    console.log('API key check failed');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log('API key check passed');
  
  // Apply rate limiting
  if (process.env.ENABLE_RATE_LIMITING === 'true') {
    let rateLimitResponseSent = false;
    Security.rateLimit(req, res, () => {
      rateLimitResponseSent = true;
      console.log('Rate limit applied');
    });
    
    if (rateLimitResponseSent) {
      console.log('Rate limit response sent');
      return;
    }
  }
  
  // Validate input
  Security.validateAskInput(req, res, () => { console.log('Input validation applied'); });

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  console.log('Method is POST');

  try {
    const { session_id, question, top_k = 4 } = req.body;
    console.log('Request body:', { session_id, question, top_k });
    
    // Validate session
    const sessionData = SessionStore.getSession(session_id);
    if (!sessionData) {
      console.log('Session not found or expired:', session_id);
      return res.status(404).json({ error: 'Session not found or expired' });
    }
    console.log('Session found');
    
    // Validate question
    if (!question) {
      console.log('Question is missing');
      return res.status(400).json({ error: 'Question is required' });
    }
    console.log('Question is present');
    
    // Generate embedding for the question
    const questionEmbedding = await LLMClient.generateEmbedding(question);
    console.log('Question embedding generated');
    
    // Perform similarity search
    const searchResults = VectorStore.similaritySearch(questionEmbedding, session_id, top_k);
    console.log('Similarity search performed, results count:', searchResults.length);
    
    // Prepare sources
    const sources = searchResults.map(result => ({
      chunk_id: result.chunk.id,
      score: result.similarity,
      snippet: result.chunk.text.substring(0, 200) + '...' // First 200 characters
    }));
    console.log('Sources prepared');
    
    // Create RAG prompt
    const context = searchResults.map(result => result.chunk.text).join('\n\n');
    const prompt = `Context information is below.
---------------------
${context}
---------------------
Given the context information and not prior knowledge, answer the question: ${question}`;
    console.log('RAG prompt created');
    
    // Call LLM
    const startTime = Date.now();
    const answer = await LLMClient.callLLM(prompt);
    const latencyMs = Date.now() - startTime;
    console.log('LLM called, answer received');
    
    // Return response
    res.status(200).json({
      answer,
      sources,
      used_model: process.env.EMBEDDING_MODE === 'openrouter' ? 'openrouter' : 
                  process.env.EMBEDDING_MODE === 'lm_studio' ? 'lm-studio' : 'mock-model',
      latency_ms: latencyMs
    });
    console.log('--- /api/ask handler finished ---');
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
}