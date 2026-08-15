const jwt = require('jsonwebtoken');
const { getSessionCookie, setSessionCookie } = require('../utils/session');

module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const cookieToken = getSessionCookie(req);
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    if (req.user.userId && !req.user.id) {
      req.user.id = req.user.userId;
    }
    if (!cookieToken && bearerToken) setSessionCookie(res, bearerToken);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
