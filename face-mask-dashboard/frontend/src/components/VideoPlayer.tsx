import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWebcam } from '@/hooks/useWebcam';
import { Detection, DetectionStats, WebSocketMessage } from '@/types/detection';
import { StatsCards } from '@/components/StatsCards';
import { formatConfidence } from '@/lib/utils';
import { Video, VideoOff, Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const WS_URL = `ws://${window.location.hostname}:3001`;

export function VideoPlayer() {
    const { videoRef, isStreaming, hasPermission, error, startStream, stopStream, captureFrame } =
        useWebcam();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const frameIntervalRef = useRef<number | null>(null);

    const [detections, setDetections] = useState<Detection[]>([]);
    const [stats, setStats] = useState<DetectionStats | null>(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Connect to WebSocket
    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setWsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);

                if (message.type === 'detection') {
                    setDetections(message.detections || []);
                    setStats(message.stats || null);
                    setIsProcessing(false);
                } else if (message.type === 'error') {
                    console.error('Detection error:', message.error);
                    setIsProcessing(false);
                }
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setWsConnected(false);
            // Attempt reconnect after 3 seconds
            setTimeout(() => {
                if (isStreaming) {
                    connectWebSocket();
                }
            }, 3000);
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        wsRef.current = ws;
    }, [isStreaming]);

    // Send frame to WebSocket
    const sendFrame = useCallback(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (isProcessing) return;

        const frame = captureFrame();
        if (frame) {
            setIsProcessing(true);
            wsRef.current.send(JSON.stringify({ type: 'frame', image: frame }));
        }
    }, [captureFrame, isProcessing]);

    // Draw detections on canvas
    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            if (!isStreaming) return;

            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw detections
            detections.forEach((det) => {
                // Draw bounding box
                ctx.strokeStyle = det.color;
                ctx.lineWidth = 3;
                ctx.strokeRect(det.x1, det.y1, det.x2 - det.x1, det.y2 - det.y1);

                // Draw label
                const label = `${det.label} ${formatConfidence(det.confidence)}`;
                ctx.font = 'bold 14px Inter, sans-serif';
                const textWidth = ctx.measureText(label).width;
                const labelHeight = 24;
                const labelY = det.y1 > labelHeight ? det.y1 - labelHeight : det.y1 + (det.y2 - det.y1);

                ctx.fillStyle = det.color;
                ctx.fillRect(det.x1, labelY, textWidth + 16, labelHeight);

                ctx.fillStyle = '#ffffff';
                ctx.fillText(label, det.x1 + 8, labelY + 17);
            });

            requestAnimationFrame(draw);
        };

        draw();
    }, [isStreaming, detections, videoRef]);

    // Start/stop frame sending
    useEffect(() => {
        if (isStreaming && wsConnected) {
            frameIntervalRef.current = window.setInterval(sendFrame, 500); // 2 FPS
        } else {
            if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current);
                frameIntervalRef.current = null;
            }
        }

        return () => {
            if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current);
            }
        };
    }, [isStreaming, wsConnected, sendFrame]);

    // Handle start/stop
    const handleStart = async () => {
        await startStream();
        connectWebSocket();
    };

    const handleStop = () => {
        stopStream();
        setDetections([]);
        setStats(null);
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-6">
            <Card className="glass-card overflow-hidden">
                <CardHeader className="border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-primary" />
                            Canlı Kamera Akışı
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            {/* Connection status */}
                            <div className="flex items-center gap-2 text-sm">
                                {wsConnected ? (
                                    <>
                                        <Wifi className="w-4 h-4 text-success" />
                                        <span className="text-success">Bağlı</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Bağlantı yok</span>
                                    </>
                                )}
                            </div>

                            {/* Start/Stop button */}
                            {isStreaming ? (
                                <Button variant="danger" onClick={handleStop}>
                                    <VideoOff className="w-4 h-4 mr-2" />
                                    Durdur
                                </Button>
                            ) : (
                                <Button onClick={handleStart}>
                                    <Video className="w-4 h-4 mr-2" />
                                    Başlat
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative aspect-video bg-black/50">
                        {/* Video element */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-contain"
                        />

                        {/* Detection overlay canvas */}
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        />

                        {/* Loading/Error states */}
                        {!isStreaming && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {error ? (
                                    <div className="flex flex-col items-center gap-3 text-center p-4">
                                        <AlertCircle className="w-12 h-12 text-danger" />
                                        <p className="text-danger font-medium">{error}</p>
                                        <Button variant="outline" onClick={handleStart}>
                                            Tekrar Dene
                                        </Button>
                                    </div>
                                ) : hasPermission === null ? (
                                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                        <Video className="w-16 h-16" />
                                        <p>Kamera akışını başlatmak için "Başlat" butonuna tıklayın</p>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Processing indicator */}
                        {isProcessing && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span className="text-sm text-primary">İşleniyor...</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <StatsCards stats={stats} isLoading={isProcessing} />
        </div>
    );
}
