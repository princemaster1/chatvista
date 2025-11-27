// backend/src/routes/messages.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../db').getClient();
const { v4: uuidv4 } = require('uuid');

// Create or get conversation between two users
router.post('/conversation', requireAuth, async (req,res) => {
  const { otherUserId } = req.body;
  try {
    // Find existing conversation with exactly both participants
    const q = `
      SELECT c.id FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      WHERE c.id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = $1
      )
      GROUP BY c.id
      HAVING bool_and(cp.user_id = $1 OR cp.user_id = $2)
    `;
    const r = await db.query(q, [req.user.id, otherUserId]);
    if(r.rowCount>0){
      const convo = await db.query('SELECT * FROM conversations WHERE id=$1', [r.rows[0].id]);
      return res.json({ conversation: convo.rows[0] });
    }
    const insert = await db.query('INSERT INTO conversations DEFAULT VALUES RETURNING id, created_at');
    const conversation = insert.rows[0];
    await db.query('INSERT INTO conversation_participants(conversation_id,user_id) VALUES($1,$2),($1,$3)', [conversation.id, req.user.id, otherUserId]);
    res.json({ conversation });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// fetch messages with pagination
router.get('/:conversationId/messages', requireAuth, async (req,res) => {
  const { conversationId } = req.params;
  const limit = Math.min(parseInt(req.query.limit || '50'), 200);
  const before = req.query.before;
  try {
    let q = 'SELECT * FROM messages WHERE conversation_id=$1';
    const params = [conversationId];
    if(before){
      params.push(before);
      q += ` AND created_at < $${params.length}`;
    }
    params.push(limit);
    q += ` ORDER BY created_at DESC LIMIT $${params.length}`;
    const r = await db.query(q, params);
    res.json({ messages: r.rows.reverse() });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// update message status (delivered/read)
router.post('/:conversationId/messages/:messageId/status', requireAuth, async (req,res) => {
  const { conversationId, messageId } = req.params;
  const { status } = req.body;
  if(!['delivered','read','sent'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await db.query('UPDATE messages SET status=$1 WHERE id=$2 AND conversation_id=$3', [status, messageId, conversationId]);
    res.json({ ok: true });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
