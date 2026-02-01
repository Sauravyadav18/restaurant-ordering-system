// Socket.io event handler
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Join a specific order room for targeted updates
        socket.on('join-order', (orderId) => {
            socket.join(`order-${orderId}`);
            console.log(`Client ${socket.id} joined room: order-${orderId}`);
        });

        // Leave order room
        socket.on('leave-order', (orderId) => {
            socket.leave(`order-${orderId}`);
            console.log(`Client ${socket.id} left room: order-${orderId}`);
        });

        // Admin joins admin room
        socket.on('join-admin', () => {
            socket.join('admin-room');
            console.log(`Admin ${socket.id} joined admin room`);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};

module.exports = socketHandler;
