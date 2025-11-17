from datetime import date
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Booking
from . import schemas
from .utils import get_available_slots, check_double_booking

# Create DB tables at startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PetValu Dog Wash Booking API",
    version="0.1.0",
)

# CORS - frontends can be added here
origins = [
    "http://localhost:5173",  # Vite default (customer/frontend)
    "http://localhost:3000",  # another common dev port
    # later: add your deployed Vercel URLs
    "https://customer-frontend-url.vercel.app",
    "https://admin-dashboard-url.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# 1) Create booking
@app.post("/api/bookings", response_model=schemas.BookingRead, status_code=201)
def create_booking(
    booking_in: schemas.BookingCreate,
    db: Session = Depends(get_db),
):
    # prevent double booking
    if check_double_booking(
        db,
        booking_date=booking_in.date,
        booking_time=booking_in.time,
        duration=booking_in.duration,
    ):
        raise HTTPException(
            status_code=400,
            detail="Time slot overlaps an existing booking.",
        )

    booking = Booking(
        customer_name=booking_in.customer_name,
        customer_contact=booking_in.customer_contact,
        date=booking_in.date,
        time=booking_in.time,
        duration=booking_in.duration,
        status=booking_in.status,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


# 2) List bookings (optional ?date=YYYY-MM-DD)
@app.get("/api/bookings", response_model=List[schemas.BookingRead])
def list_bookings(
    db: Session = Depends(get_db),
    date_filter: Optional[date] = Query(default=None, alias="date"),
):
    q = db.query(Booking)
    if date_filter:
        q = q.filter(Booking.date == date_filter)
    q = q.order_by(Booking.date, Booking.time)
    return q.all()


# 3) Get single booking
@app.get("/api/bookings/{booking_id}", response_model=schemas.BookingRead)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


# 4) Update booking
@app.put("/api/bookings/{booking_id}", response_model=schemas.BookingRead)
def update_booking(
    booking_id: int,
    booking_update: schemas.BookingUpdate,
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    updated_data = booking_update.model_dump(exclude_unset=True)
    for field, value in updated_data.items():
        setattr(booking, field, value)

    # If date/time/duration/status changed and is still confirmed => check conflicts
    if any(k in updated_data for k in ("date", "time", "duration", "status")):
        if booking.status == "confirmed":
            if check_double_booking(
                db,
                booking_date=booking.date,
                booking_time=booking.time,
                duration=booking.duration,
                ignore_booking_id=booking.id,
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Updated time overlaps an existing booking.",
                )

    db.commit()
    db.refresh(booking)
    return booking


# 5) Delete/cancel booking
@app.delete("/api/bookings/{booking_id}", status_code=204)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db.delete(booking)
    db.commit()
    return None


# 6) Get available slots
@app.get("/api/available-slots", response_model=schemas.AvailableSlotsResponse)
def available_slots(
    target_date: date = Query(..., alias="date"),
    duration: int = Query(30, ge=1),
    db: Session = Depends(get_db),
):
    slots = get_available_slots(db, target_date, duration)
    slot_objs = [
        schemas.AvailableSlot(start_time=s, end_time=e) for (s, e) in slots
    ]
    return schemas.AvailableSlotsResponse(
        date=target_date,
        duration=duration,
        slots=slot_objs,
    )
