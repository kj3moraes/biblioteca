from pydantic import BaseModel, Field
from typing import List, Optional, Any


class PredictBody(BaseModel):
    images: Optional[List[str]] = Field(default=None, description="List of base64 images (no data URL prefix needed).")

class BookInfo(BaseModel):
    title: str
    author: str

class BookOut(BaseModel):
    title: str
    author: str
    count: int

class PredictOut(BaseModel):
    books: List[BookOut]