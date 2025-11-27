// backend/src/routes/conversations.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../db').getClient();

// list conversations for user with last message
router.get('/', requireAuth, async (req,res) => {
  try {
    const q = `
      SELECT c.id, c.created_at,
        (SELECT jsonb_agg(row_to_json(m)) FROM (
           SELECT id, sender_id, content, ai_generated, created_at, status
           FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
        ) m) as last_message
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      WHERE cp.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const r = await db.query(q, [req.user.id]);
    res.json({ conversations: r.rows });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// leave conversation (remove participant)
router.post('/:conversationId/leave', requireAuth, async (req,res) => {
  const { conversationId } = req.params;
  try {
    await db.query('DELETE FROM conversation_participants WHERE conversation_id=$1 AND user_id=$2', [conversationId, req.user.id]);
    res.json({ ok: true });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
