import { useEffect, useRef } from 'react';
import { Detection } from '@/types/detection';
import { formatConfidence } from '@/lib/utils';

interface DetectionCanvasProps {
    imageUrl: string;
    detections: Detection[];
    imageWidth?: number;
    imageHeight?: number;
}

export function DetectionCanvas({
    imageUrl,
    detections,
    imageWidth,
    imageHeight,
}: DetectionCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        const container = containerRef.current;

        if (!canvas || !image || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawDetections = () => {
            // Get the displayed image dimensions
            const displayWidth = image.clientWidth;
            const displayHeight = image.clientHeight;

            // Set canvas size to match displayed image
            canvas.width = displayWidth;
            canvas.height = displayHeight;

            // Calculate scale factors
            const naturalWidth = imageWidth || image.naturalWidth;
            const naturalHeight = imageHeight || image.naturalHeight;
            const scaleX = displayWidth / naturalWidth;
            const scaleY = displayHeight / naturalHeight;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw each detection
            detections.forEach((det) => {
                const x1 = det.x1 * scaleX;
                const y1 = det.y1 * scaleY;
                const width = (det.x2 - det.x1) * scaleX;
                const height = (det.y2 - det.y1) * scaleY;

                // Draw bounding box
                ctx.strokeStyle = det.color;
                ctx.lineWidth = 2;
                ctx.strokeRect(x1, y1, width, height);

                // Draw label background
                const label = `${det.label} ${formatConfidence(det.confidence)}`;
                ctx.font = 'bold 12px Inter, sans-serif';
                const textWidth = ctx.measureText(label).width;
                const labelHeight = 20;
                const labelY = y1 > labelHeight ? y1 - labelHeight : y1 + height;

                ctx.fillStyle = det.color;
                ctx.fillRect(x1, labelY, textWidth + 12, labelHeight);

                // Draw label text
                ctx.fillStyle = '#ffffff';
                ctx.fillText(label, x1 + 6, labelY + 14);
            });
        };

        // Wait for image to load
        if (image.complete) {
            drawDetections();
        } else {
            image.onload = drawDetections;
        }

        // Redraw on resize
        const resizeObserver = new ResizeObserver(() => {
            if (image.complete) {
                drawDetections();
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [imageUrl, detections, imageWidth, imageHeight]);

    return (
        <div ref={containerRef} className="relative w-full">
            <img
                ref={imageRef}
                src={imageUrl}
                alt="Detection result"
                className="w-full h-auto rounded-lg max-h-[500px] object-contain bg-black/20"
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ maxHeight: '500px' }}
            />
        </div>
    );
}
