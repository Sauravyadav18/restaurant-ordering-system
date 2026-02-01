// Use environment variable for Socket URL in production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

import { io } from 'socket.io-client';

export const socket = io(SOCKET_URL, {
    autoConnect: false
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

// Join admin room for receiving new orders
export const joinAdminRoom = () => {
    socket.emit('join-admin');
};

// Join order room for receiving status updates
export const joinOrderRoom = (orderId) => {
    socket.emit('join-order', orderId);
};

// Leave order room
export const leaveOrderRoom = (orderId) => {
    socket.emit('leave-order', orderId);
};

export default socket;
