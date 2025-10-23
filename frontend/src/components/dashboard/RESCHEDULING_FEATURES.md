# Rescheduling Feature Documentation

## Overview
This document describes the rescheduling functionality implemented for mechanic bookings in the Customer Dashboard.

## Features Implemented

### 1. Professional Rescheduling Process
- Customers can reschedule their mechanic bookings through a dedicated modal
- Only date and time can be changed (as per requirements)
- Reason for rescheduling is optional but encouraged
- Clear visual feedback on success or failure

### 2. Past Date Prevention
- Customers cannot select dates in the past when booking or rescheduling
- System automatically sets minimum date to current date
- Backend validation prevents past date submissions

### 3. User Experience
- Intuitive modal interface with clear instructions
- Current booking details displayed for reference
- Form validation with helpful error messages
- Loading states during API requests
- Success notifications

## Technical Implementation

### Frontend Components
1. **RescheduleModal.jsx** - Dedicated modal for rescheduling
2. **CustomerDashboard.jsx** - Integration with ActiveBookings component
3. **MechanicBooking.jsx** - Date validation in booking form

### Backend Enhancements
1. **BookingController.js** - Enhanced rescheduleBooking function with date validation
2. **Booking.js** - Improved date validation in pre-save middleware

## API Endpoints

### Reschedule Booking
```
PUT /api/bookings/:id/reschedule
```

**Request Body:**
```json
{
  "newDate": "2023-06-20",
  "newTime": "14:30",
  "reason": "Conflict with work schedule"
}
```

**Response:**
```json
{
  "message": "Booking rescheduled successfully",
  "originalBooking": { ... },
  "newBooking": { ... }
}
```

## Validation Rules

1. **Date Validation**
   - New date must be today or in the future
   - Past dates are rejected with clear error messages

2. **Authorization**
   - Only customers can reschedule their own bookings
   - Rescheduling is only allowed for bookings with "pending" status
   - Admins can reschedule any booking

3. **Business Rules**
   - New time slot must be available (no conflicts)
   - Original booking status changes to "rescheduled"
   - New booking is created with "pending" status

## User Flow

1. Customer views their active bookings in the dashboard
2. Clicks "Reschedule" button on a booking
3. Fills in new date and time in the modal
4. Optionally adds a reason
5. Submits the rescheduling request
6. Receives confirmation and dashboard updates automatically

## Error Handling

- Clear error messages for all validation failures
- Network error handling with retry options
- User-friendly notifications for success and failure cases