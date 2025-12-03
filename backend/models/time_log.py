"""
Time tracking models for contractor jobs
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TimeLog(BaseModel):
    id: str
    contractor_id: str
    job_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class TimeLogStartRequest(BaseModel):
    notes: Optional[str] = None


class TimeLogStopRequest(BaseModel):
    notes: Optional[str] = None
