import { io } from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001';

const socket = io(SERVER_URL, { autoConnect: false });

export function connectSocket(token) {
  if (!socket.connected) {
    socket.connect();
    socket.emit('authenticate', token);
  }
}

export function disconnectSocket() {
  socket.disconnect();
}

export default socket;
