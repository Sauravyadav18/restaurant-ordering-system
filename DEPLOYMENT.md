# Deployment Guide

Deploy your Restaurant Ordering System using **Vercel** (frontend), **Render** (backend), and **MongoDB Atlas** (database).

---

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster (Free tier is fine)
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/restaurantDB`)
5. Replace `<password>` with your actual password

---

## Step 2: Deploy Backend to Render

1. Push your code to GitHub (create a new repository)
2. Go to [Render](https://render.com) and sign up
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `restaurant-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A random secure string (e.g., `myRestaurantSecretKey2024`) |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (add after Vercel deploy) |

7. Click **"Create Web Service"**
8. Wait for deployment (takes 2-5 minutes)
9. Copy your backend URL (e.g., `https://restaurant-backend.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign up with GitHub
2. Click **"Import Project"**
3. Select your repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://your-backend.onrender.com` |

6. Click **"Deploy"**
7. Wait for deployment
8. Your app is live! 🎉

---

## Step 4: Seed Production Database

After both are deployed, seed your production database:

```bash
# Set the production MongoDB URI temporarily
cd backend
set MONGODB_URI=your_mongodb_atlas_connection_string
npm run seed
```

Or manually create the admin user via your app's API.

---

## Step 5: Update Render with Frontend URL

Go back to Render → Your Web Service → Environment:
- Add `FRONTEND_URL` = `https://your-app.vercel.app`

---

## Your Live URLs

| Service | URL |
|---------|-----|
| Frontend | `https://your-app.vercel.app` |
| Backend | `https://restaurant-backend.onrender.com` |
| Admin Login | `https://your-app.vercel.app/admin/login` |

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` is set correctly in Render
- Check that both URLs use `https://`

### Socket.io Not Working
- Render free tier may sleep after inactivity - first request may take 30s
- Verify `VITE_SOCKET_URL` points to your Render backend

### Database Connection Issues
- Check MongoDB Atlas Network Access allows `0.0.0.0/0` (all IPs)
- Verify connection string password is correct
