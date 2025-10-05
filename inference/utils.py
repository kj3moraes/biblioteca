import cv2
import numpy as np
from PIL import Image
from typing import List
import base64
from openai import OpenAI
import os
import logging
import io

from schema import BookInfo

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("biblioteca_api")

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY)

def bytes_to_np_img(data: bytes) -> np.ndarray:
    return np.array(Image.open(io.BytesIO(data)).convert("RGB"))

def np_to_pil(arr: np.ndarray) -> Image.Image:
    return Image.fromarray(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB))

def encode_pil_to_b64(img: Image.Image, fmt: str = "PNG") -> str:
    buf = io.BytesIO()
    img.save(buf, format=fmt, optimize=True)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def extract_book_crops(image: np.ndarray, bboxes: np.ndarray) -> List[Image.Image]:
    """Extract individual book crops from bounding boxes"""
    crops = []
    for bbox in bboxes:
        x1, y1, x2, y2 = bbox.astype(int)
        # Add some padding around the bounding box
        padding = 10
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(image.shape[1], x2 + padding)
        y2 = min(image.shape[0], y2 + padding)
        
        crop = image[y1:y2, x1:x2]
        if crop.size > 0:  # Make sure crop is not empty
            crops.append(Image.fromarray(crop))
    return crops

def get_author_and_title(b64img: str) -> dict:
    """Extract author and title from a book image using GPT Vision"""
    try:
        completion = client.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        { 
                            "type": "text",
                            "text": """
                                    This is an image of a book. Extract the name of the author and the title and give me back a
                                    JSON dictionary of the following format {'author': '', 'title': ''}. If you see multiple books,
                                    return the book that is most promiment. If you cannot find out the author and
                                    title, return an empty dictionary
                                    """,
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{b64img}",
                            },
                        }, 
                    ],
                }
            ],
            response_format=BookInfo
        )
        result = completion.choices[0].message.parsed
        return {"author": result.author, "title": result.title}
    except Exception as e:
        logger.error(f"The error in OCR was {e}")
        return {"author": "", "title": ""}

