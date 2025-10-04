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

from schema import PredictBody, PredictOut
from utils import bytes_to_np_img

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY)
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

@app.post("/api/predict")
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
    
    with torch.inference_mode():
        logger.info(f"Batch object detection for images")
        results = detect_model.predict(
            np_images,
            device=DEVICE,
            verbose=False
        )
        for result in results:
            bboxes = result.boxes.xyxy.detach().cpu().numpy()
        
         
             
        return {"results": "completed"}
    return {"results": []}
