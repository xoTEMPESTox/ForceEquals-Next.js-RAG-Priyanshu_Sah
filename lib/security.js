// Security middleware and utilities

// Simple rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map();

class Security {
  // Check API key
  static checkApiKey(req) {
    const apiKey = req.headers['x-protected-key'] || req.headers['authorization']?.replace('Bearer ', '');
    return apiKey === process.env.PROTECTED_API_KEY;
  }
  
  // Rate limiting middleware
  static rateLimit(req, res, next) {
    // Note: process.env.ENABLE_RATE_LIMITING should be set to 'true' or 'false' in .env
    if (process.env.ENABLE_RATE_LIMITING !== 'true') {
      return next();
    }
    
    const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
    const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
    const windowStart = now - rateLimitWindowMs;
    
    // Clean old entries
    if (rateLimitStore.has(clientId)) {
      const requests = rateLimitStore.get(clientId);
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length >= rateLimitMaxRequests) {
        return res.status(429).json({ error: 'Too many requests' });
      }
      
      // Add current request
      validRequests.push(now);
      rateLimitStore.set(clientId, validRequests);
    } else {
      rateLimitStore.set(clientId, [now]);
    }
    
    next();
  }
  
  // CORS middleware
  static cors(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Protected-Key');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    next();
  }
  
  // Input validation for upload
  static validateUploadInput(req, res, next) {
    // Check content type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }
    
    next();
  }
  
  // Input validation for ask
  static validateAskInput(req, res, next) {
    const { session_id, question } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }
    
    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }
    
    if (typeof question !== 'string' || question.length > 100) {
      return res.status(400).json({ error: 'question must be a string with max 1000 characters' });
    }
    
    next();
  }
}

export default Security;