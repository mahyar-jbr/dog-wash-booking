# Admin Dashboard

Admin interface for managing PetValu dog wash bookings.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **JavaScript/JSX** - Language

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` (or next available port) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Features

- **Login System** - Password-protected access with modern UI (Password: `petvalu2413`)
- **Booking Management** - View, edit, and delete bookings with intuitive dialogs
- **Date Filtering** - Filter bookings by date with clear filter button
- **Stats Dashboard** - Real-time booking statistics with gradient cards
- **Modern UI/UX** - Gradient design, rounded corners, smooth transitions, and desktop-optimized layout
- **Responsive Design** - Material-UI components with custom styling

## Project Structure

```
src/
├── main.jsx                    # App entry point
├── App.jsx                     # Root component with theme
├── components/
│   ├── Login.jsx              # Login page
│   ├── Dashboard.jsx          # Main dashboard with booking table
│   ├── EditBookingModal.jsx   # Edit booking dialog
│   └── DeleteConfirmDialog.jsx # Delete confirmation dialog
```

## Current Status

Currently using **mock data** for development. Will integrate with backend API when ready.

## API Integration (To Do)

Update Dashboard.jsx to connect to backend endpoints:
- GET `/api/bookings` - Fetch all bookings
- PUT `/api/bookings/{id}` - Update booking
- DELETE `/api/bookings/{id}` - Delete booking
- POST `/api/bookings` - Create new booking

## Development Roadmap

### Final Vision
**Timeline Table View** - A table-like format showing booking schedules for **two tubs** with easy drag-and-drop management, timeline visualization, and quick booking controls. Customers either show up or call to cancel (no status tracking needed).

---

### Phase 1: Core Features (Completed ✅)
- [x] Set up React project with Vite
- [x] Install and configure Material-UI
- [x] Create Login component with password authentication
- [x] Build Dashboard with basic booking table
- [x] Implement date filtering
- [x] Create EditBookingModal for updating bookings
- [x] Add DeleteConfirmDialog with confirmation
- [x] Set up mock data for testing
- [x] **Modern UI/UX Design** (Completed)
  - Modern gradient design system (purple/pink theme)
  - Desktop-optimized full-width responsive layout
  - Enhanced login with password visibility toggle and error alerts
  - Dashboard with gradient header, stats cards, and modern table
  - Rounded corners, shadows, and smooth transitions throughout
  - Tooltips and hover effects for better user feedback

### Phase 2: Essential Features (To Do)
- [ ] **Add "Create New Booking" functionality**
  - Add "+ New Booking" button to Dashboard
  - Modify EditBookingModal to handle both create and edit modes
  - Generate new booking IDs
  - Add tub selection (Tub 1 or Tub 2)
  - Add validation for required fields

- [ ] **Remove Status System**
  - Remove status chips and filters from Dashboard
  - Simplify booking to: scheduled or deleted only
  - Remove cancelled/pending states from code

- [ ] **Add Search Functionality**
  - Add search box to filter by customer name or contact
  - Implement real-time search

- [ ] **Improve Form Validation**
  - Add email/phone format validation
  - Prevent booking conflicts (same time slot, same tub)
  - Show helpful error messages

### Phase 3: Backend Integration (Day 3+)
- [ ] **Connect to Backend API**
  - Replace mock data with API calls
  - Implement `fetchBookings()` using GET `/api/bookings`
  - Implement `createBooking()` using POST `/api/bookings`
  - Implement `updateBooking()` using PUT `/api/bookings/{id}`
  - Implement `deleteBooking()` using DELETE `/api/bookings/{id}`
  - Update booking object to include tub field

- [ ] **Add Loading States**
  - Show loading spinner while fetching data
  - Disable buttons during API calls
  - Handle network errors gracefully

- [ ] **Add Error Handling**
  - Display error messages for failed API calls
  - Add retry mechanism
  - Show user-friendly error notifications

### Phase 4: Timeline View & Advanced Features
- [ ] **Build Timeline View for Two Tubs**
  - Create timeline component showing both tubs side-by-side
  - Display bookings as blocks on timeline (by time)
  - Show time slots (9 AM - 6 PM or operating hours)
  - Color-code bookings by tub
  - Show customer name and duration on timeline blocks

- [ ] **Add Timeline Interactions**
  - Click booking block to edit
  - Visual indication of time conflicts
  - Show available/booked time slots clearly
  - Quick add booking by clicking empty time slot

- [ ] **Polish & UX Improvements**
  - Add booking count statistics (total bookings today)
  - Add date range picker for viewing multiple days
  - Add export to CSV functionality
  - Improve mobile responsiveness
  - Add confirmation messages for actions (success toasts)
  - Add print-friendly view for daily schedule

### Phase 5: Testing & Deployment
- [ ] Test all features with real backend
- [ ] Fix any bugs found during testing
- [ ] Build production bundle
- [ ] Deploy to hosting platform
- [ ] Share with team for feedback

## Learning Goals (For Me)

### React Concepts to Master:
1. **Components & Props** - Understanding how data flows
2. **State Management** - Using useState effectively
3. **Event Handling** - onClick, onChange, forms
4. **Conditional Rendering** - Showing/hiding UI elements
5. **Lists & Keys** - Rendering arrays with .map()
6. **useEffect Hook** - For API calls and side effects
7. **API Integration** - fetch(), async/await
8. **Error Handling** - try/catch, error states


## Notes

- Mock data includes 5 sample bookings for testing
- All features are fully functional with local state management
- Ready for backend integration
- Password: `petvalu2413` (hardcoded for beta)
- System simplified: no status tracking (customers show up or cancel)
- Two tubs need to be tracked and displayed in timeline view
