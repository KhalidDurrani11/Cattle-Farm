# AgriTradeX - Detailed System Documentation

## Overview
AgriTradeX is a modern, responsive, and secure platform designed to connect farmers, buyers, and veterinarians across Pakistan. The system is built with a **Next.js** frontend (App Router) and an **Express/MongoDB** backend API.

## 1. System Architecture

### Frontend (Next.js 16)
- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS with custom Earthy/Agrarian color tokens (`primary-600` green, warm ambers).
- **State Management:** Handled via Context API (`AuthContext`) which persists authentication tokens securely.
- **Routing:** 
  - `/` (Home): Landing page showcasing features and call-to-actions.
  - `/marketplace`: The main browsing interface for cattle.
  - `/dashboard`: A unified, role-based dashboard for Farmers, Buyers, and Vets.

### Backend (Node.js & Express)
- **Database:** MongoDB (using Mongoose models).
- **Authentication:** JWT (JSON Web Tokens) with Google OAuth support.
- **Image Hosting:** Cloudinary (via Multer).
- **Security:** Helmet, Express Rate Limit, Mongo Sanitize.

---

## 2. Role-Based Logic

The system identifies users based on their assigned `role`:

### A. The Farmer (Seller)
**Goal:** List cattle, verify their identity, and sell/auction animals.
1. **Verification:** A Farmer must submit their CNIC (Front and Back). This is processed via the Dashboard (`Verify Identity` tab).
2. **Adding Cattle:** The Farmer clicks **"Add New Cattle"** on the Dashboard. This opens `AddCattleModal.tsx`, collecting details, images, and setting `availability` to `For Sale`.
3. **Selling:** A Farmer can manually mark cattle as `Sold`.
4. **Auctioning:** A Farmer can click the **Gavel (Hammer)** icon on their Dashboard. This sends a POST request to `/api/auctions`, creating a new Auction document in the database and changing the cattle's `auctionStatus` to `active`.

### B. The Buyer
**Goal:** Browse, bid, and purchase cattle.
1. **Browsing:** The Buyer views `/marketplace`. Cattle with an `active` auction display a purple glowing "Auction Live" badge.
2. **Inquiries:** If an animal is just for sale, they click **"Send Inquiry"** to open a direct message.
3. **Bidding:** If an animal is in auction, they click **"Place Bid"**. This opens `BidModal.tsx`.
   - The system fetches the current highest bid from the backend.
   - The user inputs a bid higher than the current bid.
   - A POST request is sent to `/api/auctions/:id/bid`. The database validates the bid and updates the `currentHighestBid`.

### C. The Veterinarian (Vet)
**Goal:** Ensure animal health and safety.
1. **Reviewing:** Vets use their specific Dashboard view to see `Pending Verifications`.
2. **Approval/Rejection:** Vets can inspect an animal's details and approve them, adding a "Verified" badge to the listing.

### D. The Admin
**Goal:** Platform moderation and identity verification.
1. Admins review and approve Farmer CNIC submissions to ensure platform safety.

---

## 3. Core Features & Code Paths

### 1. The Auction Flow (A to Z)
- **Start Auction (Frontend):** In `FarmerDashboard.tsx`, clicking the Gavel icon triggers `StartAuctionModal.tsx`. The farmer sets a starting price and duration.
- **API Call:** `POST /api/auctions` is called.
- **Backend Logic (`auctionRoutes.js`):** 
  - Verifies the user is the owner of the cattle.
  - Creates a new `Auction` model document.
  - Updates the `Cattle` model's `auctionStatus` to `active` and `availability` to `In Auction`.
- **Viewing the Auction (Frontend):** `Marketplace.tsx` fetches the cattle. If `auctionStatus === 'active'`, `CattleDetailsModal.tsx` renders the `AuctionTimer.tsx` and the `BidModal.tsx` trigger button.
- **Placing a Bid (Backend):** `POST /api/auctions/:id/bid` checks if the bid is higher than the `currentHighestBid`, verifies the auction hasn't ended, and records the new `Bid` model document.

### 2. The Transaction Flow (Offline Payments)
Since the platform is designed for Pakistan (Quetta/Balochistan), all payments are handled natively offline (JazzCash, Easypaisa, Bank Transfer, COD).
- When a deal is struck, the Farmer clicks the **"Mark as Sold"** button (`CheckCircle` icon).
- **API Call:** `PUT /api/cattle/:id/sold` is fired.
- **Backend Logic:** Changes `status` to `sold`, creates an `OwnershipHistory` document to transfer the animal from the `sellerId` to the `newOwnerId` (if known).

## 4. Troubleshooting & Architecture Guidelines

- **Next.js Caching:** Next.js aggressively caches pages and API calls. If the dashboard or marketplace returns a 404 abruptly, it usually means the `.next` compilation cache is corrupted. Running `rm -rf .next` and rebuilding fixes this.
- **Local vs Live Environments:** Ensure `frontend/.env.local` points to `NEXT_PUBLIC_API_URL=http://localhost:5000` during local development, and `NEXT_PUBLIC_API_URL=https://cattle-farm-jmeo.onrender.com` on Netlify.
- **No WebSockets:** The system deliberately avoids WebSockets for auctions (relying on REST polling) to ensure stability in regions with intermittent cellular internet (3G/4G).
