# 🚀 TrackER AI - Complete Installation Guide

## Quick Setup in 10 Minutes

---

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas)
- **Git** (optional)
- **Code Editor** (VS Code recommended)

---

## Step 1: Backend Setup (5 minutes)

### 1.1 Install Backend Dependencies

```bash
cd Hackathonproject/server
npm install
```

This will install:
- express, mongoose, socket.io
- jsonwebtoken, bcryptjs, zod
- helmet, cors, express-rate-limit
- morgan, dotenv, express-mongo-sanitize

### 1.2 Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account (M0 cluster)
3. Create a cluster
4. Create database user:
   - Username: `tracker_admin`
   - Password: Generate strong password (save it!)
5. Network Access:
   - Click "Network Access"
   - Add IP Address → "Allow access from anywhere" (0.0.0.0/0)
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

Example:
```
mongodb+srv://tracker_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tracker-ai?retryWrites=true&w=majority
```

### 1.3 Configure Environment Variables

```bash
cd Hackathonproject/server
cp .env.example .env
```

Edit `.env` file:
```env
NODE_ENV=development
PORT=5000

# Replace with your MongoDB connection string
MONGODB_URI=mongodb+srv://tracker_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tracker-ai?retryWrites=true&w=majority

# Generate a strong JWT secret
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.4 Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database: tracker-ai
✅ Server running in development mode on port 5000
ℹ️  API Health Check: http://localhost:5000/api/health
🔌 Socket.IO ready for connections
```

**Test Backend:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "success",
  "message": "TrackER AI API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Step 2: Frontend Setup (5 minutes)

### 2.1 Install Frontend Dependencies

Open a **new terminal** window:

```bash
cd Hackathonproject/client
npm install
```

This will install:
- react, react-dom, react-router-dom
- axios, socket.io-client
- tailwindcss, vite

### 2.2 Configure Environment Variables

The `.env` file is already created. Verify it contains:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 2.3 Start Frontend Server

```bash
npm run dev
```

You should see:
```
  VITE v8.1.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## Step 3: Test the Application

### 3.1 Open Browser

Navigate to: `http://localhost:5173`

### 3.2 Register a User

1. Click "Create account" or go to `/register`
2. Fill in the form:
   - Name: John Doe
   - Email: john@example.com
   - Password: SecurePass123
   - Phone: +1234567890
   - Role: Patient
3. Click "Create account"
4. Should auto-login and redirect to home

### 3.3 Test Features

**Emergency:**
1. Go to `/emergency`
2. Click "Create Emergency"
3. Fill form and submit
4. Should appear in list

**Hospitals:**
1. Go to `/hospital`
2. View hospitals list
3. Try filters
4. Click hospital card for details

**Vitals:**
1. Go to `/vitals`
2. Click "Record Vitals"
3. Fill form and submit
4. Should appear in history

**Consultations:**
1. Go to `/doctor`
2. View consultations
3. Try status filters

**Feedback:**
1. Go to `/feedback`
2. Click "Submit Feedback"
3. Fill form and submit
4. Should appear in list

---

## Step 4: Verify Real-time Features

### 4.1 Test Socket Connection

Open browser console (F12):
```javascript
// You should see
Socket connected: <socket-id>
```

### 4.2 Test Real-time Updates

**Vitals Real-time:**
1. Keep vitals page open
2. Open another tab (same browser)
3. Record new vitals
4. First tab should update automatically

**Emergency Status:**
1. Keep emergency page open
2. Status changes should appear in real-time

---

## 🐛 Troubleshooting

### Backend Issues:

**MongoDB Connection Failed:**
```
❌ Error connecting to MongoDB
```

Solutions:
- Check MongoDB URI in `.env`
- Verify IP is whitelisted in MongoDB Atlas
- Check username/password
- Ensure network connection

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

Solutions:
- Change PORT in `.env` to 5001
- Or kill process using port 5000

### Frontend Issues:

**Cannot connect to backend:**
```
Network error. Please check your connection.
```

Solutions:
- Ensure backend is running on port 5000
- Check VITE_API_URL in `.env`
- Verify CORS is configured

**Socket not connecting:**
```
Socket connection error
```

Solutions:
- Check VITE_SOCKET_URL in `.env`
- Ensure backend Socket.IO is running
- Check JWT token is valid

---

## 📁 Project Structure After Installation

```
Hackathonproject/
├── server/
│   ├── node_modules/         ✅ Installed
│   ├── src/                  ✅ Backend code
│   ├── .env                  ✅ Configured
│   └── package.json
│
└── client/
    ├── node_modules/         ✅ Installed
    ├── src/                  ✅ Frontend code
    ├── .env                  ✅ Configured
    └── package.json
```

---

## 🔍 Verify Installation

### Backend Checklist:
- [ ] `npm install` completed without errors
- [ ] `.env` file created and configured
- [ ] MongoDB connection successful
- [ ] Server running on port 5000
- [ ] Health check endpoint responds
- [ ] Socket.IO initialized

### Frontend Checklist:
- [ ] `npm install` completed without errors
- [ ] `.env` file exists with correct URLs
- [ ] Server running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Register page loads
- [ ] Login page loads

### Integration Checklist:
- [ ] Can register a new user
- [ ] Can login
- [ ] Token saved in localStorage
- [ ] Can create emergency
- [ ] Can view hospitals
- [ ] Can record vitals
- [ ] Socket connects (check console)

---

## 🎯 Next Steps

After successful installation:

1. **Explore Features:**
   - Test all pages
   - Create test data
   - Try real-time features

2. **Read Documentation:**
   - Backend: `/server/API_DOCUMENTATION.md`
   - Frontend: `/client/FRONTEND_INTEGRATION_GUIDE.md`
   - Complete: `/COMPLETE_PROJECT_SUMMARY.md`

3. **Development:**
   - Make changes
   - Test locally
   - Read code structure

4. **Deployment:**
   - Follow `/server/DEPLOYMENT_GUIDE.md`
   - Deploy to production

---

## 🆘 Need Help?

### Check Documentation:
- **Quick Start:** `/server/QUICK_START.md`
- **API Docs:** `/server/API_DOCUMENTATION.md`
- **Integration:** `/client/FRONTEND_INTEGRATION_GUIDE.md`

### Common Commands:

**Backend:**
```bash
cd Hackathonproject/server
npm install          # Install dependencies
npm run dev         # Start development server
npm start           # Start production server
```

**Frontend:**
```bash
cd Hackathonproject/client
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
```

---

## ✅ Installation Complete!

If you see:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173
- ✅ Can register/login
- ✅ Can access all pages
- ✅ Socket connected in console

**You're all set! 🎉**

---

## 📊 What You Have Now

- ✅ Full-stack application running
- ✅ MongoDB database connected
- ✅ Real-time Socket.IO working
- ✅ JWT authentication active
- ✅ All API endpoints available
- ✅ Frontend integrated with backend

**Ready to build amazing healthcare solutions!** 🚀

---

**Installation Time:** ~10 minutes
**Difficulty:** Easy
**Prerequisites:** Node.js, MongoDB Atlas account

**Happy Coding!** 💻
