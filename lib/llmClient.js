// LLM and embedding client for different providers
import axios from 'axios';

class LLMClient {
  // Call OpenRouter API
  static async callOpenRouter(prompt) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }
    
    try {
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'openai/gpt-3.5-turbo', // or gpt-4 if allowed
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000', // Optional, for tracking
          'X-Title': 'Mini PDF Q&A App' // Optional, for tracking
        }
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  // Call LM Studio API
  static async callLMStudio(prompt) {
    try {
      const response = await axios.post(`${process.env.LM_STUDIO_ENDPOINT}/chat/completions`, {
        model: 'openai/gpt-oss-20b', // Adjust based on your LM Studio model
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('LM Studio API error:', error.response?.data || error.message);
      throw new Error(`LM Studio API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  // Generate embedding using OpenRouter (if supported)
  static async generateOpenRouterEmbedding(text) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }
    
    try {
      // Note: OpenRouter may not support embeddings directly
      // This is a placeholder - you might need to use a different service for embeddings
      const response = await axios.post('https://openrouter.ai/api/v1/embeddings', {
        input: text,
        model: 'text-embedding-ada-002' // Example model
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      });
      
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('OpenRouter Embedding API error:', error.response?.data || error.message);
      throw new Error(`OpenRouter Embedding API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Generate embedding using LM Studio
  static async generateLMStudioEmbedding(text) {
    try {
      const response = await axios.post(`${process.env.LM_STUDIO_ENDPOINT}/embeddings`, {
        model: 'Qwen/Qwen3-Embedding-0.6B-GGUF', // Adjust based on your LM Studio model
        input: text
      });
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('LM Studio Embedding API error:', error.response?.data || error.message);
      throw new Error(`LM Studio Embedding API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  // Generate embedding using Hugging Face
  static async generateHFEmbedding(text) {
    try {
      // Using sentence-transformers/all-MiniLM-L6-v2 via Hugging Face Inference API
      // You would need to configure HF_API_KEY for this
      const response = await axios.post(
        'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HF_API_KEY || ''}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Hugging Face Embedding API error:', error.response?.data || error.message);
      throw new Error(`Hugging Face Embedding API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  // Call LLM based on configuration
  static async callLLM(prompt) {
    switch (process.env.EMBEDDING_MODE) {
      case 'openrouter':
        return this.callOpenRouter(prompt);
      case 'lm_studio':
        return this.callLMStudio(prompt);
      default:
        // Fallback or error
        throw new Error('Invalid EMBEDDING_MODE for LLM call');
    }
  }
  
  // Generate embedding based on configuration
  static async generateEmbedding(text) {
    switch (process.env.EMBEDDING_MODE) {
      case 'openrouter':
        return this.generateOpenRouterEmbedding(text);
      case 'lm_studio':
        return this.generateLMStudioEmbedding(text);
      case 'hf':
        return this.generateHFEmbedding(text);
      default:
        // Fallback or error
        throw new Error('Invalid EMBEDDING_MODE for embedding generation');
    }
  }
}

export default LLMClient;