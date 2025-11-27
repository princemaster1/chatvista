// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db').getClient();
const { v4: uuidv4 } = require('uuid');

router.post('/signup', async (req,res) => {
  const { username, email, password, bio, profile_image } = req.body;
  if(!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashed = bcrypt.hashSync(password, 8);
  try {
    const id = uuidv4();
    const q = `INSERT INTO users(id, username, email, password, bio, profile_image) VALUES($1,$2,$3,$4,$5,$6) RETURNING id, username, email, profile_image, bio, created_at`;
    const r = await db.query(q, [id, username, email, hashed, bio || null, profile_image || null]);
    const user = r.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ user, token });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const r = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if(r.rowCount===0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = r.rows[0];
    const ok = bcrypt.compareSync(password, user.password);
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    delete user.password;
    res.json({ user, token });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
