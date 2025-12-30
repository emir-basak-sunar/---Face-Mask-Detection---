/**
 * WebSocket Stream Handler
 * Handles real-time video frame processing
 */

import { WebSocket, WebSocketServer } from 'ws';
import { runDetection } from '../services/pythonBridge';

interface StreamMessage {
    type: 'frame' | 'ping';
    image?: string;
}

export function setupWebSocketServer(wss: WebSocketServer): void {
    console.log('WebSocket server initialized');

    wss.on('connection', (ws: WebSocket) => {
        console.log('Client connected to WebSocket');

        let isProcessing = false;
        let frameQueue: string[] = [];

        ws.on('message', async (data: Buffer) => {
            try {
                const message: StreamMessage = JSON.parse(data.toString());

                if (message.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                    return;
                }

                if (message.type === 'frame' && message.image) {
                    // Add to queue if currently processing
                    if (isProcessing) {
                        frameQueue = [message.image]; // Keep only latest frame
                        return;
                    }

                    isProcessing = true;

                    try {
                        const result = await runDetection(message.image, { timeout: 5000 });

                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'detection',
                                ...result,
                            }));
                        }

                        // Process queued frame if any
                        if (frameQueue.length > 0) {
                            const nextFrame = frameQueue.pop()!;
                            frameQueue = [];

                            const nextResult = await runDetection(nextFrame, { timeout: 5000 });

                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({
                                    type: 'detection',
                                    ...nextResult,
                                }));
                            }
                        }
                    } catch (error) {
                        console.error('Frame processing error:', error);
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                error: 'Failed to process frame',
                            }));
                        }
                    } finally {
                        isProcessing = false;
                    }
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected from WebSocket');
            frameQueue = [];
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        // Send connection confirmation
        ws.send(JSON.stringify({
            type: 'connected',
            message: 'Connected to Face Mask Detection stream',
        }));
    });
}
