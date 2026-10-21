const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function ensureSession(req, res, next) {
  // Session ID for anonymous users
  let sessionId = req.header('x-session-id');

  if (!sessionId || sessionId.trim() === '') {
    sessionId = crypto.randomUUID();
    res.setHeader('x-session-id', sessionId);
  }

  req.sessionId = sessionId;

  // If the request has a JWT, decode it to get the userId
  const authHeader = req.header('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.userId;
    } catch {
      // Invalid token — just treat as anonymous. No error.
    }
  }

  next();
}

module.exports = { ensureSession };