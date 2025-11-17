from datetime import time, date as date_type
from typing import List, Tuple

from sqlalchemy.orm import Session

from .models import Booking

# PetValu dog wash hours (you can tweak)
OPENING_HOUR = 9   # 09:00
CLOSING_HOUR = 21  # 21:00 (9 PM)
SLOT_GRANULARITY_MIN = 30  # generate slots every 30 minutes


def time_to_minutes(t: time) -> int:
    return t.hour * 60 + t.minute


def minutes_to_time(m: int) -> time:
    return time(hour=m // 60, minute=m % 60)


def bookings_for_date(db: Session, target_date: date_type) -> List[Booking]:
    return (
        db.query(Booking)
        .filter(Booking.date == target_date)
        .filter(Booking.status == "confirmed")
        .all()
    )


def is_range_free(start_min: int, duration: int, existing: List[Booking]) -> bool:
    """Check if [start, end) interval overlaps any existing confirmed booking."""
    end_min = start_min + duration

    for b in existing:
        b_start = time_to_minutes(b.time)
        b_end = b_start + b.duration
        # If they overlap, it's not free
        if not (end_min <= b_start or start_min >= b_end):
            return False
    return True


def get_available_slots(
    db: Session,
    target_date: date_type,
    duration: int
) -> List[Tuple[time, time]]:
    existing = bookings_for_date(db, target_date)

    open_min = OPENING_HOUR * 60
    close_min = CLOSING_HOUR * 60

    slots: List[Tuple[time, time]] = []
    current = open_min

    while current + duration <= close_min:
        if is_range_free(current, duration, existing):
            start_t = minutes_to_time(current)
            end_t = minutes_to_time(current + duration)
            slots.append((start_t, end_t))
        current += SLOT_GRANULARITY_MIN

    return slots


def check_double_booking(
    db: Session,
    *,
    booking_date: date_type,
    booking_time: time,
    duration: int,
    ignore_booking_id: int | None = None,
) -> bool:
    """
    Returns True if there IS a conflict (double-booking).
    """
    start_min = time_to_minutes(booking_time)
    end_min = start_min + duration

    q = db.query(Booking).filter(
        Booking.date == booking_date,
        Booking.status == "confirmed"
    )
    if ignore_booking_id is not None:
        q = q.filter(Booking.id != ignore_booking_id)

    existing = q.all()

    return not is_range_free(start_min, duration, existing)
