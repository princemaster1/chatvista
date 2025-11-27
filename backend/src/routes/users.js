// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../db').getClient();

router.get('/me', requireAuth, async (req,res) => {
  res.json({ user: req.user });
});

router.put('/me', requireAuth, async (req,res) => {
  const { username, bio, profile_image } = req.body;
  try {
    await db.query('UPDATE users SET username=$1, bio=$2, profile_image=$3 WHERE id=$4', [username || req.user.username, bio || req.user.bio, profile_image || req.user.profile_image, req.user.id]);
    const r = await db.query('SELECT id, username, email, profile_image, bio, created_at FROM users WHERE id=$1', [req.user.id]);
    res.json({ user: r.rows[0] });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
