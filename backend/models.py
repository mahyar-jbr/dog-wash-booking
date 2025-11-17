from sqlalchemy import Column, Integer, String, Date, Time, DateTime
from datetime import datetime

from .database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_contact = Column(String, nullable=False)
    date = Column(Date, nullable=False, index=True)
    time = Column(Time, nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    status = Column(String, nullable=False, default="confirmed")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
