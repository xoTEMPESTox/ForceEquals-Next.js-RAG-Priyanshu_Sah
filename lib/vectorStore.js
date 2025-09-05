// Vector store implementation for similarity search
import SessionStore from './sessionStore';

class VectorStore {
  // Calculate cosine similarity between two vectors
  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  // Perform similarity search
  static similaritySearch(queryEmbedding, sessionId, topK = 4) {
    const session = SessionStore.getSession(sessionId);
    if (!session || !session.chunks) {
      return [];
    }
    
    // In a real implementation, you would have pre-computed embeddings for chunks
    // For this demo, we'll generate mock embeddings and similarities
    
    const results = session.chunks.map((chunk, index) => {
      // Generate a mock embedding for the chunk
      // In a real implementation, you would retrieve the actual embedding
      const chunkEmbedding = this.generateMockEmbedding(chunk.text);
      
      // Calculate similarity
      const similarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding);
      
      return {
        chunk,
        similarity,
        index
      };
    });
    
    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);
    
    // Return top K results
    return results.slice(0, topK);
  }
  
  // Generate a mock embedding (for demonstration purposes)
  static generateMockEmbedding(text) {
    // This is a placeholder - in a real implementation, you would call an embedding API
    const embedding = [];
    const seed = text.length % 100; // Simple seed based on text length
    
    for (let i = 0; i < 384; i++) {
      // Generate deterministic pseudo-random values based on seed
      const value = Math.sin(seed + i) * 0.5 + 0.5;
      embedding.push(value);
    }
    
    return embedding;
  }
  
  // Store embeddings for a session
  static storeEmbeddings(sessionId, embeddings) {
    return SessionStore.addEmbeddings(sessionId, embeddings);
  }
  
  // Retrieve embeddings for a session
  static getEmbeddings(sessionId) {
    return SessionStore.getEmbeddings(sessionId);
  }
}

export default VectorStore;