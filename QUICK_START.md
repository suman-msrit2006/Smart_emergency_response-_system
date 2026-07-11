# TrackER - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (already configured)
- Git installed

---

## 📦 Installation

### 1. Backend Setup
```bash
cd Hackathonproject/server
npm install
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: cluster0.uuv6jrp.mongodb.net
✅ Server running in development mode on port 5000
✅ Socket.IO ready for real-time connections
```

### 2. Frontend Setup
```bash
# Open new terminal
cd Hackathonproject/client
npm install
npm run dev
```

**Expected Output:**
```
✅ VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## 🎯 Test the Application

### Option 1: Quick Demo (No Login Required)

1. **Open Browser**: http://localhost:5173

2. **Test Emergency Workflow**:
   - Navigate to "Emergency Tracking" from home
   - Click **"Demo"** button
   - See ambulances on map
   - Click **"Ambulance Accept"**
   - Select a hospital → Click **"Accept"**
   - Click **"Start Monitoring"** for vitals
   - Navigate through: Doctor → Discharge → Feedback

3. **Verify MongoDB**:
   - Open MongoDB Atlas dashboard
   - Check `emergencies`, `vitals`, `consultations`, `feedbacks` collections
   - See your test data!

### Option 2: With Authentication

1. **Register**: http://localhost:5173/register
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Phone: 1234567890
   - Role: Patient

2. **Login**: http://localhost:5173/login
   - Use registered credentials

3. **Complete Workflow**: Same as Option 1

---

## 🗂️ Project Structure

```
Hackathonproject/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # Main pages (Emergency, Hospital, etc.)
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API service files
│   │   ├── context/       # React context providers
│   │   └── routes/        # React Router config
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── models/        # Mongoose models (7 models)
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── config/        # Configuration files
│   │   └── socket/        # Socket.IO handlers
│   └── package.json
│
└── Documentation Files     # Integration guides
```

---

## 📍 Key URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:5000/api | REST API |
| Health Check | http://localhost:5000/api/health | Server status |
| MongoDB | MongoDB Atlas | Database |

---

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://trackerAdmin:TRACKERadmin1234@cluster0.uuv6jrp.mongodb.net/
JWT_SECRET=tracker_ai_super_secret_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🧪 API Testing

### Create Emergency
```bash
curl -X POST http://localhost:5000/api/emergencies \
  -H "Content-Type: application/json" \
  -d '{
    "patient": "60d5ec84f8b6c8001f000001",
    "type": "Accident",
    "severity": "High",
    "description": "Test emergency",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716],
      "address": "Bangalore, India"
    },
    "contactNumber": "9876543210"
  }'
```

### Get Available Ambulances
```bash
curl "http://localhost:5000/api/ambulances/available?longitude=77.5946&latitude=12.9716&maxDistance=50000"
```

### Get All Hospitals
```bash
curl http://localhost:5000/api/hospitals
```

---

## 📊 MongoDB Collections

| Collection | Purpose | Count (After Test) |
|------------|---------|-------------------|
| users | User accounts | 1+ |
| emergencies | Emergency requests | 1+ |
| ambulances | Ambulance fleet | varies |
| hospitals | Hospital directory | varies |
| vitals | Patient vitals | 30+ |
| consultations | Doctor consultations | 1+ |
| feedbacks | Patient feedback | 1+ |

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is available
netstat -an | grep 5000

# Kill process on port 5000
npx kill-port 5000

# Restart backend
npm start
```

### Frontend Won't Start
```bash
# Check if port 5173 is available
netstat -an | grep 5173

# Kill process on port 5173
npx kill-port 5173

# Restart frontend
npm run dev
```

### MongoDB Connection Error
- Verify `.env` file has correct `MONGODB_URI`
- Check MongoDB Atlas network access (allow your IP)
- Verify database user credentials

### API Calls Failing
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify `VITE_API_URL` in frontend `.env`

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `PART3B_API_INTEGRATION_COMPLETE.md` | Frontend-Backend API integration details |
| `MONGODB_INTEGRATION_COMPLETE.md` | Complete MongoDB integration documentation |
| `FINAL_INTEGRATION_SUMMARY.md` | Comprehensive summary with examples |
| `QUICK_START.md` | This file - Quick reference guide |

---

## 🎯 Workflow Pages

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 1 | Home | `/` | Landing page with features |
| 2 | Emergency | `/emergency` | Ambulance tracking |
| 3 | Hospital | `/hospital` | Hospital selection |
| 4 | Vitals | `/vitals` | IoT vitals monitoring |
| 5 | Doctor | `/doctor` | Doctor consultation |
| 6 | Discharge | `/discharge` | Patient handover |
| 7 | Feedback | `/feedback` | Patient feedback |

---

## ✅ Success Indicators

You'll know everything is working when:

✅ Backend console shows "MongoDB Connected"
✅ Frontend loads without errors
✅ Emergency page shows ambulances on map
✅ Hospital page shows hospital list
✅ Vitals page updates chart in real-time
✅ MongoDB Atlas shows new documents
✅ No console errors in browser
✅ Complete workflow navigates smoothly

---

## 🚀 Next Steps

1. **Seed Data**: Add sample hospitals and ambulances
2. **Authentication**: Register and login as different roles
3. **Real-Time**: Enable Socket.IO for live updates
4. **Production**: Deploy to Vercel (frontend) + Render (backend)

---

## 📞 Need Help?

1. Check browser console (F12)
2. Check backend terminal logs
3. Review MongoDB Atlas logs
4. Read detailed docs in `MONGODB_INTEGRATION_COMPLETE.md`

---

**Happy Tracking! 🚑**

The TrackER Emergency Management System is ready to save lives! 🏥
