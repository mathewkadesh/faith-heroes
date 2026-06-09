const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/neon');
const socketService = require('../services/socket.service');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  socketService.init(io);

  io.on('connection', socket => {
    socket.on('authenticate', async (token) => {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'faith-heroes-dev-secret-change-me');
        const { rows } = await pool.query('select id, role from profiles where id = $1 limit 1', [payload.sub]);
        const profile = rows[0];
        if (!profile) return socket.disconnect(true);

        socket.userId = profile.id;
        socket.isAdmin = profile?.role === 'admin';

        socketService.connectedUsers.set(profile.id, socket.id);
        if (socket.isAdmin) socketService.connectedAdmins.add(socket.id);

        socket.emit('authenticated', { userId: profile.id, isAdmin: socket.isAdmin });
      } catch {
        socket.disconnect(true);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) socketService.connectedUsers.delete(socket.userId);
      socketService.connectedAdmins.delete(socket.id);
    });
  });

  return io;
}

module.exports = { initSocket };
