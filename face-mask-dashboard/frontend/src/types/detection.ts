/**
 * Detection Types - Frontend interfaces
 */

export interface Detection {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    confidence: number;
    class: number;
    label: string;
    color: string;
}

export interface DetectionStats {
    total: number;
    masked: number;
    unmasked: number;
    incorrect: number;
    maskRate: number;
}

export interface DetectionResult {
    success: boolean;
    detections?: Detection[];
    stats?: DetectionStats;
    imageWidth?: number;
    imageHeight?: number;
    error?: string;
}

export interface WebSocketMessage {
    type: 'connected' | 'detection' | 'error' | 'pong';
    detections?: Detection[];
    stats?: DetectionStats;
    error?: string;
    message?: string;
}

export type MaskClass = 'Maskeli' | 'Maskesiz' | 'Hatalı Maske';

export const CLASS_COLORS: Record<number, string> = {
    0: '#22C55E', // Green - Masked
    1: '#EF4444', // Red - Unmasked
    2: '#F59E0B', // Amber - Incorrect
};

export const CLASS_NAMES: Record<number, MaskClass> = {
    0: 'Maskeli',
    1: 'Maskesiz',
    2: 'Hatalı Maske',
};
