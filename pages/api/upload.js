import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import SessionStore from '../../lib/sessionStore';
import VectorStore from '../../lib/vectorStore';
import LLMClient from '../../lib/llmClient';
import Security from '../../lib/security';
import { readFileSync } from 'fs'; // For reading the PDF file from the request

// Text chunking function
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push({
      id: `chunk_${i}`,
      text: chunk,
      start_offset: i,
      end_offset: Math.min(i + chunkSize, text.length)
    });
    
    // Break if we've reached the end
    if (i + chunkSize >= text.length) break;
 }
  return chunks;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Apply CORS
  Security.cors(req, res, () => {});
  
  // Check API key
  if (!Security.checkApiKey(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Apply rate limiting
  if (process.env.ENABLE_RATE_LIMITING === 'true') {
    let rateLimitResponseSent = false;
    Security.rateLimit(req, res, () => {
      rateLimitResponseSent = true;
    });
    
    if (rateLimitResponseSent) {
      return;
    }
  }
  
  // Validate input
  Security.validateUploadInput(req, res, () => {});

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    const file = files.file[0]; // Access the first file if multiple are uploaded
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileBuffer = readFileSync(file.filepath);
    const filename = file.originalFilename;
    
    // Parse PDF
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text;
    
    // Chunk text
    const chunks = chunkText(text);
    
    // Generate embeddings for chunks
    const embeddings = [];
    for (const chunk of chunks) {
      try {
        const embedding = await LLMClient.generateEmbedding(chunk.text);
        embeddings.push(embedding);
      } catch (error) {
        console.error(`Error generating embedding for chunk ${chunk.id}:`, error.message);
        // Use a zero vector as fallback
        embeddings.push(new Array(384).fill(0));
      }
    }
    
    // Create session
    const sessionId = uuidv4().substring(0, 12);
    const sessionData = {
      filename: filename,
      created_at: new Date().toISOString(),
      chunks: chunks,
      embeddings: embeddings
    };
    
    // Store session
    SessionStore.setSession(sessionId, sessionData);
    
    // Return response
    res.status(200).json({
      session_id: sessionId,
      num_chunks: chunks.length,
      approx_chars: text.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
}