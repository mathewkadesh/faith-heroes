const { Server } = require('socket.io');
const supabase = require('../config/supabase');
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
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return socket.disconnect(true);

        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', user.id).single();

        socket.userId = user.id;
        socket.isAdmin = profile?.role === 'admin';

        socketService.connectedUsers.set(user.id, socket.id);
        if (socket.isAdmin) socketService.connectedAdmins.add(socket.id);

        socket.emit('authenticated', { userId: user.id, isAdmin: socket.isAdmin });
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
