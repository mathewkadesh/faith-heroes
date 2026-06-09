const jwt = require('jsonwebtoken');
const { pool } = require('../db/neon');

const JWT_SECRET = process.env.JWT_SECRET || 'faith-heroes-dev-secret-change-me';

function generateToken(userId, role = 'customer') {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

async function verifyToken(req, res, next) {
  const devSecret = req.headers['x-dev-admin-secret'];
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.ADMIN_DEV_SECRET &&
    devSecret === process.env.ADMIN_DEV_SECRET
  ) {
    req.user = { id: 'local-admin', email: process.env.ADMIN_EMAIL || 'admin@faithheroes.local' };
    req.profile = { id: 'local-admin', role: 'admin', full_name: 'Faith Heroes Admin' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const result = await pool.query('select * from profiles where id = $1 limit 1', [payload.sub]);
    const profile = result.rows[0];
    if (!profile) return res.status(401).json({ success: false, error: 'Invalid token user' });
    req.user = { id: profile.id, email: profile.email };
    req.profile = profile;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.generateToken = generateToken;
