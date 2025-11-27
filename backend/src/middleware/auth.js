// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../db').getClient();

async function requireAuth(req,res,next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({ error: 'Unauthorized' });
  const parts = header.split(' ');
  if(parts.length!==2) return res.status(401).json({ error: 'Unauthorized' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const r = await db.query('SELECT id, username, email, profile_image, bio FROM users WHERE id=$1', [payload.id]);
    req.user = r.rows[0];
    next();
  } catch(err){
    console.error(err);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { requireAuth };
