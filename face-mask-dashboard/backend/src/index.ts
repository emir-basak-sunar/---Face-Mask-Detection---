/**
 * Face Mask Detection Backend Server
 * Express + WebSocket server for YOLOv8 inference
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import detectionRoutes from './routes/detection';
import { setupWebSocketServer } from './websocket/streamHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', detectionRoutes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'Face Mask Detection API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /api/health',
            detect: 'POST /api/detect',
            detectBase64: 'POST /api/detect/base64',
            websocket: `ws://localhost:${PORT}`,
        },
    });
});

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });
setupWebSocketServer(wss);

// Start server
server.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         Face Mask Detection Backend Server                 ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  HTTP Server:     http://localhost:${PORT}                    ║`);
    console.log(`║  WebSocket:       ws://localhost:${PORT}                      ║`);
    console.log('║  API Endpoints:   /api/detect, /api/health                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
