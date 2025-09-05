// Shared in-memory session store with vector storage capabilities
const sessions = new Map();

class SessionStore {
  // Get session by ID with expiry check
  static getSession(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return null;
    
    // Check if session has expired
    const now = Date.now();
    const createdAt = new Date(session.created_at).getTime();
    const expiryMs = (parseInt(process.env.SESSION_EXPIRY_SECONDS) || 3600) * 1000;
    
    if (now - createdAt > expiryMs) {
      // Session expired, remove it
      sessions.delete(sessionId);
      return null;
    }
    
    return session;
  }
  
  // Create or update session
  static setSession(sessionId, sessionData) {
    sessions.set(sessionId, {
      ...sessionData,
      created_at: sessionData.created_at || new Date().toISOString()
    });
  }
  
  // Delete session
  static deleteSession(sessionId) {
    sessions.delete(sessionId);
  }
  
  // Get all sessions (for debugging)
  static getAllSessions() {
    return Array.from(sessions.entries());
  }
  
  // Add embeddings to a session
  static addEmbeddings(sessionId, embeddings) {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    session.embeddings = embeddings;
    this.setSession(sessionId, session);
    return true;
  }
  
  // Get embeddings for a session
  static getEmbeddings(sessionId) {
    const session = this.getSession(sessionId);
    return session ? session.embeddings : null;
  }
}

export default SessionStore;