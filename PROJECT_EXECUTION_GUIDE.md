# TrackER AI - Project Execution Guide

Complete guide to set up, run, and deploy the TrackER AI platform.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**TrackER AI** is an AI-Powered Smart Emergency Response & Healthcare Coordination Platform that provides:
- Real-time emergency request management
- Ambulance tracking and dispatch
- Hospital capacity monitoring
- Patient vitals tracking
- Doctor consultations
- Feedback system

### Technology Stack

**Backend:**
- Node.js 18+
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication

**Frontend:**
- React 18+
- Vite
- Tailwind CSS
- Socket.IO Client
- Axios

---

## ✅ Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)
   ```bash
   # Check version
   node --version
   
   # Download from: https://nodejs.org/
   ```

2. **npm** (v9.0.0 or higher)
   ```bash
   # Check version
   npm --version
   ```

3. **Git**
   ```bash
   # Check version
   git --version
   
   # Download from: https://git-scm.com/
   ```

4. **MongoDB** (Local or Atlas)
   - Local: https://www.mongodb.com/try/download/community
   - Cloud: https://www.mongodb.com/cloud/atlas (Free tier available)

### Required Accounts

1. **GitHub Account** - For version control
2. **MongoDB Atlas Account** - For database (free tier)
3. **Render Account** - For backend deployment (free tier)
4. **Vercel/Netlify Account** - For frontend deployment (free tier)

---

## 🚀 Local Development Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-username/tracker-ai.git

# Navigate to project directory
cd tracker-ai/Hackathonproject
```

### Step 2: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use any text editor
```

**Configure .env:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tracker-ai
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
```

### Step 3: Frontend Setup

```bash
# Navigate to client directory (from project root)
cd ../client

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env
nano .env
```

**Configure .env:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 4: Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB from Services
```

#### Option B: MongoDB Atlas (Recommended)
See `server/MONGODB_ATLAS_SETUP.md` for detailed instructions.

1. Create free cluster
2. Create database user
3. Whitelist IP (0.0.0.0/0 for development)
4. Get connection string
5. Update MONGODB_URI in .env

---

## 🏃 Running the Application

### Start Backend Server

```bash
# From server directory
cd Hackathonproject/server

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Expected output:**
```
✓ MongoDB Connected: localhost:27017
Socket.IO initialized successfully
Server running in development mode on port 5000
API Health Check: http://localhost:5000/api/health
Socket.IO ready for real-time connections
```

### Start Frontend Application

```bash
# From client directory (new terminal)
cd Hackathonproject/client

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Expected output:**
```
VITE v4.5.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **API Health:** http://localhost:5000/api/health

---

## 🧪 Testing

### Backend Tests

```bash
cd Hackathonproject/server

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test auth.test.js
```

### Frontend Tests

```bash
cd Hackathonproject/client

# Run tests
npm test

# Run with UI
npm test -- --ui

# Run with coverage
npm test -- --coverage
```

### Manual API Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "+1234567890",
    "role": "Patient"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

---

## 🚢 Deployment

### Backend Deployment (Render)

See `server/RENDER_DEPLOYMENT.md` for detailed instructions.

**Quick Steps:**
1. Push code to GitHub
2. Create Render account
3. Create new Web Service
4. Connect GitHub repository
5. Configure environment variables
6. Deploy

### Frontend Deployment (Vercel)

```bash
cd Hackathonproject/client

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Or use Vercel Dashboard:**
1. Go to https://vercel.com
2. Import Git Repository
3. Select `Hackathonproject/client`
4. Add environment variables
5. Deploy

### Environment Variables (Production)

**Backend (Render):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-atlas-connection-string
JWT_SECRET=production-secret-64-characters-min
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## 🔍 Verification Checklist

### Local Setup
- [ ] Node.js and npm installed
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Backend server starts successfully
- [ ] Frontend app starts successfully
- [ ] Can register new user
- [ ] Can login
- [ ] API endpoints working
- [ ] Socket.IO connections working

### Production Deployment
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas configured
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] Custom domains configured (optional)
- [ ] SSL certificates active
- [ ] Health check passing
- [ ] API endpoints accessible
- [ ] Socket.IO working
- [ ] CORS configured correctly

---

## 🐛 Troubleshooting

### Backend Won't Start

**Issue: Port already in use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 PID  # macOS/Linux
taskkill /PID PID /F  # Windows

# Or change PORT in .env
```

**Issue: MongoDB connection failed**
```
Error: MongooseServerSelectionError
```
**Solution:**
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check MongoDB Atlas IP whitelist
- Verify database credentials

**Issue: Missing environment variables**
```
Error: Missing required environment variables: JWT_SECRET
```
**Solution:**
- Copy .env.example to .env
- Fill in all required values
- Restart server

### Frontend Won't Start

**Issue: Port 5173 in use**
```
Error: Port 5173 is in use
```
**Solution:**
- Stop other Vite dev server
- Or change port in vite.config.js

**Issue: Cannot connect to backend**
```
Error: Network Error
```
**Solution:**
- Verify backend is running
- Check VITE_API_URL in .env
- Check CORS configuration in backend

### API Errors

**Issue: 401 Unauthorized**
```
Error: Authentication token required
```
**Solution:**
- Login to get new token
- Check token is included in request
- Verify token hasn't expired

**Issue: 429 Too Many Requests**
```
Error: Too many requests from this IP
```
**Solution:**
- Wait 15 minutes
- Or disable rate limiting in development

**Issue: 500 Internal Server Error**
```
Error: Internal server error
```
**Solution:**
- Check backend logs
- Verify database connection
- Check request payload format

---

## 📁 Project Structure

```
Hackathonproject/
├── server/                    # Backend API
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── socket/           # Socket.IO
│   │   ├── utils/            # Utilities
│   │   ├── validations/      # Validation schemas
│   │   ├── app.js            # Express app
│   │   └── server.js         # Entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── client/                    # Frontend App
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── config/           # Configuration
│   │   ├── context/          # React context
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   ├── routes/           # Route configuration
│   │   ├── services/         # API services
│   │   ├── styles/           # Styles
│   │   ├── utils/            # Utilities
│   │   ├── App.jsx           # Main app
│   │   └── main.jsx          # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # CI/CD pipeline
│
└── README.md                 # Project README
```

---

## 📚 Documentation

- **Backend API:** `server/API_DOCUMENTATION.md`
- **Socket.IO:** `server/SOCKET_IMPLEMENTATION.md`
- **Deployment:** `server/RENDER_DEPLOYMENT.md`
- **MongoDB:** `server/MONGODB_ATLAS_SETUP.md`
- **Testing:** `server/TESTING_GUIDE.md`
- **Production:** `server/PRODUCTION_README.md`
- **Frontend API:** `client/API_INTEGRATION_GUIDE.md`

---

## 🎯 Development Workflow

### Daily Development

1. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd Hackathonproject/server && npm run dev
   
   # Terminal 2: Frontend
   cd Hackathonproject/client && npm run dev
   ```

2. **Make Changes**
   - Edit code
   - Save files (auto-reload enabled)
   - Test in browser

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Develop Feature**
   - Write code
   - Write tests
   - Update documentation

3. **Test Thoroughly**
   ```bash
   npm test
   ```

4. **Create Pull Request**
   ```bash
   git push origin feature/new-feature
   ```

### Code Review Process

1. Create pull request on GitHub
2. Request review from team
3. Address feedback
4. Merge to main
5. Auto-deploy to production (if configured)

---

## 🔐 Security Best Practices

1. **Never commit .env files**
2. **Use strong passwords**
3. **Keep dependencies updated**
4. **Run security audits**
   ```bash
   npm audit
   npm audit fix
   ```
5. **Use HTTPS in production**
6. **Enable rate limiting**
7. **Validate all inputs**
8. **Sanitize database queries**

---

## 🚀 Performance Optimization

1. **Database Indexes**
   - Create indexes for frequently queried fields
   - Monitor slow queries

2. **Caching**
   - Implement Redis for session storage
   - Cache frequent API responses

3. **Code Splitting**
   - Lazy load React components
   - Split large bundles

4. **Compression**
   - Enable gzip compression
   - Optimize images

5. **CDN**
   - Use CDN for static assets
   - Enable caching headers

---

## 📞 Support & Resources

### Documentation
- **Project Docs:** See `/docs` folder
- **API Docs:** `server/API_DOCUMENTATION.md`
- **Deployment:** `server/RENDER_DEPLOYMENT.md`

### External Resources
- **Node.js:** https://nodejs.org/docs
- **React:** https://react.dev
- **Express:** https://expressjs.com
- **MongoDB:** https://docs.mongodb.com
- **Socket.IO:** https://socket.io/docs

### Community
- **GitHub Issues:** Report bugs and request features
- **Discussions:** Ask questions and share ideas

---

## ✅ Quick Reference

### Start Development
```bash
# Backend
cd Hackathonproject/server && npm run dev

# Frontend
cd Hackathonproject/client && npm run dev
```

### Run Tests
```bash
npm test
```

### Build for Production
```bash
# Frontend
npm run build

# Backend
npm start
```

### Deploy
```bash
# Push to GitHub (auto-deploys)
git push origin main
```

---

**Setup Complete! 🎉**

You're ready to develop, test, and deploy TrackER AI!
