# AgriTradeX — Cattle Farm Trading Platform

Production-focused full-stack marketplace for cattle trading in Pakistan.

## Tech Stack

- Frontend: `Next.js 14` + `React` + `TypeScript` + `Tailwind CSS`
- Backend: `Node.js` + `Express` + `MongoDB` + `Mongoose`
- Auth: `JWT`
- Media: `Cloudinary` (image upload API)

## Core Features

- User registration/login with JWT auth
- Marketplace with rich filters (category, breed, price range, search)
- Sorting (newest, price low/high, most viewed)
- Listing detail modal with seller contact actions
- Favorites (wishlist) per user
- Seller dashboard with real stats and listing management
- Listing creation with multi-image upload
- Seller profile endpoints and verification status support
- Earthy premium UI theme for agri/livestock brand identity

## Project Structure

```text
cattle/
├── frontend/                Next.js app
│   ├── app/                 routes and layout
│   ├── components/          reusable UI components
│   ├── context/             auth and language contexts
│   ├── lib/                 API client and helpers
│   └── types/               shared frontend types
├── backend/                 Express API
│   ├── models/              Mongoose models
│   ├── routes/              auth, cattle, users, upload
│   └── middleware/          auth middleware
└── docs/                    launch and operations docs
```

## Quick Start (Local)

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
```

Set values in `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/agritradex
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:3000
```

Run backend:

```bash
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Set `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build and Validation

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend (smoke):

```bash
cd backend
npm run dev
# then check http://localhost:5000/health
```

## API Snapshot

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/cattle`
- `GET /api/cattle/:id`
- `POST /api/cattle` (auth)
- `PUT /api/cattle/:id` (auth + ownership)
- `DELETE /api/cattle/:id` (auth + ownership)
- `GET /api/users/dashboard` (auth)
- `GET /api/users/favorites` (auth)
- `POST /api/users/favorites/:cattleId` (auth)
- `GET /api/users/:id/profile`
- `PUT /api/users/profile` (auth)
- `POST /api/upload` (auth)
- `GET /health`

## Deployment

Recommended split:

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- DB: MongoDB Atlas
- Images: Cloudinary

Set production env vars:

- Backend: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`
- Frontend: `NEXT_PUBLIC_API_URL`

## Documentation

- Product and launch guide: `docs/PRODUCT_LAUNCH_GUIDE.md`
