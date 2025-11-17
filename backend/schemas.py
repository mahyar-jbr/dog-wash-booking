from datetime import date, time, datetime
from typing import Optional, List, Literal

from pydantic import BaseModel, field_validator

BookingStatus = Literal["confirmed", "completed", "cancelled"]


class BookingBase(BaseModel):
    customer_name: str
    customer_contact: str
    date: date
    time: time
    duration: int
    status: BookingStatus = "confirmed"

    @field_validator("duration")
    @classmethod
    def duration_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("duration must be positive (minutes)")
        return v


class BookingCreate(BookingBase):
    # same fields as base for now
    pass


class BookingUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_contact: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    duration: Optional[int] = None
    status: Optional[BookingStatus] = None

    @field_validator("duration")
    @classmethod
    def duration_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v <= 0:
            raise ValueError("duration must be positive (minutes)")
        return v


class BookingRead(BookingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2: replaces orm_mode = True


class AvailableSlot(BaseModel):
    start_time: time
    end_time: time


class AvailableSlotsResponse(BaseModel):
    date: date
    duration: int
    slots: List[AvailableSlot]
