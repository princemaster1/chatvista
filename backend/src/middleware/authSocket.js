// backend/src/middleware/authSocket.js
const jwt = require('jsonwebtoken');

function verifyTokenSocket(socket, next){
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if(!token) return next(new Error('Authentication error'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.id;
    next();
  } catch(err){
    console.error('Socket auth error', err);
    next(new Error('Authentication error'));
  }
}

module.exports = { verifyTokenSocket };
