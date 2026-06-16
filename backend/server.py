from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date as date_cls, timedelta
import resend
import jwt
import bcrypt
import httpx
import json
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# JWT & Resend config
JWT_SECRET = os.environ.get("JWT_SECRET", "secret")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL")
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH")

resend.api_key = RESEND_API_KEY

app = FastAPI(title="TZOUL BARBER API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ------------------------------------------------------------------------
# Static data: services, barbers, business info
# ------------------------------------------------------------------------
SERVICES = [
    {"id": "haircut", "name": "Haircut", "duration": 30, "price": 20,
     "description": "A timeless haircut, executed with precision and finesse. Subtle, sharp, and effortlessly refined.",
     "category": "Hair"},
    {"id": "kids-haircut", "name": "Kids Haircut", "duration": 30, "price": 15,
     "description": "A precise, comfortable cut tailored for younger clients.",
     "category": "Hair"},
    {"id": "haircut-beard", "name": "Haircut & Beard", "duration": 35, "price": 25,
     "description": "A timeless haircut with a sculpted beard trim included.",
     "category": "Hair"},
    {"id": "beard-trim", "name": "Beard Trim", "duration": 15, "price": 10,
     "description": "Sharp lines, clean contours. Pure definition.",
     "category": "Beard"},
    {"id": "vip-haircut", "name": "VIP Haircut", "duration": 45, "price": 30,
     "description": "One-on-one haircut with a master barber inside our private grooming suite.",
     "category": "VIP"},
    {"id": "vip-haircut-beard", "name": "VIP Haircut & Beard", "duration": 60, "price": 40,
     "description": "Private suite. Master barber. Haircut and beard refined to perfection.",
     "category": "VIP"},
    {"id": "head-wash", "name": "Refreshing Head Wash", "duration": 10, "price": 5,
     "description": "A soothing cleanse with a relaxing scalp massage.",
     "category": "Care"},
    {"id": "eyebrows", "name": "Eyebrows Shaping", "duration": 10, "price": 10,
     "description": "Precise eyebrow shaping to frame the face.",
     "category": "Care"},
    {"id": "black-mask", "name": "Black Mask Therapy", "duration": 15, "price": 15,
     "description": "Purifying mask that targets blackheads and clears pores.",
     "category": "Care"},
    {"id": "grooming-deluxe", "name": "Grooming Deluxe Experience", "duration": 60, "price": 55,
     "description": "Tailored haircut, clay mask, black mask, and facial waxing — all in private.",
     "category": "VIP"},
    {"id": "deep-face", "name": "Deep Face Cleaning", "duration": 30, "price": 30,
     "description": "A clinical-grade cleansing treatment for renewed skin.",
     "category": "Care"},
]

BARBERS = [
    {"id": "pavlos", "name": "PAVLOS", "role": "Founder",
     "bio": "Founder of TZOUL BARBER. Known for precision fades and architectural cuts.",
     "image": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=900&q=85&auto=format&fit=crop",
     "service_ids": []},  # empty list = offers ALL services (backward-compatible)
]

# Hours by weekday (Mon=0 .. Sun=6). None = closed.
HOURS = {
    0: None,            # Monday closed
    1: ("11:00", "21:00"),  # Tuesday
    2: ("11:00", "18:00"),  # Wednesday
    3: ("11:00", "21:00"),  # Thursday
    4: ("11:00", "21:00"),  # Friday
    5: ("11:00", "21:00"),  # Saturday
    6: None,            # Sunday closed
}

BUSINESS = {
    "name": "TZOUL BARBER",
    "address": "Leoforos Irakleiou 526, Athens, Heraklion 14122",
    "phone": "+30 21 1218 0303",
    "email": "tzoulbarber@gmail.com",
    "instagram": "https://www.instagram.com/tzoulian_haircutz",
    "rating": 4.8,
    "reviews_count": 90,
    "tagline": "Step into luxury grooming.",
    "hours_label": {
        "Monday": "Closed",
        "Tuesday": "11:00 — 21:00",
        "Wednesday": "11:00 — 18:00",
        "Thursday": "11:00 — 21:00",
        "Friday": "11:00 — 21:00",
        "Saturday": "11:00 — 21:00",
        "Sunday": "Closed",
    },
}

# ------------------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------------------
class BookingCreate(BaseModel):
    service_id: str
    barber_id: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=5, max_length=40)
    email: Optional[EmailStr] = None
    notes: Optional[str] = Field(default=None, max_length=500)


class Booking(BookingCreate):
    id: str
    service_name: str
    barber_name: str
    price: int
    duration: int
    status: str = "confirmed"
    created_at: str


class BookingUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------
def _find_service(sid: str):
    return next((s for s in SERVICES if s["id"] == sid), None)


def _find_barber(bid: str):
    return next((b for b in BARBERS if b["id"] == bid), None)


def _slots_for_day(d: date_cls, step_min: int = 30) -> List[str]:
    hrs = HOURS.get(d.weekday())
    if not hrs:
        return []
    open_h, open_m = [int(x) for x in hrs[0].split(":")]
    close_h, close_m = [int(x) for x in hrs[1].split(":")]
    start = open_h * 60 + open_m
    end = close_h * 60 + close_m
    out = []
    t = start
    while t + step_min <= end:
        out.append(f"{t // 60:02d}:{t % 60:02d}")
        t += step_min
    return out


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token and return payload"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def send_confirmation_email(booking: dict):
    """Send booking confirmation email via Resend"""
    if not booking.get("email"):
        return
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #E63329; color: white; padding: 30px; text-align: center; }}
            .content {{ background-color: #f5f5f5; padding: 30px; }}
            .booking-details {{ background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #E63329; }}
            .detail-row {{ padding: 10px 0; border-bottom: 1px solid #eee; }}
            .label {{ font-weight: bold; color: #666; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>TZOUL BARBER</h1>
                <p>Your Reservation is Confirmed</p>
            </div>
            <div class="content">
                <p>Hello {booking['name']},</p>
                <p>Thank you for booking with TZOUL BARBER. Your reservation has been confirmed.</p>
                
                <div class="booking-details">
                    <h2 style="margin-top: 0; color: #E63329;">Booking Details</h2>
                    <div class="detail-row">
                        <span class="label">Service:</span> {booking['service_name']}
                    </div>
                    <div class="detail-row">
                        <span class="label">Barber:</span> {booking['barber_name']}
                    </div>
                    <div class="detail-row">
                        <span class="label">Date:</span> {booking['date']}
                    </div>
                    <div class="detail-row">
                        <span class="label">Time:</span> {booking['time']}
                    </div>
                    <div class="detail-row">
                        <span class="label">Duration:</span> {booking['duration']} minutes
                    </div>
                    <div class="detail-row">
                        <span class="label">Price:</span> €{booking['price']}
                    </div>
                    <div class="detail-row">
                        <span class="label">Reference:</span> {booking['id'][:8].upper()}
                    </div>
                </div>
                
                <p><strong>Location:</strong><br>
                Leoforos Irakleiou 526, Athens, Heraklion 14122</p>
                
                <p><strong>Contact:</strong><br>
                Phone: +30 21 1218 0303<br>
                Email: tzoulbarber@gmail.com</p>
                
                <p style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
                    <strong>Important:</strong> To reschedule or cancel, please call us at least 2 hours before your appointment.
                </p>
            </div>
            <div class="footer">
                <p>TZOUL BARBER - Tradition meets street culture</p>
                <p>© 2026 TZOUL BARBER. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [booking["email"]],
            "subject": f"Booking Confirmation - TZOUL BARBER - {booking['date']} at {booking['time']}",
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Confirmation email sent to {booking['email']}")
    except Exception as e:
        logging.error(f"Failed to send confirmation email: {str(e)}")


# ------------------------------------------------------------------------
# Public Routes
# ------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"name": "TZOUL BARBER API", "status": "ok"}


@api_router.get("/business")
async def get_business():
    return BUSINESS


@api_router.get("/services")
async def get_services():
    return SERVICES


@api_router.get("/barbers")
async def get_barbers(service_id: Optional[str] = None):
    """Public list of barbers. If `service_id` is provided, returns only barbers
    that offer that service. Empty `service_ids` on a barber means "offers all"."""
    if not service_id:
        return BARBERS
    return [b for b in BARBERS if not b.get("service_ids") or service_id in b["service_ids"]]


@api_router.get("/availability")
async def get_availability(date: str, barber_id: Optional[str] = None):
    try:
        d = date_cls.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date. Use YYYY-MM-DD.")
    
    # Check if there's a custom schedule for this barber on this date
    if barber_id:
        custom_schedule = await db.schedules.find_one({
            "barber_id": barber_id,
            "date": date
        }, {"_id": 0})
        
        if custom_schedule:
            slots = custom_schedule.get("time_slots", [])
        else:
            slots = _slots_for_day(d)
    else:
        slots = _slots_for_day(d)
    
    if not slots:
        return {"date": date, "open": False, "slots": []}

    # remove already booked slots
    query = {"date": date, "status": "confirmed"}
    if barber_id:
        query["barber_id"] = barber_id
    taken_cursor = db.bookings.find(query, {"_id": 0, "time": 1})
    taken = {doc["time"] async for doc in taken_cursor}
    available = [s for s in slots if s not in taken]
    return {"date": date, "open": True, "slots": available}


@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate):
    service = _find_service(payload.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    barber = _find_barber(payload.barber_id)
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")
    try:
        d = date_cls.fromisoformat(payload.date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date.")

    valid_slots = _slots_for_day(d)
    if payload.time not in valid_slots:
        raise HTTPException(status_code=400, detail="Time slot not within opening hours.")

    # Check conflict
    conflict = await db.bookings.find_one({
        "date": payload.date,
        "time": payload.time,
        "barber_id": payload.barber_id,
        "status": "confirmed",
    })
    if conflict:
        raise HTTPException(status_code=409, detail="This time slot is no longer available.")

    booking_id = str(uuid.uuid4())
    doc = {
        "id": booking_id,
        **payload.model_dump(),
        "service_name": service["name"],
        "barber_name": barber["name"],
        "price": service["price"],
        "duration": service["duration"],
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.insert_one(doc)
    doc.pop("_id", None)
    
    # Send confirmation email asynchronously
    asyncio.create_task(send_confirmation_email(doc))
    
    return Booking(**doc)


@api_router.get("/bookings")
async def list_bookings(limit: int = 100):
    cursor = db.bookings.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    return [doc async for doc in cursor]


# Testimonials (Google reviews snapshot)
TESTIMONIALS = [
    {"name": "Vagelis Drivas", "rating": 5, "source": "Google",
     "text": "Best barbershop in Athens. The space feels like a five-star hotel — the cut is always immaculate."},
    {"name": "George Georgoulakis", "rating": 5, "source": "Google",
     "text": "Beyond the incredibly helpful staff that immediately puts you at ease, the space feels like a 5-star hotel. Spotlessly clean, fast service, perfect result. Highly recommended."},
    {"name": "Xrhstos Tsaparas", "rating": 5, "source": "Google",
     "text": "An excellent men's salon. Outstanding service, real care, and true experts in men's haircuts."},
    {"name": "Αλέξανδρος", "rating": 5, "source": "Google",
     "text": "Incredible service and very kind staff."},
    {"name": "Vicky", "rating": 5, "source": "Google",
     "text": "Excellent service."},
    {"name": "Labros Saliveros", "rating": 5, "source": "Google",
     "text": "Sharp, clean, on time — and you leave looking better than you've ever felt."},
]


@api_router.get("/testimonials")
async def get_testimonials():
    return TESTIMONIALS


# ------------------------------------------------------------------------
# Admin Routes
# ------------------------------------------------------------------------
@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    """Admin login with JWT token generation"""
    if credentials.email != ADMIN_EMAIL:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    password_bytes = credentials.password.encode('utf-8')
    hash_bytes = ADMIN_PASSWORD_HASH.encode('utf-8')
    
    if not bcrypt.checkpw(password_bytes, hash_bytes):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate JWT token (expires in 24 hours)
    expiration = datetime.now(timezone.utc) + timedelta(hours=24)
    token = jwt.encode(
        {"email": credentials.email, "exp": expiration},
        JWT_SECRET,
        algorithm="HS256"
    )
    
    return AdminToken(access_token=token)


@api_router.get("/admin/bookings")
async def admin_list_bookings(
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    admin: dict = Depends(verify_token)
):
    """Get all bookings with optional filters"""
    query = {}
    
    if status:
        query["status"] = status
    
    if date_from:
        query["date"] = {"$gte": date_from}
    
    if date_to:
        if "date" in query:
            query["date"]["$lte"] = date_to
        else:
            query["date"] = {"$lte": date_to}
    
    cursor = db.bookings.find(query, {"_id": 0}).sort("date", -1).sort("time", 1)
    bookings = [doc async for doc in cursor]
    return bookings


@api_router.get("/admin/bookings/{booking_id}")
async def admin_get_booking(booking_id: str, admin: dict = Depends(verify_token)):
    """Get a specific booking by ID"""
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@api_router.patch("/admin/bookings/{booking_id}")
async def admin_update_booking(
    booking_id: str,
    update: BookingUpdate,
    admin: dict = Depends(verify_token)
):
    """Update/reschedule a booking"""
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    # If rescheduling, check availability
    if "date" in update_data or "time" in update_data:
        new_date = update_data.get("date", booking["date"])
        new_time = update_data.get("time", booking["time"])
        
        # Check if new slot is available
        conflict = await db.bookings.find_one({
            "date": new_date,
            "time": new_time,
            "barber_id": booking["barber_id"],
            "status": "confirmed",
            "id": {"$ne": booking_id}
        })
        if conflict:
            raise HTTPException(status_code=409, detail="This time slot is not available")
    
    if update_data:
        await db.bookings.update_one({"id": booking_id}, {"$set": update_data})
    
    updated_booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    return updated_booking


@api_router.delete("/admin/bookings/{booking_id}")
async def admin_cancel_booking(booking_id: str, admin: dict = Depends(verify_token)):
    """Cancel a booking"""
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": "cancelled"}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking cancelled successfully"}


# ------------------------------------------------------------------------
# Admin Service Management
# ------------------------------------------------------------------------
class ServiceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    duration: int = Field(gt=0, le=180)
    price: int = Field(gt=0)
    description: str = Field(max_length=500)
    category: str


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    duration: Optional[int] = Field(default=None, gt=0, le=180)
    price: Optional[int] = Field(default=None, gt=0)
    description: Optional[str] = Field(default=None, max_length=500)
    category: Optional[str] = None


@api_router.get("/admin/services")
async def admin_list_services(admin: dict = Depends(verify_token)):
    """Get all services for admin management"""
    return SERVICES


@api_router.post("/admin/services")
async def admin_create_service(service: ServiceCreate, admin: dict = Depends(verify_token)):
    """Create a new service"""
    service_id = service.name.lower().replace(" ", "-").replace("&", "and")
    
    # Check if service ID already exists
    if any(s["id"] == service_id for s in SERVICES):
        raise HTTPException(status_code=400, detail="Service with this name already exists")
    
    new_service = {
        "id": service_id,
        **service.model_dump()
    }
    SERVICES.append(new_service)
    
    return new_service


@api_router.put("/admin/services/{service_id}")
async def admin_update_service(
    service_id: str,
    service: ServiceUpdate,
    admin: dict = Depends(verify_token)
):
    """Update a service"""
    service_idx = next((i for i, s in enumerate(SERVICES) if s["id"] == service_id), None)
    
    if service_idx is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = {k: v for k, v in service.model_dump().items() if v is not None}
    SERVICES[service_idx].update(update_data)
    
    return SERVICES[service_idx]


@api_router.delete("/admin/services/{service_id}")
async def admin_delete_service(service_id: str, admin: dict = Depends(verify_token)):
    """Delete a service"""
    service_idx = next((i for i, s in enumerate(SERVICES) if s["id"] == service_id), None)
    
    if service_idx is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    deleted_service = SERVICES.pop(service_idx)
    return {"message": "Service deleted successfully", "service": deleted_service}


# ------------------------------------------------------------------------
# Admin Barber Management
# ------------------------------------------------------------------------
class BarberCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    role: str = Field(min_length=2, max_length=100)
    bio: str = Field(max_length=500)
    image: str
    service_ids: Optional[List[str]] = None


class BarberUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    role: Optional[str] = Field(default=None, min_length=2, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=500)
    image: Optional[str] = None
    service_ids: Optional[List[str]] = None


@api_router.get("/admin/barbers")
async def admin_list_barbers(admin: dict = Depends(verify_token)):
    """Get all barbers for admin management"""
    return BARBERS


@api_router.post("/admin/barbers")
async def admin_create_barber(barber: BarberCreate, admin: dict = Depends(verify_token)):
    """Create a new barber"""
    barber_id = barber.name.lower().replace(" ", "-")
    
    # Check if barber ID already exists
    if any(b["id"] == barber_id for b in BARBERS):
        raise HTTPException(status_code=400, detail="Barber with this name already exists")
    
    new_barber = {
        "id": barber_id,
        **barber.model_dump(),
    }
    # Default to "offers all" when caller passed null
    if new_barber.get("service_ids") is None:
        new_barber["service_ids"] = []
    BARBERS.append(new_barber)
    
    return new_barber


@api_router.put("/admin/barbers/{barber_id}")
async def admin_update_barber(
    barber_id: str,
    barber: BarberUpdate,
    admin: dict = Depends(verify_token)
):
    """Update a barber"""
    barber_idx = next((i for i, b in enumerate(BARBERS) if b["id"] == barber_id), None)
    
    if barber_idx is None:
        raise HTTPException(status_code=404, detail="Barber not found")
    
    update_data = {k: v for k, v in barber.model_dump().items() if v is not None}
    BARBERS[barber_idx].update(update_data)
    
    return BARBERS[barber_idx]


@api_router.delete("/admin/barbers/{barber_id}")
async def admin_delete_barber(barber_id: str, admin: dict = Depends(verify_token)):
    """Delete a barber"""
    barber_idx = next((i for i, b in enumerate(BARBERS) if b["id"] == barber_id), None)
    
    if barber_idx is None:
        raise HTTPException(status_code=404, detail="Barber not found")
    
    deleted_barber = BARBERS.pop(barber_idx)
    return {"message": "Barber deleted successfully", "barber": deleted_barber}


# ------------------------------------------------------------------------
# Admin Schedule Management
# ------------------------------------------------------------------------
class ScheduleCreate(BaseModel):
    barber_id: str
    date: str  # YYYY-MM-DD
    time_slots: List[str]  # ["09:00", "09:30", "10:00", ...]
    notes: Optional[str] = None


class ScheduleUpdate(BaseModel):
    time_slots: Optional[List[str]] = None
    notes: Optional[str] = None


@api_router.get("/admin/schedules")
async def admin_list_schedules(
    barber_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    admin: dict = Depends(verify_token)
):
    """Get barber schedules with optional filters"""
    query = {}
    
    if barber_id:
        query["barber_id"] = barber_id
    
    if date_from:
        query["date"] = {"$gte": date_from}
    
    if date_to:
        if "date" in query:
            query["date"]["$lte"] = date_to
        else:
            query["date"] = {"$lte": date_to}
    
    cursor = db.schedules.find(query, {"_id": 0}).sort("date", 1)
    schedules = [doc async for doc in cursor]
    return schedules


@api_router.post("/admin/schedules")
async def admin_create_schedule(schedule: ScheduleCreate, admin: dict = Depends(verify_token)):
    """Create or update a schedule for a barber on a specific date"""
    # Validate barber exists
    barber = _find_barber(schedule.barber_id)
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")
    
    # Check if schedule already exists for this barber on this date
    existing = await db.schedules.find_one({
        "barber_id": schedule.barber_id,
        "date": schedule.date
    })
    
    schedule_id = str(uuid.uuid4())
    doc = {
        "id": existing["id"] if existing else schedule_id,
        "barber_id": schedule.barber_id,
        "barber_name": barber["name"],
        "date": schedule.date,
        "time_slots": schedule.time_slots,
        "notes": schedule.notes,
        "created_at": existing.get("created_at") if existing else datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if existing:
        await db.schedules.update_one(
            {"barber_id": schedule.barber_id, "date": schedule.date},
            {"$set": doc}
        )
    else:
        await db.schedules.insert_one(doc)
    
    doc.pop("_id", None)
    return doc


@api_router.get("/admin/schedules/{barber_id}/{date}")
async def admin_get_schedule(
    barber_id: str,
    date: str,
    admin: dict = Depends(verify_token)
):
    """Get schedule for a specific barber on a specific date"""
    schedule = await db.schedules.find_one(
        {"barber_id": barber_id, "date": date},
        {"_id": 0}
    )
    
    if not schedule:
        # Return default schedule based on HOURS
        try:
            d = date_cls.fromisoformat(date)
            default_slots = _slots_for_day(d)
            barber = _find_barber(barber_id)
            return {
                "barber_id": barber_id,
                "barber_name": barber["name"] if barber else "",
                "date": date,
                "time_slots": default_slots,
                "notes": None,
                "is_default": True
            }
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date")
    
    return schedule


@api_router.patch("/admin/schedules/{barber_id}/{date}")
async def admin_update_schedule(
    barber_id: str,
    date: str,
    update: ScheduleUpdate,
    admin: dict = Depends(verify_token)
):
    """Update a barber's schedule for a specific date"""
    schedule = await db.schedules.find_one({"barber_id": barber_id, "date": date})
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.schedules.update_one(
        {"barber_id": barber_id, "date": date},
        {"$set": update_data}
    )
    
    updated = await db.schedules.find_one({"barber_id": barber_id, "date": date}, {"_id": 0})
    return updated


@api_router.delete("/admin/schedules/{barber_id}/{date}")
async def admin_delete_schedule(
    barber_id: str,
    date: str,
    admin: dict = Depends(verify_token)
):
    """Delete a custom schedule (reverts to default hours)"""
    result = await db.schedules.delete_one({"barber_id": barber_id, "date": date})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    return {"message": "Schedule deleted, reverted to default hours"}


# ------------------------------------------------------------------------
# Instagram Posts Management
# ------------------------------------------------------------------------
class InstagramPostCreate(BaseModel):
    image_url: str
    caption: Optional[str] = None
    post_url: Optional[str] = None


class InstagramPostUpdate(BaseModel):
    image_url: Optional[str] = None
    caption: Optional[str] = None
    post_url: Optional[str] = None


@api_router.get("/instagram-posts")
async def get_instagram_posts(limit: int = 12):
    """Get Instagram posts managed via the admin panel."""
    cursor = db.instagram_posts.find({"active": True}, {"_id": 0}).sort("created_at", -1).limit(limit)
    posts = [doc async for doc in cursor]
    return posts


@api_router.get("/admin/instagram-posts")
async def admin_list_instagram_posts(admin: dict = Depends(verify_token)):
    """Get all Instagram posts for admin"""
    cursor = db.instagram_posts.find({}, {"_id": 0}).sort("created_at", -1)
    posts = [doc async for doc in cursor]
    return posts


@api_router.post("/admin/instagram-posts")
async def admin_create_instagram_post(post: InstagramPostCreate, admin: dict = Depends(verify_token)):
    """Create a new Instagram post"""
    post_id = str(uuid.uuid4())
    doc = {
        "id": post_id,
        "image_url": post.image_url,
        "caption": post.caption,
        "post_url": post.post_url,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.instagram_posts.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.patch("/admin/instagram-posts/{post_id}")
async def admin_update_instagram_post(
    post_id: str,
    update: InstagramPostUpdate,
    admin: dict = Depends(verify_token)
):
    """Update an Instagram post"""
    post = await db.instagram_posts.find_one({"id": post_id})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if update_data:
        await db.instagram_posts.update_one({"id": post_id}, {"$set": update_data})
    
    updated = await db.instagram_posts.find_one({"id": post_id}, {"_id": 0})
    return updated


@api_router.delete("/admin/instagram-posts/{post_id}")
async def admin_delete_instagram_post(post_id: str, admin: dict = Depends(verify_token)):
    """Delete an Instagram post"""
    result = await db.instagram_posts.delete_one({"id": post_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return {"message": "Post deleted successfully"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
