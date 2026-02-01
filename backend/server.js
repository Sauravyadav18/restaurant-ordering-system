require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize express app
const app = express();
const server = http.createServer(app);

// CORS origins - allow all in production for flexibility
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, /\.vercel\.app$/]
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    }
});

// Make io accessible to routes
app.set('io', io);

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Socket handler
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
