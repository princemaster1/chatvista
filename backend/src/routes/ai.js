// backend/src/routes/ai.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../db').getClient();
const { callOpenAI } = require('../services/openai');
const { v4: uuidv4 } = require('uuid');

// AI respond route: stores AI message as system user
router.post('/respond', requireAuth, async (req,res) => {
  const { conversationId, prompt, mode } = req.body;
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if(!apiKey) return res.status(500).json({ error: 'AI key not configured' });
    // Build system messages based on mode
    let systemPrompt = 'You are a helpful assistant.';
    if(mode === 'summarize') systemPrompt = 'Summarize the conversation succinctly.';
    const aiRes = await callOpenAI(`${systemPrompt}\nUser: ${prompt}`, apiKey, { max_tokens: 400 });
    const aiText = aiRes.choices?.[0]?.message?.content || aiRes.choices?.[0]?.text || '...';
    const id = uuidv4();
    // system AI user id seeded in migration
    const AI_USER_ID = '00000000-0000-0000-0000-000000000001';
    const insert = await db.query('INSERT INTO messages(id, conversation_id, sender_id, content, ai_generated) VALUES($1,$2,$3,$4,$5) RETURNING *', [id, conversationId, AI_USER_ID, aiText, true]);
    // emit via socket.io by retrieving io from main file (we attach it to global)
    try{
      const io = require('../index').io;
      if(io) io.to(conversationId).emit('message', insert.rows[0]);
    }catch(e){ /* ignore */ }
    res.json({ message: insert.rows[0], conversationId });
  } catch(err){
    console.error(err.response && err.response.data ? err.response.data : err);
    res.status(500).json({ error: 'AI error' });
  }
});

module.exports = router;
