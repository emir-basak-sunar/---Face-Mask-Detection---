/**
 * Detection Types - Shared interfaces for backend
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

export interface PythonBridgeOptions {
    timeout?: number;
    pythonPath?: string;
}
