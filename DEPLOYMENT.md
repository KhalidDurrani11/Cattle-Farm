# AgriTradeX - Complete Deployment Guide

This guide will walk you through deploying your AgriTradeX livestock marketplace step-by-step.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: MongoDB Atlas Setup](#step-1-mongodb-atlas-setup)
3. [Step 2: Cloudinary Setup](#step-2-cloudinary-setup)
4. [Step 3: Backend Deployment (Render)](#step-3-backend-deployment-render)
5. [Step 4: Frontend Deployment (Netlify)](#step-4-frontend-deployment-netlify)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, you'll need accounts on these platforms:
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Database
- [Cloudinary](https://cloudinary.com/) - Image hosting
- [Render](https://render.com/) - Backend hosting (free tier available)
- [Netlify](https://www.netlify.com/) - Frontend hosting
- [GitHub](https://github.com/) - Code repository

---

## Step 1: MongoDB Atlas Setup

MongoDB Atlas hosts your database in the cloud.

### 1.1 Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up/login
2. Click "Build a Database"
3. Choose "Shared" (FREE tier)
4. Select your preferred cloud provider (AWS recommended)
5. Choose a region closest to your users (e.g., Mumbai for Pakistan)
6. Click "Create Cluster" (takes 1-3 minutes)

### 1.2 Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username: `agritradex_admin` (or your choice)
5. Click "Generate Password" or create your own
6. **IMPORTANT**: Copy this password and save it securely!
7. Under "Built-in Role", select "Read and Write to Any Database"
8. Click "Add User"

### 1.3 Whitelist IP Addresses
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add specific IPs (Render will provide its IP)
5. Click "Confirm"

### 1.4 Get Connection String
1. Go back to "Clusters" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Select "Node.js" and version "5.5 or later"
5. Copy the connection string. It looks like:
   ```
   mongodb+srv://agritradex_admin:<password>@cluster0.xxxxx.mongodb.net/agritradex?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Replace `agritradex` with your database name (or keep it)
8. **Save this string** - you'll need it for the backend!

---

## Step 2: Cloudinary Setup

Cloudinary hosts your images (cattle photos, user avatars).

### 2.1 Create Account
1. Go to [Cloudinary](https://cloudinary.com/) and sign up
2. Choose "Programmable Media" for the product
3. Complete registration

### 2.2 Get API Credentials
1. In your Cloudinary Dashboard, find "Account Details"
2. You'll see three values:
   - **Cloud Name**: e.g., `dzh16w4tn`
   - **API Key**: e.g., `236744463966233`
   - **API Secret**: e.g., `KDodS5ecmjyfhrG5sbbe8OQn-hQ`
3. **Save all three values** - you need them all!

### 2.3 Create Upload Folder (Optional)
1. Go to "Media Library"
2. Click "Create Folder"
3. Name it `agritradex/cattle`
4. This helps organize your uploads

---

## Step 3: Backend Deployment (Render)

Render hosts your Node.js backend for free.

### 3.1 Prepare Your Backend
1. Make sure your `backend/package.json` has this exact structure:
   ```json
   {
     "name": "agritradex-backend",
     "version": "1.0.0",
     "type": "module",
     "main": "server.js",
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     },
     "dependencies": {
       "bcryptjs": "^3.0.3",
       "cloudinary": "^2.6.1",
       "compression": "^1.8.1",
       "cors": "^2.8.6",
       "dotenv": "^17.4.0",
       "express": "^4.18.2",
       "express-mongo-sanitize": "^2.2.0",
       "express-rate-limit": "^6.10.0",
       "helmet": "^8.1.0",
       "jsonwebtoken": "^9.0.3",
       "mongoose": "^9.4.1",
       "multer": "^1.4.5-lts.1"
     }
   }
   ```

2. Ensure your `backend/.env` file exists with these variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=create_a_long_random_string_here_minimum_32_characters
   FRONTEND_URL=https://your-netlify-app.netlify.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NODE_ENV=production
   ```

### 3.2 Push to GitHub
1. Create a new GitHub repository (public or private)
2. Push your entire project (frontend + backend in one repo)
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

### 3.3 Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `agritradex-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (or `npm start`)
   - **Plan**: Free

5. Click "Advanced" and add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `MONGO_URI` | Your MongoDB connection string |
   | `JWT_SECRET` | Create random 64+ character string |
   | `FRONTEND_URL` | `https://your-app.netlify.app` |
   | `CLOUDINARY_CLOUD_NAME` | Your cloud name |
   | `CLOUDINARY_API_KEY` | Your API key |
   | `CLOUDINARY_API_SECRET` | Your API secret |
   | `NODE_ENV` | `production` |

6. Click "Create Web Service"
7. Wait for deployment (2-5 minutes)
8. Once deployed, note your URL: `https://agritradex-api.onrender.com`

---

## Step 4: Frontend Deployment (Netlify)

### 4.1 Prepare Frontend
1. Update `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://agritradex-api.onrender.com
   ```

2. Ensure `netlify.toml` exists in your project root:
   ```toml
   [build]
     base = "frontend"
     publish = ".next"
     command = "npm run build"

   [build.environment]
     NODE_VERSION = "18"
     NEXT_TELEMETRY_DISABLED = "1"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. Update `frontend/next.config.mjs`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     distDir: 'dist',
     images: {
       unoptimized: true,
       remotePatterns: [
         { protocol: 'https', hostname: 'res.cloudinary.com' },
         { protocol: 'https', hostname: 'images.unsplash.com' },
       ],
     },
   };

   export default nextConfig;
   ```

### 4.2 Push Changes
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 4.3 Deploy to Netlify
**Method 1: Via GitHub (Recommended)**
1. Go to [Netlify](https://www.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Select GitHub and authorize
4. Choose your repository
5. Configure build:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (or `dist` if using static export)
6. Click "Show advanced" and add Environment Variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://agritradex-api.onrender.com`
7. Click "Deploy site"
8. Wait for build (3-5 minutes)

**Method 2: Via Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to project
cd cattle

# Link to your site
netlify link

# Deploy
netlify deploy --prod --dir=frontend/dist
```

### 4.4 Configure Custom Domain (Optional)
1. In Netlify, go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Enter your domain (e.g., `agritradex.pk`)
4. Follow DNS configuration instructions
5. Enable HTTPS (Auto SSL)

---

## Environment Variables Reference

### Backend (.env file)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-key-min-32-chars` |
| `FRONTEND_URL` | Your Netlify URL | `https://agritradex.netlify.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dzh16w4tn` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `236744463966233` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `your-secret-key` |
| `NODE_ENV` | Environment mode | `production` |

### Frontend (.env.local file)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://agritradex-api.onrender.com` |

---

## Post-Deployment Checklist

After deployment, complete these steps:

### 1. Test Basic Functionality
- [ ] Visit your Netlify URL
- [ ] Test user registration
- [ ] Test login
- [ ] Test adding a cattle listing
- [ ] Test image upload
- [ ] Test viewing listings

### 2. Create Admin/Vet Accounts
You need at least one vet account to verify cattle:

1. Register a new user with role "vet"
2. In MongoDB Atlas, manually update the user's `verificationStatus` to "verified"
3. Or create an admin account and verify through the dashboard

### 3. Update CORS (If needed)
If you get CORS errors, update `backend/server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-netlify-app.netlify.app',  // Add your actual URL!
  process.env.FRONTEND_URL,
].filter(Boolean);
```

---

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Check if your IP is whitelisted in MongoDB Atlas
- Verify your MONGO_URI has the correct password
- Ensure `&w=majority` is in the connection string

### Issue: "Images not uploading"
**Solution**:
- Verify Cloudinary credentials
- Check Cloudinary dashboard for upload limits
- Ensure `CLOUDINARY_CLOUD_NAME` matches exactly (case-sensitive)

### Issue: "CORS errors in browser"
**Solution**:
- Update `FRONTEND_URL` in Render with your exact Netlify URL
- Restart the backend service after updating env vars

### Issue: "Build failed on Netlify"
**Solution**:
- Check Node version (should be 18+)
- Ensure `next.config.mjs` has `output: 'export'` if using static hosting
- Check build logs for specific errors

### Issue: "Token expired / Login not working"
**Solution**:
- Clear browser localStorage
- Check JWT_SECRET is set correctly
- Ensure frontend and backend are communicating (check Network tab)

---

## Maintenance

### Update Backend
1. Push changes to GitHub
2. Render automatically redeploys

### Update Frontend
1. Push changes to GitHub
2. Netlify automatically redeploys
3. Clear browser cache if changes don't appear

### Database Backups
MongoDB Atlas automatically backs up (free tier: daily snapshots)

### Monitor Usage
- Render dashboard shows API usage
- MongoDB Atlas shows database size
- Cloudinary shows image storage usage

---

## Costs Summary

| Service | Free Tier Limits | Paid (if needed) |
|---------|-----------------|------------------|
| MongoDB Atlas | 512MB storage, shared RAM | $9+/month |
| Render | 750 hours/month, sleeps after 15 min inactivity | $7+/month (always on) |
| Netlify | 100GB bandwidth, 300 build minutes | $19+/month |
| Cloudinary | 25GB storage, 25GB bandwidth | $25+/month |

**Estimated Monthly Cost**: $0 (free tier) to $50+ (paid tiers)

---

## Support & Resources

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com/
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

**You're all set! Your AgriTradeX marketplace should now be live! 🚀**

If you encounter any issues, check the troubleshooting section or consult the platform-specific documentation.
