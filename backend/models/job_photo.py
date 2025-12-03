"""
Job photo models for contractor jobs
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JobPhoto(BaseModel):
    id: str
    contractor_id: str
    job_id: str
    url: str
    category: str  # 'before', 'progress', 'after', 'issue'
    caption: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class JobPhotoUpdateRequest(BaseModel):
    caption: Optional[str] = None
    notes: Optional[str] = None
