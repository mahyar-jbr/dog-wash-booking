# Dog Wash Booking System - PetValu

A web-based booking system for PetValu dog wash services, replacing traditional phone call bookings.

## Project Overview

**Timeline:** 1-week beta launch
**Team:** 3 developers 
- Kasra - Backend (Python FastAPI)
- Aidin - Customer Frontend
- Mahyar - Admin Dashboard (React)

## Repository Structure

```
dog-wash-booking/
├── backend/              # FastAPI backend (Kasra)
├── customer-frontend/    # Customer booking interface (Aidin)
└── admin-dashboard/      # Admin management dashboard (Mahyar)
```

## Branches

- `main` - Production-ready code
- `backend` - Backend development
- `customer-frontend` - Customer interface development
- `admin-dashboard` - Admin dashboard development

## Admin Dashboard

### Tech Stack
- React 18 + Vite
- Material-UI (MUI)
- JavaScript/JSX

### Features
- Password-protected admin login
- View all bookings in a table
- Add new bookings
- Filter bookings by date
- Edit booking details
- Delete bookings with confirmation
- Real-time status indicators

### Setup & Installation

```bash
cd admin-dashboard
npm install
npm run dev
```

The dashboard will run on `http://localhost:5173` (or next available port)

**Login Password:** `petvalu2413`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Backend API (Coming Soon)

### Endpoints
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings (supports ?date= filter)
- `GET /api/bookings/{id}` - Get single booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Delete booking
- `GET /api/available-slots` - Get free time slots

### Booking Object
```json
{
  "id": 1,
  "customer_name": "John Doe",
  "customer_contact": "john@email.com",
  "date": "2024-11-15",
  "time": "14:00",
  "duration": 60,
  "status": "confirmed",
  "created_at": "2024-11-10T10:30:00"
}
```

## License

Private - PetValu2413 Internal Project