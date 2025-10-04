from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request, HTTPException
from fastapi import File, UploadFile
from ultralytics import YOLO, FastSAM
import logging
import torch
import os
from openai import OpenAI
from typing import List
import json
from collections import Counter
import numpy as np
from PIL import Image

from schema import PredictBody, PredictOut, BookInfo
from utils import bytes_to_np_img, encode_pil_to_b64, get_author_and_title, extract_book_crops

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("biblioteca_api")

app = FastAPI(
    title="Biblioteca AI Inference API",
    description="FastAPI service for YOLO and FastSAM book detection and segmentation",
    version="1.0.0",
)

detect_model = YOLO('./models/yolov9c.pt')
sam_model = YOLO('./models/FastSAM-s.pt')

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
logger.info(f"Using device: {DEVICE}")
detect_model.to(DEVICE)
sam_model.to(DEVICE)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Biblioteca AI Inference API is running!"}

@app.get("/health_check")
async def health_check():
    return {"status": "healthy", "message": "Fear is the mind killer. Fear is the little death that brings total obliteration."}

@app.post("/api/predict", response_model=PredictOut)
async def predict(request: Request, files: List[UploadFile] = File(...)):
    # Multipart path
    np_images = []
    if files:
        for f in files:
            data = await f.read()
            try:
                logger.info(f"Processing image: {f.filename}")
                np_images.append(bytes_to_np_img(data))
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid uploaded image '{f.filename}': {e}")  
    else:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    all_book_crops = []
    
    with torch.inference_mode():
        logger.info(f"Batch object detection for {len(np_images)} images")
        results = detect_model.predict(
            np_images,
            device=DEVICE,
            verbose=False
        )
        
        # Extract book crops from all images
        for i, (image, result) in enumerate(zip(np_images, results)):
            if result.boxes is not None and len(result.boxes) > 0:
                bboxes = result.boxes.xyxy.detach().cpu().numpy()
                confidences = result.boxes.conf.detach().cpu().numpy()
                
                # Filter by confidence (optional - adjust threshold as needed)
                high_conf_mask = confidences > 0.5
                filtered_bboxes = bboxes[high_conf_mask]
                
                logger.info(f"Found {len(filtered_bboxes)} books in image {i+1}")
                
                # Extract crops for this image
                crops = extract_book_crops(image, filtered_bboxes)
                all_book_crops.extend(crops)
            else:
                logger.info(f"No books detected in image {i+1}")
    
    logger.info(f"Total book crops extracted: {len(all_book_crops)}")
    
    # Batch process all crops with OCR
    book_results = []
    for i, crop in enumerate(all_book_crops):
        try:
            # Convert crop to base64
            b64_crop = encode_pil_to_b64(crop, fmt="JPEG")
            
            # Get author and title using GPT Vision
            book_info = get_author_and_title(b64_crop)
            logger.info(book_info) 
            # Only add if we got valid results
            if book_info["author"] and book_info["title"]:
                book_results.append((book_info["title"], book_info["author"]))
                logger.info(f"OCR result {i+1}: {book_info['title']} by {book_info['author']}")
            else:
                logger.warning(f"OCR failed for crop {i+1}")
                
        except Exception as e:
            logger.error(f"Error processing crop {i+1}: {e}")
            continue
    
    # Count duplicate books
    book_counter = Counter(book_results)
    
    # Convert to response format
    books = []
    for (title, author), count in book_counter.items():
        books.append({
            "title": title,
            "author": author,
            "count": count
        })
    
    logger.info(f"Final result: {len(books)} unique books found")
    
    return PredictOut(books=books)
