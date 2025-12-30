/**
 * Python Bridge Service
 * Spawns Python process to run YOLOv8 inference
 */

import { spawn } from 'child_process';
import path from 'path';
import { DetectionResult, PythonBridgeOptions } from '../types/detection';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Get the project root (face-mask-dashboard) from current file location
const projectRoot = path.resolve(__dirname, '..', '..', '..');
const PYTHON_SCRIPT = path.join(projectRoot, 'inference', 'detector.py');
const VENV_PYTHON = path.join(projectRoot, '..', '.hadi', 'Scripts', 'python.exe');

// Log paths on startup
console.log('[PythonBridge] Python Path:', VENV_PYTHON);
console.log('[PythonBridge] Script Path:', PYTHON_SCRIPT);

export async function runDetection(
    base64Image: string,
    options: PythonBridgeOptions = {}
): Promise<DetectionResult> {
    const { timeout = DEFAULT_TIMEOUT, pythonPath = VENV_PYTHON } = options;

    console.log(`[PythonBridge] Starting detection (image: ${base64Image.substring(0, 50)}...)`);

    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        let resolved = false;

        // Spawn Python process
        const python = spawn(pythonPath, [PYTHON_SCRIPT], {
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        // Set timeout
        const timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                python.kill('SIGTERM');
                resolve({
                    success: false,
                    error: 'Detection timeout - the model took too long to respond',
                });
            }
        }, timeout);

        // Collect stdout
        python.stdout.on('data', (data: Buffer) => {
            stdout += data.toString();
        });

        // Collect stderr
        python.stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
        });

        // Handle process exit
        python.on('close', (code: number | null) => {
            clearTimeout(timeoutId);

            if (resolved) return;
            resolved = true;

            if (code !== 0) {
                console.error('Python stderr:', stderr);
                resolve({
                    success: false,
                    error: `Python process exited with code ${code}: ${stderr}`,
                });
                return;
            }

            try {
                const result = JSON.parse(stdout.trim());
                resolve(result);
            } catch (parseError) {
                console.error('Failed to parse Python output:', stdout);
                resolve({
                    success: false,
                    error: 'Failed to parse detection results',
                });
            }
        });

        // Handle spawn errors
        python.on('error', (err: Error) => {
            clearTimeout(timeoutId);
            if (!resolved) {
                resolved = true;
                resolve({
                    success: false,
                    error: `Failed to start Python process: ${err.message}`,
                });
            }
        });

        // Send image data to Python process
        const inputData = JSON.stringify({ image: base64Image });
        python.stdin.write(inputData);
        python.stdin.end();
    });
}

// Health check - verify Python and model are available
export async function checkPythonHealth(): Promise<{ ok: boolean; message: string }> {
    return new Promise((resolve) => {
        const python = spawn(VENV_PYTHON, ['--version'], {
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        python.on('close', (code) => {
            if (code === 0) {
                resolve({ ok: true, message: 'Python is available' });
            } else {
                resolve({ ok: false, message: 'Python is not available' });
            }
        });

        python.on('error', () => {
            resolve({ ok: false, message: 'Failed to spawn Python process' });
        });
    });
}
