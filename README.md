# FindMe — Photography Booking Platform

A full-stack web application connecting customers with photographers. Customers browse photographers, book events, view their photo galleries, and use AI-powered face recognition to find photos of themselves. Photographers manage bookings, upload photos, and track their business.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 7, Vite, CSS Modules |
| Backend | Node.js, Express 5 |
| Database | MySQL 2 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File uploads | Multer |
| Face recognition | Face++ API |
| UI components | MUI (Material UI) |

---

## Project Structure

```
Template-Vite-2024/
├── server/
│   ├── server.js          — Express app entry point
│   ├── db.js              — MySQL connection pool (singleton)
│   ├── .env               — Environment variables (DB, JWT, Face++ keys)
│   └── routes/
│       ├── auth.js        — Registration, login, profile management
│       └── events.js      — Events, photos, face filtering
├── src/
│   ├── main.jsx           — React entry point
│   ├── components/
│   │   ├── App/App.jsx    — Root component: auth state + routing
│   │   ├── Auth/Auth.jsx  — Login & Register pages
│   │   ├── Layout/Navbar  — Top navigation bar
│   │   ├── Customer/      — All customer-facing pages
│   │   ├── Photographer/  — All photographer-facing pages
│   │   └── Shared/        — Profile page (shared between roles)
│   └── Routes/
│       ├── CustomerRoutes.jsx      — Customer route definitions
│       └── PhotographerRoutes.jsx  — Photographer route definitions
└── server/uploads/        — Uploaded files stored here
    ├── events/<id>/       — Event photo galleries
    ├── selfies/           — Temp selfie files (deleted after scan)
    └── *.jpg / *.png      — User profile pictures
```

---

## How the App Starts

### Backend
```
node server/server.js
```
1. Loads `.env` from the `server/` directory
2. Connects to MySQL and runs two auto-migrations:
   - Adds `customer_rating` column if missing
   - Adds `notes` column if missing
3. Mounts `/api/auth` and `/api/events` routers
4. Serves uploaded files statically at `/uploads`
5. A 4-argument error handler at the bottom always returns JSON errors (never HTML)

### Frontend
```
npm run start   →   vite dev server on port 3000
```

---

## Authentication Flow

```
User visits app
    ↓
App.jsx checks localStorage for "token"
    ↓ (token exists)
GET /api/auth/me  →  verifies JWT  →  returns user object
    ↓
setUser(data.user)  →  React renders correct role routes
```

**Login:** `POST /api/auth/login`
- Finds user by email
- `bcrypt.compare(password, user.password)` — verifies hashed password
- Returns JWT signed with `JWT_SECRET` (expires in 7 days)
- Frontend stores token in `localStorage`

**Register:** `POST /api/auth/register`
- `bcrypt.hash(password, 10)` — hashes password before saving
- Creates user row with role (`customer` or `photographer`)
- Returns JWT immediately (user is logged in after register)

**Token usage:** Every protected API call includes `Authorization: Bearer <token>` header. The `verifyToken` middleware in Express decodes it and attaches `req.user`.

---

## Role-Based Routing

`App.jsx` is the single source of truth for the logged-in user. It passes `user` and `setUser` down to route trees.

```
/login            →  LoginPage (public)
/register         →  RegisterPage (public)
/customer/*       →  CustomerRoutes   (requires userType === "customer")
/photographer/*   →  PhotographerRoutes (requires userType === "photographer")
/                 →  redirects to /customer or /photographer based on role
*                 →  redirects to /
```

If a user tries to access the wrong role's route, they are redirected to `/login`.

---

## Customer Pages

| Route | Component | Purpose |
|---|---|---|
| `/customer` | `CustomerDashboard` | Overview: upcoming events, quick links |
| `/customer/explore` | `PhotographerExplore` | Browse & search photographers |
| `/customer/photographer/:id` | `PhotographerProfile` | View profile, send event proposal |
| `/customer/events` | `CustomerEventsPage` | All events with status tracking + details modal |
| `/customer/gallery/:eventId` | `GalleryPage (isCustomer=true)` | View photos, selfie face-filter, multi-select download |
| `/customer/profile` | `ProfilePage` | Edit username, email, city, profile picture |

### Key Customer Functions

**`PhotographerProfile` — Send Event Proposal**
```
Customer fills form (event type, date, location, notes)
    ↓
POST /api/events  { photographerId, name, date, place, notes }
    ↓
Event created with status = "pending"
```

**`CustomerEventsPage` — Details Modal**
- Shows date, location, photographer name, notes written at booking
- Shows a live status timeline: Sent → Approved → Completed
- "⭐ דרג" button appears only after the event date has passed and not yet rated
- `POST /api/events/:id/rate` — saves rating, recalculates photographer's average

**`GalleryPage` (customer mode)**
- Loads all event photos from `GET /api/events/:id/photos`
- **Face Filter:** Customer uploads a selfie → `POST /api/events/:id/face-filter` → returns only matching photos
- **Multi-select download:** circle checkbox on hover, selection bar at bottom, blob-based download forces save instead of browser preview

---

## Photographer Pages

| Route | Component | Purpose |
|---|---|---|
| `/photographer` | `PhotographerDashboard` | Overview: pending requests + active events |
| `/photographer/requests` | `PhotographerRequests` | Full list of pending requests |
| `/photographer/events` | `PhotographerEvents` | All active/past events |
| `/photographer/gallery/:eventId` | `GalleryPage` | Upload, delete, view photos |
| `/photographer/stats` | `StatsPage` | Charts: monthly events, type breakdown |
| `/photographer/receipt` | `PhotographerReceipt` | Active events with customer contact info |
| `/photographer/profile` | `ProfilePage` | Edit profile, services, city |

### Key Photographer Functions

**`PhotographerDashboard` / `PhotographerRequests` — Accept / Decline**
```
Photographer clicks "פרטים" → modal shows event details + notes
    ↓
Clicks ✓ קבל or ✕ דחה
    ↓
PATCH /api/events/:id/status  { status: "active" | "declined" }
    ↓
Event disappears from pending list, appears in active events
```

**`GalleryPage` (photographer mode)**
- Drag-and-drop or click to upload multiple photos
- `POST /api/events/:id/photos` — Multer handles up to 50 files, 20 MB each
- `DELETE /api/events/:id/photos/:filename` — removes from disk
- Photos served statically from `/uploads/events/<eventId>/`

---

## API Routes Reference

### `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account, returns JWT |
| POST | `/login` | No | Login, returns JWT |
| GET | `/me` | Yes | Validate token, return user object |
| PUT | `/profile` | Yes | Update username, email, city, services |
| PUT | `/profile-pic` | Yes | Upload new profile picture |
| GET | `/services` | No | List available photography service types |
| GET | `/photographers` | No | All photographers with ratings and services |
| GET | `/photographers/:id` | No | Single photographer + real stats (events filmed, avg rating) |

### `/api/events`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customer` | Yes | All events for logged-in customer (with notes) |
| GET | `/photographer` | Yes | All events for logged-in photographer (with notes + customer name) |
| POST | `/` | Yes | Customer creates new event proposal (saves notes) |
| PATCH | `/:id/status` | Yes | Photographer accepts or declines event |
| POST | `/:id/rate` | Yes | Customer rates a completed event (1–5 stars) |
| GET | `/:id/photos` | Yes | List all photos for an event |
| POST | `/:id/photos` | Yes | Upload photos (photographer only, up to 50 × 20 MB) |
| DELETE | `/:id/photos/:filename` | Yes | Delete a photo (photographer only) |
| POST | `/:id/face-filter` | Yes | Selfie face scan — returns matched photos |
| GET | `/stats` | Yes | Monthly/type breakdown for photographer dashboard |
| GET | `/receipts` | Yes | Active events with customer contact details |

---

## Face Recognition Flow (Face++ API)

Used when a customer uploads a selfie to find photos of themselves in an event gallery.

```
Customer uploads selfie
    ↓
POST /api/events/:id/face-filter  (multipart, field: "selfie")
    ↓
Server: Face++ Detect on selfie  →  get selfie face token (largest face)
    ↓
For each gallery photo (JPG/PNG/GIF/BMP only — WebP not supported):
    Face++ Detect  →  get all face tokens in photo
        ↓
    For each face token in photo:
        Face++ Compare (selfie token vs face token)
            ↓
        confidence >= 85%?  →  include photo
    ↓  [1.1s delay between API calls — free tier: 1 QPS]
    ↓
Return matched photos with confidence scores
    ↓
Frontend shows filtered gallery + purple confidence badge per photo
Selfie temp file deleted from disk after scan
```

**Why two-step (Detect then Compare)?**
Using `image_base64` directly in Compare only checks the *largest* face in each image. The two-step approach detects every face individually, so a person in the background of a group photo is still found.

**Rate limit:** Free tier is 1 request/second. The 1.1s sleep between calls prevents `CONCURRENCY_LIMIT_EXCEEDED` errors. A gallery of 10 photos takes roughly 25–35 seconds to scan.

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO | |
| userType | VARCHAR | `'customer'` or `'photographer'` |
| email | VARCHAR | unique |
| userName | VARCHAR | unique |
| password | VARCHAR | bcrypt hash (cost 10) |
| dateOfBirth | DATE | nullable |
| city | VARCHAR | nullable |
| rating | FLOAT | `-1` for customers, avg of rated events for photographers |
| service1/2/3 | INT | FK → services.id |
| profile_pic | VARCHAR | path like `/uploads/filename.jpg` |

### `events`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO | |
| photographer_id | INT FK | → users.id |
| customer_id | INT FK | → users.id |
| name | VARCHAR | event type (e.g. "חתונה") |
| date | DATE | |
| place | VARCHAR | |
| status | ENUM | `'pending'` / `'active'` / `'declined'` |
| customer_rating | TINYINT | 1–5, nullable |
| notes | TEXT | customer's notes from proposal form, nullable |

### `services`
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| type | VARCHAR | e.g. "צילום חתונות" |

---

## Environment Variables (`server/.env`)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=findme
JWT_SECRET=user
PORT=5000

FACEPP_API_KEY=your_key_here
FACEPP_API_SECRET=your_secret_here
```

---

## How Components Talk to Each Other

```
localStorage["token"]
    ↑ written on login/register
    │ read by every fetch call
    │
App.jsx  ──── user state ────►  Navbar (shows username, logout)
    │                        ►  CustomerRoutes / PhotographerRoutes
    │                               │
    │                               └── each page component
    │                                    │
    │                    fetch() with Authorization: Bearer header
    │                               │
    └─────────────────────────────► Express API (port 5000)
                                         │
                                    verifyToken middleware
                                         │
                                    Route handler
                                         │
                                    MySQL (findme DB)
                                         │
                                    JSON response
                                         │
                                    React setState → re-render
```

**Profile updates** flow through `ProfilePage` → `PUT /api/auth/profile` → returns updated user → `setUser(updatedUser)` in `App.jsx` so the Navbar reflects changes immediately.

**Ratings** flow: `CustomerEventsPage` → `POST /api/events/:id/rate` → server recalculates photographer's average → updates `users.rating` in DB → reflected next time the photographer's profile is loaded.
