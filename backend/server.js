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

// CORS - Allow all origins
app.use(cors());

// Parse JSON
app.use(express.json());

// Debug route - FIRST route to test
app.get('/', (req, res) => {
    console.log('Root route hit');
    res.json({ success: true, message: 'Restaurant API Server', version: '1.0.0' });
});

// Test route without /api prefix
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ success: true, message: 'Test route works' });
});

// Test route with /api prefix
app.get('/api', (req, res) => {
    console.log('API root route hit');
    res.json({ success: true, message: 'API root works' });
});

app.get('/api/health', (req, res) => {
    console.log('Health route hit');
    res.json({ success: true, message: 'Server is running' });
});

// Connect to database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler - catch all unmatched routes
app.use((req, res) => {
    console.log('404 - Route not found:', req.method, req.url);
    res.status(404).json({ success: false, message: 'Route not found', path: req.url });
});

// Error handler
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
});

// Make io accessible to routes
app.set('io', io);

// Socket handler
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
