const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
