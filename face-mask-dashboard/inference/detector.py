#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Face Mask Detection - YOLOv8 Inference Engine
Reads base64 encoded images from stdin, runs inference, outputs JSON results.
"""

import sys
import json
import base64
import io
import os
from pathlib import Path

import numpy as np
from PIL import Image
from ultralytics import YOLO

# Class mapping
CLASS_NAMES = {
    0: "Maskeli",
    1: "Maskesiz", 
    2: "Hatalı Maske"
}

CLASS_COLORS = {
    0: "#22C55E",  # Green
    1: "#EF4444",  # Red
    2: "#F59E0B"   # Amber
}

# Model path - best.pt is in the parent directory of face-mask-dashboard
MODEL_PATH = Path(__file__).parent.parent.parent / "best.pt"

# Global model instance
model = None


def load_model():
    """Load YOLOv8 model."""
    global model
    if model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
        model = YOLO(str(MODEL_PATH))
    return model


def decode_image(base64_string: str) -> np.ndarray:
    """Decode base64 string to numpy array."""
    # Remove data URL prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    
    # Convert to RGB if necessary
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    return np.array(image)


def run_inference(image: np.ndarray) -> dict:
    """Run YOLOv8 inference on image."""
    import sys
    model = load_model()
    
    # Debug: log image size
    print(f"[DEBUG] Image shape: {image.shape}", file=sys.stderr)
    
    # Run inference with lower confidence threshold
    results = model(image, verbose=False, conf=0.20)[0]
    
    # Debug: log raw results
    print(f"[DEBUG] Raw boxes: {results.boxes}", file=sys.stderr)
    
    detections = []
    stats = {
        "total": 0,
        "masked": 0,
        "unmasked": 0,
        "incorrect": 0
    }
    
    if results.boxes is not None and len(results.boxes) > 0:
        boxes = results.boxes
        
        for i in range(len(boxes)):
            # Get box coordinates
            xyxy = boxes.xyxy[i].cpu().numpy()
            x1, y1, x2, y2 = map(int, xyxy)
            
            # Get confidence and class
            confidence = float(boxes.conf[i].cpu().numpy())
            class_id = int(boxes.cls[i].cpu().numpy())
            
            detection = {
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "confidence": round(confidence, 3),
                "class": class_id,
                "label": CLASS_NAMES.get(class_id, "Unknown"),
                "color": CLASS_COLORS.get(class_id, "#888888")
            }
            detections.append(detection)
            
            # Update stats
            stats["total"] += 1
            if class_id == 0:
                stats["masked"] += 1
            elif class_id == 1:
                stats["unmasked"] += 1
            elif class_id == 2:
                stats["incorrect"] += 1
    
    # Calculate mask rate
    if stats["total"] > 0:
        stats["maskRate"] = round((stats["masked"] / stats["total"]) * 100, 1)
    else:
        stats["maskRate"] = 0
    
    return {
        "success": True,
        "detections": detections,
        "stats": stats,
        "imageWidth": image.shape[1],
        "imageHeight": image.shape[0]
    }


def main():
    """Main entry point - reads from stdin, writes to stdout."""
    try:
        # Read base64 image from stdin
        input_data = sys.stdin.read().strip()
        
        if not input_data:
            result = {"success": False, "error": "No input received"}
        else:
            # Parse JSON input
            try:
                data = json.loads(input_data)
                base64_image = data.get("image", input_data)
            except json.JSONDecodeError:
                base64_image = input_data
            
            # Decode and process
            image = decode_image(base64_image)
            result = run_inference(image)
            
    except FileNotFoundError as e:
        result = {"success": False, "error": f"Model not found: {str(e)}"}
    except Exception as e:
        result = {"success": False, "error": str(e)}
    
    # Output JSON result
    print(json.dumps(result))
    sys.stdout.flush()


if __name__ == "__main__":
    main()
