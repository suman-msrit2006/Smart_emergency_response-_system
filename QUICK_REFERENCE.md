# ⚡ TrackER AI - Quick Reference Guide

Fast reference for common tasks and commands.

---

## 🚀 Quick Start

### Start Development (Local)

```bash
# Terminal 1: Backend
cd Hackathonproject/server && npm run dev

# Terminal 2: Frontend  
cd Hackathonproject/client && npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/health

---

## 📁 Important Files

### Configuration
- **Backend Env:** `server/.env`
- **Frontend Env:** `client/.env`
- **Backend Config:** `server/src/config/env.js`
- **API Config:** `client/src/config/api.js`

### Entry Points
- **Backend:** `server/src/server.js`
- **Frontend:** `client/src/main.jsx`

### Documentation
- **Installation:** `INSTALLATION_GUIDE.md`
- **Deployment:** `DEPLOYMENT_INSTRUCTIONS.md`
- **API Reference:** `server/API_DOCUMENTATION.md`
- **Folder Structure:** `FOLDER_STRUCTURE.md`

---

## 🔧 Common Commands

### Backend

```bash
# Install dependencies
npm install

# Development (with auto-reload)
npm run dev

# Production
npm start

# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

### Frontend

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database

```bash
# Connect to MongoDB (local)
mongosh

# Connect to MongoDB Atlas
mongosh "mongodb+srv://cluster.mongodb.net/tracker-ai" --username user

# Export database
mongodump --uri="mongodb://..." --out=backup

# Import database
mongorestore --uri="mongodb://..." backup/
```

---

## 🌐 API Endpoints

### Base URL
```
Development: http://localhost:5000/api
Production:  https://your-backend.onrender.com/api
```

### Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/auth/register` | POST | No | Register user |
| `/auth/login` | POST | No | Login user |
| `/auth/profile` | GET | Yes | Get profile |
| `/hospitals` | GET | Yes | List hospitals |
| `/hospitals` | POST | Yes | Create hospital |
| `/emergencies` | GET | Yes | List emergencies |
| `/emergencies` | POST | Yes | Create emergency |
| `/vitals` | GET | Yes | List vitals |
| `/vitals` | POST | Yes | Record vital |
| `/consultations` | GET | Yes | List consultations |
| `/feedbacks` | GET | Yes | List feedbacks |
| `/ambulances` | GET | Yes | List ambulances |

**See `server/API_DOCUMENTATION.md` for complete list**

---

## 🔐 Authentication

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Pass123!",
    "phone": "+1234567890",
    "role": "Patient"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Pass123!"
  }'
```

### Use Token

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔌 Socket.IO Events

### Connect

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

### Events to Emit

```javascript
// Join rooms
socket.emit('ambulance:join', ambulanceId);
socket.emit('emergency:join', emergencyId);
socket.emit('vitals:joinPatient', patientId);

// Update data
socket.emit('ambulance:updateLocation', { ambulanceId, coordinates });
socket.emit('emergency:updateStatus', { emergencyId, status });
```

### Events to Listen

```javascript
// Ambulance
socket.on('ambulance:locationUpdate', (data) => {});
socket.on('ambulance:statusUpdate', (data) => {});

// Emergency
socket.on('emergency:statusChanged', (data) => {});
socket.on('emergency:created', (data) => {});

// Vitals
socket.on('vitals:new', (data) => {});
socket.on('vitals:criticalAlert', (data) => {});
```

---

## 🗂️ File Structure Quick Guide

### Add New Feature

1. **Model:** `server/src/models/YourModel.js`
2. **Service:** `server/src/services/yourService.js`
3. **Controller:** `server/src/controllers/yourController.js`
4. **Routes:** `server/src/routes/yourRoutes.js`
5. **Validation:** `server/src/validations/yourValidation.js`
6. **Frontend Service:** `client/src/services/yourService.js`
7. **Frontend Page:** `client/src/pages/YourPage.jsx`

### File Locations

```
Backend:
├── Models → server/src/models/
├── Controllers → server/src/controllers/
├── Services → server/src/services/
├── Routes → server/src/routes/
├── Middleware → server/src/middleware/
├── Validations → server/src/validations/
└── Socket → server/src/socket/

Frontend:
├── Pages → client/src/pages/
├── Components → client/src/components/
├── Services → client/src/services/
├── Context → client/src/context/
└── Layouts → client/src/layouts/
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check MongoDB connection
# Verify .env file exists
# Check MONGODB_URI is correct

# Fix port in use
lsof -i :5000  # Find process
kill -9 PID    # Kill process
```

### Frontend Won't Start

```bash
# Check backend is running
# Verify .env file exists
# Check VITE_API_URL is correct

# Clear cache
rm -rf node_modules
npm install
```

### Database Connection Failed

```bash
# Check MongoDB is running (local)
brew services list | grep mongodb

# Check MongoDB Atlas
# 1. Verify IP whitelist (0.0.0.0/0)
# 2. Check database user credentials
# 3. Test connection string
```

### CORS Errors

```bash
# Update backend CLIENT_URL in .env
CLIENT_URL=http://localhost:5173

# Restart backend server
```

### Socket Not Connecting

```bash
# Check VITE_SOCKET_URL in frontend .env
VITE_SOCKET_URL=http://localhost:5000

# Check JWT token is valid
# Check browser console for errors
```

---

## 📦 Deployment Quick Steps

### Backend (Render)

1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect repository
4. Root: `Hackathonproject/server`
5. Build: `npm install`
6. Start: `npm start`
7. Add environment variables
8. Deploy

### Frontend (Vercel)

1. Go to vercel.com → New Project
2. Import repository
3. Root: `Hackathonproject/client`
4. Framework: Vite
5. Add environment variables
6. Deploy

### MongoDB (Atlas)

1. Go to mongodb.com/cloud/atlas
2. Create cluster (M0 Free)
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string
6. Add to Render environment variables

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tracker-ai
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Production (Backend)

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tracker-ai
JWT_SECRET=production-secret-64-characters
CLIENT_URL=https://your-frontend.vercel.app
LOG_LEVEL=info
```

### Production (Frontend)

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## 🧪 Testing Quick Commands

### Manual API Test

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!","phone":"+1234567890","role":"Patient"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

### Load Test

```bash
# Install Apache Bench
brew install httpd  # macOS

# Test 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:5000/api/health
```

---

## 📊 Monitoring

### Check Logs

```bash
# Backend (development)
# Logs appear in terminal where npm run dev is running

# Backend (production - Render)
# Go to Render dashboard → Service → Logs

# Frontend (production - Vercel)
# Go to Vercel dashboard → Project → Deployments → Logs
```

### Health Checks

```bash
# Local
curl http://localhost:5000/api/health

# Production
curl https://your-backend.onrender.com/api/health
```

### Database

```bash
# Check connection
mongosh "your-connection-string" --eval "db.adminCommand('ping')"

# Check collections
mongosh "your-connection-string" --eval "db.getCollectionNames()"
```

---

## 🔗 Important Links

### Documentation
- Installation Guide: `INSTALLATION_GUIDE.md`
- Deployment Guide: `DEPLOYMENT_INSTRUCTIONS.md`
- API Documentation: `server/API_DOCUMENTATION.md`
- Folder Structure: `FOLDER_STRUCTURE.md`
- Testing Guide: `API_TESTING_GUIDE.md`

### Services
- MongoDB Atlas: https://cloud.mongodb.com
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repository: https://github.com/your-username/tracker-ai

### External Resources
- Node.js Docs: https://nodejs.org/docs
- React Docs: https://react.dev
- Express Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com
- Socket.IO Docs: https://socket.io/docs

---

## 💡 Pro Tips

### Development

1. **Use nodemon for auto-reload** (already configured with `npm run dev`)
2. **Keep .env files secure** (never commit to git)
3. **Use ESLint** for code consistency
4. **Test endpoints with Postman** for easier debugging
5. **Check logs regularly** for errors

### Production

1. **Always use environment variables** for sensitive data
2. **Enable rate limiting** to prevent abuse
3. **Monitor logs daily** for errors
4. **Set up alerts** for downtime
5. **Regular backups** of database
6. **Keep dependencies updated** (`npm update`)
7. **Run security audits** (`npm audit`)

### Performance

1. **Use indexes** for frequently queried fields
2. **Implement pagination** for large datasets
3. **Enable compression** (already configured)
4. **Cache responses** where appropriate
5. **Optimize queries** (use projections)

---

## ❓ FAQ

### How do I add a new API endpoint?

1. Create validation schema in `server/src/validations/`
2. Add method in service: `server/src/services/`
3. Create controller method: `server/src/controllers/`
4. Add route: `server/src/routes/`
5. Update API documentation

### How do I add a new page?

1. Create page component: `client/src/pages/YourPage.jsx`
2. Add route in: `client/src/routes/AppRoutes.jsx`
3. Create API service: `client/src/services/yourService.js`
4. Add navigation link in Navbar (if needed)

### How do I change the port?

**Backend:** Update `PORT` in `server/.env`  
**Frontend:** Update in `client/vite.config.js`

### How do I reset the database?

```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Drop database
use tracker-ai
db.dropDatabase()
```

### How do I deploy updates?

```bash
git add .
git commit -m "Your update message"
git push origin main

# Render and Vercel will auto-deploy
```

---

## 📞 Getting Help

### Documentation First
1. Check `INSTALLATION_GUIDE.md`
2. Read `DEPLOYMENT_INSTRUCTIONS.md`
3. Review `API_DOCUMENTATION.md`
4. Check `FOLDER_STRUCTURE.md`

### Common Issues
1. Check logs (terminal or dashboard)
2. Verify environment variables
3. Test locally first
4. Check documentation for similar issues

### Still Stuck?
1. Review error messages carefully
2. Check browser console (F12)
3. Verify all services are running
4. Test API endpoints manually

---

## ✅ Quick Checklist

### Before Starting Development
- [ ] Node.js 18+ installed
- [ ] MongoDB running (local) or Atlas configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured

### Before Deploying
- [ ] All code committed to GitHub
- [ ] Tests passing
- [ ] Environment variables documented
- [ ] No console.log with sensitive data
- [ ] MongoDB Atlas configured
- [ ] Render account created
- [ ] Vercel account created

### After Deploying
- [ ] Backend health check passing
- [ ] Frontend accessible
- [ ] Can register/login
- [ ] All features working
- [ ] Socket.IO connecting
- [ ] No errors in logs

---

**Quick reference complete!** 📚

For detailed information, refer to the full documentation guides.

**Happy coding!** 🚀
