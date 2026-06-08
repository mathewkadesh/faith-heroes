let _io = null;

const connectedAdmins = new Set();
const connectedUsers  = new Map(); // userId -> socketId

function init(io) {
  _io = io;
}

function emitToAdmins(event, data) {
  if (!_io) return;
  connectedAdmins.forEach(socketId => {
    _io.to(socketId).emit(event, data);
  });
}

function emitToUser(userId, event, data) {
  if (!_io) return;
  const socketId = connectedUsers.get(userId);
  if (socketId) _io.to(socketId).emit(event, data);
}

function emitToAll(event, data) {
  if (!_io) return;
  _io.emit(event, data);
}

module.exports = { init, emitToAdmins, emitToUser, emitToAll, connectedAdmins, connectedUsers };
