# BookMyShow-lite API Contract Specification

> **Base URL:** `/api/v1`  
> **Conventions:**
> - Money: Integer Paise (`paise`, e.g., 25000 = ₹250.00)
> - Timestamps: UTC `ISO 8601` (`YYYY-MM-DDTHH:mm:ss.sssZ`)
> - IDs: UUID v4
> - Error Format: `{ "success": false, "error": { "code": string, "message": string, "details": [] } }`

---

## 1. System Health

### `GET /health`
- **Access:** Public
- **Description:** Server liveness and uptime check.
- **Response `200 OK`:**
  ```json
  {
    "status": "Online",
    "message": "Server is healthy and running smoothly",
    "timestamp": "2026-10-22T10:00:00.000Z",
    "uptime": 120.45
  }
  ```

---

## 2. Authentication & Authorization (Phase 1)

### `POST /api/v1/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "full_name": "Keval Chandiwala",
    "username": "keval_dev",
    "email": "keval@example.com",
    "password": "StrongPassword@123",
    "confirm_password": "StrongPassword@123"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "full_name": "Keval Chandiwala",
      "username": "keval_dev",
      "email": "keval@example.com",
      "role": "customer",
      "email_verified": false
    }
  }
  ```

### `GET /api/v1/auth/username-availability?username=keval_dev`
- **Access:** Public
- **Response `200 OK`:**
  ```json
  {
    "available": false,
    "suggestions": ["keval_dev42", "keval.dev", "keval_dev_07"]
  }
  ```

### `POST /api/v1/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "keval@example.com",
    "password": "StrongPassword@123"
  }
  ```
- **Response `200 OK`:** Sets `refreshToken` HTTP-only cookie.
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "user": {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "username": "keval_dev",
        "role": "customer"
      }
    }
  }
  ```

### `POST /api/v1/auth/refresh`
- **Access:** Public (requires HTTP-only refresh cookie)
- **Response `200 OK`:** New access token + rotated refresh token.

### `POST /api/v1/auth/logout`
- **Access:** Authenticated
- **Response `200 OK`:** Clears refresh cookie & revokes token in DB.

### `POST /api/v1/auth/verify-email`
- **Access:** Public
- **Request Body:** `{ "token": "64_char_hex_token" }`
- **Response `200 OK`:** `{ "success": true, "message": "Email verified successfully" }`

### `POST /api/v1/auth/resend-verification`
- **Access:** Public
- **Request Body:** `{ "email": "keval@example.com" }`
- **Response `200 OK`:** Generic response to prevent email enumeration.

### `POST /api/v1/auth/forgot-password`
- **Access:** Public
- **Request Body:** `{ "email": "keval@example.com" }`
- **Response `200 OK`:** Generic message (avoids account enumeration).

### `POST /api/v1/auth/reset-password`
- **Access:** Public
- **Request Body:** `{ "token": "...", "new_password": "...", "confirm_password": "..." }`
- **Response `200 OK`:** `{ "success": true, "message": "Password reset successfully" }`

### `GET /api/v1/users/me`
- **Access:** Authenticated
- **Response `200 OK`:** Profile details of the logged-in user.

### `PATCH /api/v1/users/me`
- **Access:** Authenticated
- **Request Body:** `{ "full_name": "Keval C." }`

### `POST /api/v1/users/me/change-password`
- **Access:** Authenticated
- **Request Body:** `{ "current_password": "...", "new_password": "...", "confirm_password": "..." }`

---

## 3. Catalog (Cities, Venues, Screens, Movies, Shows) (Phase 2)

### `GET /api/v1/cities`
- **Access:** Public
- **Response `200 OK`:** List of active cities.

### `POST /api/v1/admin/cities`
- **Access:** Admin
- **Request Body:** `{ "name": "Mumbai", "state": "Maharashtra" }`

### `POST /api/v1/organizer/venues`
- **Access:** Organizer
- **Request Body:**
  ```json
  {
    "city_id": "uuid",
    "name": "PVR Icon Infiniti Mall",
    "address": "Andheri West, Mumbai",
    "contact_phone": "+919876543210"
  }
  ```

### `GET /api/v1/venues`
- **Access:** Public (Filter by `city_id`)

### `POST /api/v1/organizer/venues/:venueId/screens`
- **Access:** Organizer
- **Request Body:** `{ "screen_number": 1, "name": "IMAX Laser" }`

### `POST /api/v1/organizer/screens/:screenId/seats`
- **Access:** Organizer (Bulk seat generation)
- **Request Body:**
  ```json
  {
    "seats": [
      { "row_label": "A", "seat_number": 1, "seat_type": "VIP" },
      { "row_label": "A", "seat_number": 2, "seat_type": "VIP" }
    ]
  }
  ```

### `GET /api/v1/movies`
- **Access:** Public (Filters: `city_id`, `language`, `search`)

### `GET /api/v1/movies/:movieId`
- **Access:** Public
- **Response `200 OK`:** Detailed movie metadata.

### `POST /api/v1/admin/movies`
- **Access:** Admin
- **Request Body:**
  ```json
  {
    "title": "Inception",
    "description": "Dream within a dream heist",
    "duration_mins": 148,
    "release_date": "2010-07-16",
    "language": "English",
    "certification": "UA"
  }
  ```

### `POST /api/v1/organizer/shows`
- **Access:** Organizer
- **Request Body:**
  ```json
  {
    "screen_id": "uuid",
    "movie_id": "uuid",
    "start_time": "2026-10-25T14:30:00.000Z",
    "end_time": "2026-10-25T17:30:00.000Z",
    "base_price_paise": 25000
  }
  ```

### `GET /api/v1/shows`
- **Access:** Public (Query: `movie_id`, `city_id`, `date`)

---

## 4. Ticketing & Concurrency (Phase 3 & 4)

### `GET /api/v1/shows/:showId/seats`
- **Access:** Public
- **Description:** Real-time seat layout showing status (`AVAILABLE`, `LOCKED`, `BOOKED`).

### `POST /api/v1/shows/:showId/lock-seats`
- **Access:** Customer
- **Description:** Distributed lock (Redis) or pessimistic DB lock (`SELECT FOR UPDATE`) to hold seats for 10 minutes.
- **Request Body:**
  ```json
  {
    "seat_ids": ["uuid-seat-1", "uuid-seat-2"]
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "lock_id": "uuid",
      "locked_until": "2026-10-25T14:40:00.000Z",
      "total_amount_paise": 50000
    }
  }
  ```

### `POST /api/v1/bookings`
- **Access:** Customer
- **Description:** Converts locked seats into a `PENDING` booking and initiates order.
- **Request Body:** `{ "lock_id": "uuid" }`

### `GET /api/v1/bookings/:bookingId`
- **Access:** Customer / Admin
- **Description:** View booking details, tickets, and QR/status.

---

## 5. Payments & Webhooks (Phase 5)

### `POST /api/v1/payments/create-order`
- **Access:** Customer
- **Request Body:** `{ "booking_id": "uuid" }`
- **Response `200 OK`:** Razorpay `order_id` & checkout keys.

### `POST /api/v1/payments/webhook`
- **Access:** Public (HMAC SHA256 Signature verification)
- **Description:** Listens to `payment.captured` & `payment.failed` to finalize booking idempotently.

### `POST /api/v1/bookings/:bookingId/cancel`
- **Access:** Customer
- **Description:** Cancels booking (if within cancellation window) and triggers automated refund in paise.

---

## 6. Standard Error Response Shape

All non-2xx responses follow this exact schema:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ]
  }
}
```
