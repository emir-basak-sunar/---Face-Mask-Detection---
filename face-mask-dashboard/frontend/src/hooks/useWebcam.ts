import { useState, useCallback, useRef, useEffect } from 'react';

interface UseWebcamReturn {
    videoRef: React.RefObject<HTMLVideoElement>;
    isStreaming: boolean;
    hasPermission: boolean | null;
    error: string | null;
    startStream: () => Promise<void>;
    stopStream: () => void;
    captureFrame: () => string | null;
}

export function useWebcam(): UseWebcamReturn {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startStream = useCallback(async () => {
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
            });

            streamRef.current = stream;
            setHasPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsStreaming(true);
            }
        } catch (err) {
            setHasPermission(false);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setError('Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
                } else if (err.name === 'NotFoundError') {
                    setError('Kamera bulunamadı. Lütfen bir kamera bağlayın.');
                } else {
                    setError(`Kamera hatası: ${err.message}`);
                }
            }
        }
    }, []);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsStreaming(false);
    }, []);

    const captureFrame = useCallback((): string | null => {
        const video = videoRef.current;
        if (!video || !isStreaming) return null;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        // Return base64 without prefix
        return dataUrl.split(',')[1];
    }, [isStreaming]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    return {
        videoRef: videoRef as React.RefObject<HTMLVideoElement>,
        isStreaming,
        hasPermission,
        error,
        startStream,
        stopStream,
        captureFrame,
    };
}
