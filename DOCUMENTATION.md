# AgriTradeX Sovereign Exchange - Project Documentation

## Project Overview
AgriTradeX is a high-end, premium marketplace platform dedicated to connecting farmers, institutional investors, and elite breeders. The platform facilitates the trade of top-tier heritage livestock across Pakistan to buyers globally while maintaining a "Sovereign Exchange" visual aesthetic (dark-mode, gold-sheen, editorial typography) crafted via the Kinship logic design token methodology. The web application spans a robust Node.js REST API with a fully functional Next.js 14 frontend environment.

---

## Technical Stack
**Frontend:**
- Next.js 14.2 (App Router & React Server Components)
- Tailwind CSS (Kinetic Lab Dark & Gold tokens)
- TypeScript & Lucide React (Icons)
- Vercel-optimized APIs (Next/Image & Next Caching)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Cloud Atlas database)
- JSON Web Tokens (JWT) & bcrypt (Auth layer)
- Cloudinary (Media storage & image optimization pipeline)
- Enterprise Security Stack (Helmet, Express Rate Limit, Mongo Sanitize, HPP)

---

## Features List
- **Advanced Market Filtering**: Instant, client-side sorting by breed, category, price parameters, and newest entries.
- **Sovereign Network Identity**: Full user authentication (Register, Login, JWT verification) featuring encrypted credentials.
- **Secure File Processing**: Native Cloudinary multi-part data stream for cattle avatar arrays.
- **Wishlist Escrow Memory**: Fully database-mapped user favorites lists attached to JWT instances.
- **Dashboard Ecosystem**: Revenue analytics, visual activity stats, and real-time active listing status trackers.
- **Mobile Responsive Architecture**: Fluid UI adapting elegantly to phones without losing the Premium Desktop feel.

---

## Folder Structure Explanation

```
cattle/
├── backend/                      # Complete Express REST API Application
│   ├── middleware/               # Auth barriers (auth.js)
│   ├── models/                   # Mongoose Schemas (User, Cattle)
│   ├── routes/                   # Routing handlers (auth.js, cattle.js, users.js)
│   ├── .env                      # API Secret credentials (Local DB/Cloudinary)
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Central Entry point & Application config
│
└── frontend/                     # Next.js Application Architecture
    ├── app/                      # Page components & Layouts (App Router)
    ├── components/               # Resuable React building blocks (CattleCard)
    ├── context/                  # Global Context providers (AuthContext, i18n)
    ├── lib/                      # API Connectors & TypeScript type safety
    ├── public/                   # Static assets
    ├── tailwind.config.ts        # Sovereign UI layout & Design tokens
    └── package.json              # Frontend libraries (React, Lucide, Tailwind)
```

---

## Database Schema Overview
*   **User Schema**: Defines user accounts (`name, email, password` encrypted via `bcrypt`, `location, phone`, an array of `favorites` referencing Cattle models, and structural `roles`).
*   **Cattle Schema**: Maps to market inventory (`name, breed, category` enum values, `price` strict integer constraints, `views` counter, boolean `isVerified`, specific media arrays via Cloudinary strings, referencing back to the `User` Schema map for its `sellerId`).

---

## API Routes Overview
*   `/api/auth/register` (POST): Establishes users with hashed passwords and dispatches a JWT token buffer.
*   `/api/auth/login` (POST): Validates active users and initializes active sessions.
*   `/api/cattle` (GET/POST): Primary marketplace gateway. GET pulls lists (or filtered queries), POST creates authorized new elements.
*   `/api/cattle/:id` (PUT/DELETE): Protected scope limits ensuring only authentic `sellerId` matches can edit/remove entries.
*   `/api/users/dashboard` (GET): Specialized authenticated route producing revenue and statistical views for profiles.
*   `/api/users/favorites` (POST/GET): Syncs local variables strictly with the remote MongoDB `favorites` array state.

---

## Authentication & Security Features
*   **Encrypted Secrets**: Pure 12-round bcrypt hash verification ensures database integrity against local rainbow table infiltrations.
*   **JWT Transports**: Pure Authorization "Bearer" Tokens dispatched over standard API fetch protocols (handled in `AuthContext.tsx`).
*   **Middleware Defenses**: 
    - **Helmet**: Secures core X-Powered-By strings and Cross-Site standards.
    - **Express-Rate-Limit**: Establishes 30 attempt thresholds per 15 mins for `/api/auth` to prevent Brute Forcing.
    - **Mongo Sanitize**: Obliterates NoSQL injection mechanisms like `$gt` payloads hidden inside login parameters.
    - **HPP**: Circumvents HTTP payload parameter pollution techniques.

---

## Deployment Guide & Environment Layout

**1. Database Variables (`backend/.env`)**
```env
PORT=5000
MONGO_URI=mongodb+srv://<USER>:<PASS>@<ATLAS_URL>
JWT_SECRET=super_secret_production_key_64_bytes
FRONTEND_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your_cloud_key
CLOUDINARY_API_KEY=0000000000
CLOUDINARY_API_SECRET=your_secret
```

**2. Frontend Variables (`frontend/.env.production`)**
```env
NEXT_PUBLIC_API_URL=https://your-backend-api-domain.com
```

### Hosting on Vercel & Render
- **Backend (Render)**: Deploy as a "Web Service". Explicitly apply the `backend/` directory as your build root, define the Build Command `npm install`, and Start Command `npm start`. Apply the backend ENV variables in the dashboard setup.
- **Frontend (Vercel)**: Connect your Github, Vercel will intrinsically detect the "Next.js" engine framework. Add the string corresponding to your deployed Render URL internally to the `NEXT_PUBLIC_API_URL` variable space so it points natively toward the new location.

---

## Local Setup - How to Run Project

Ensure you have Node.js (>18) installed and an active Terminal instance open. Note: use two distinct terminal tabs cleanly.

**Step 1: Setup Backend Ecosystem**
```bash
cd cattle/backend
npm install
npm run dev
```
*Ensure you have configured `backend/.env` with MongoDB connection strings prior to starting.*

**Step 2: Setup Frontend Web App**
```bash
cd cattle/frontend
npm install
npm run dev
```
*The App will start securely on `http://localhost:3000` connected gracefully against the backend instance.*

**Step 3: Build for Production Simulation**
```bash
cd cattle/frontend
npm run build
npm start
```
*Triggers ISR optimization rendering ensuring pre-compiled performance matrices pass standard checks.*

## Troubleshooting Note
- **EADDRINUSE (Port Conflict)**: If `localhost:3000` or `5000` refuses to boot locally, identify dangling node tasks via Task Manager (Windows) or `killall node` (Mac/Linux).
- **Blank Images**: Ensure Next.js `<Image>` remotePatterns strictly matches your Cloudinary and Google Domains within `next.config.mjs`. Use `npm run build` to reboot domains natively.
