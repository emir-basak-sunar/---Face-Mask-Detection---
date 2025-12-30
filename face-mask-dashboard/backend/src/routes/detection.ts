/**
 * Detection Routes
 * API endpoints for face mask detection
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { runDetection, checkPythonHealth } from '../services/pythonBridge';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
        }
    },
});

/**
 * POST /api/detect
 * Upload an image and get detection results
 */
router.post('/detect', upload.single('image'), async (req: Request, res: Response) => {
    try {
        let base64Image: string;

        if (req.file) {
            // File upload
            base64Image = req.file.buffer.toString('base64');
        } else if (req.body.image) {
            // Base64 string in body
            base64Image = req.body.image;
        } else {
            res.status(400).json({
                success: false,
                error: 'No image provided. Upload a file or send base64 image in body.',
            });
            return;
        }

        console.log(`Processing image (${base64Image.length} chars)...`);

        const result = await runDetection(base64Image);

        if (result.success) {
            console.log(`Detection complete: ${result.detections?.length || 0} faces found`);
            res.json(result);
        } else {
            console.error('Detection failed:', result.error);
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Detection error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
    }
});

/**
 * POST /api/detect/base64
 * Process a base64 encoded image directly
 */
router.post('/detect/base64', async (req: Request, res: Response) => {
    try {
        const { image } = req.body;

        if (!image) {
            res.status(400).json({
                success: false,
                error: 'No base64 image provided in request body',
            });
            return;
        }

        console.log(`[API] /detect/base64 called with image size: ${image.length} chars`);
        const result = await runDetection(image);
        console.log(`[API] Detection result:`, JSON.stringify(result).substring(0, 500));
        res.json(result);
    } catch (error) {
        console.error('Detection error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', async (_req: Request, res: Response) => {
    const pythonHealth = await checkPythonHealth();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        python: pythonHealth,
    });
});

export default router;
