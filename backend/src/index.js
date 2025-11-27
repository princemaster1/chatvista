// backend/src/index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');
const conversationRoutes = require('./routes/conversations');
const { verifyTokenSocket } = require('./middleware/authSocket');

const app = express();
app.use(express.json());

// CORS - production-ready
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/conversations', conversationRoutes);

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: allowedOrigins, methods: ['GET','POST'] } });

// Simple in-memory mapping (for demonstration). In production use Redis adapter.
const onlineUsers = new Map();

io.use(verifyTokenSocket);

io.on('connection', (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('send_message', async ({ conversationId, content, ai }) => {
    // Persist message via API route or db helper
    const db = require('./db').getClient();
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const res = await db.query(
      `INSERT INTO messages(id, conversation_id, sender_id, content, ai_generated) VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [id, conversationId, userId, content, ai || false]
    );
    const message = res.rows[0];
    // Emit to conversation
    io.to(conversationId).emit('message', message);

    // If ai flag set, optionally call AI service here — recommend the frontend triggers special AI conversation
  });

  socket.on('update_status', async ({ messageId, status, conversationId }) => {
    try{
      const db = require('./db').getClient();
      await db.query('UPDATE messages SET status=$1 WHERE id=$2 AND conversation_id=$3', [status, messageId, conversationId]);
      io.to(conversationId).emit('status_update', { messageId, status });
    }catch(e){console.error(e)}
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
  });
});

const PORT = process.env.PORT || 4000;
initDb().then(()=> {
  server.listen(PORT, () => {
    console.log('Server listening on', PORT);
  });
}).catch(err => {
  console.error('DB init error', err);
  process.exit(1);
});

// Export io for other modules (e.g., AI route) to emit events
module.exports.io = io;
