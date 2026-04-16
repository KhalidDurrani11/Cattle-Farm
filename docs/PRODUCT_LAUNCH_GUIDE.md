# AgriTradeX Product Launch Guide

## 1. Product Vision

AgriTradeX is a livestock trading platform built for real market usage:

- trust-first buying and selling
- verified seller identity states
- fast listing discovery and comparison
- direct buyer-seller communication

## 2. Feature Coverage

### Buyer-side

- search and filter cattle listings
- sort by price, recency, and popularity
- view listing details with seller data
- add/remove favorites
- contact seller via WhatsApp/call actions

### Seller-side

- register/login and manage account
- add cattle listings with photos
- monitor listings and views in dashboard
- delete own listings
- view profile status and verification state

### Platform capabilities

- JWT-protected APIs
- ownership authorization checks for write actions
- CORS allowlist protection
- MongoDB persistence
- image upload integration endpoint

## 3. Design System

The UI uses an earthy agri-focused palette via CSS variables in `frontend/app/globals.css`:

- Background: warm parchment tones
- Surface: card-like cream browns
- Primary: olive green
- Accent: harvest orange
- Text: dark soil brown

This ensures visual brand alignment with cattle and farm commerce.

## 4. Local Setup

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)

### Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Required backend env:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/agritradex
JWT_SECRET=replace_with_a_long_secret
FRONTEND_URL=http://localhost:3000
```

Run backend:

```bash
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Required frontend env:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

Open `http://localhost:3000`.

## 5. Verification Checklist (Before Launch)

- auth: register/login/logout works
- listings: create/list/view/delete works
- media: image upload works for listing creation
- favorites: add/remove + dashboard view works
- dashboard stats render correctly
- responsive UI works on mobile/tablet/desktop
- frontend build passes
- backend starts and `/health` returns `status: ok`
- environment variables configured in production

## 6. Deployment Plan

### Backend

- Deploy to Render/Railway as Node service
- Set env vars:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `FRONTEND_URL`

### Frontend

- Deploy to Vercel/Netlify
- Set env var:
  - `NEXT_PUBLIC_API_URL=<backend base url>`

### Database

- Use MongoDB Atlas for production
- Restrict network access and credentials

## 7. Production Hardening Recommendations

- add request rate limiting and brute-force protection
- add schema validation on all mutation endpoints
- add audit logs for listing edits/deletes
- add admin moderation workflow
- add notification system for offers/messages
- add automated tests (API + E2E)
- add monitoring and error tracking

## 8. Known Next Upgrades

- in-app negotiation chat and offer system
- payment escrow integration
- advanced trust score and fraud detection
- seller KYC upload workflow and manual approval panel
