import { useState, useCallback, useRef, useEffect } from 'react';
import { DetectionResult, Detection, DetectionStats } from '@/types/detection';

const API_URL = '/api';

interface UseDetectionReturn {
    detect: (base64Image: string) => Promise<void>;
    detections: Detection[];
    stats: DetectionStats | null;
    isLoading: boolean;
    error: string | null;
    clearResults: () => void;
}

export function useDetection(): UseDetectionReturn {
    const [detections, setDetections] = useState<Detection[]>([]);
    const [stats, setStats] = useState<DetectionStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const detect = useCallback(async (base64Image: string) => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/detect/base64`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image }),
                signal: abortControllerRef.current.signal,
            });

            const result: DetectionResult = await response.json();

            if (result.success) {
                setDetections(result.detections || []);
                setStats(result.stats || null);
            } else {
                setError(result.error || 'Detection failed');
                setDetections([]);
                setStats(null);
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return; // Request was cancelled
            }
            setError(err instanceof Error ? err.message : 'Network error');
            setDetections([]);
            setStats(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setDetections([]);
        setStats(null);
        setError(null);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        detect,
        detections,
        stats,
        isLoading,
        error,
        clearResults,
    };
}
