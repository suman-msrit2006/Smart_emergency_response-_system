# TrackER AI Backend - Production Guide

Complete production deployment and maintenance guide.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Render account (or similar hosting)
- GitHub repository

### Installation
```bash
cd Hackathonproject/server
npm install
```

### Environment Configuration
```bash
cp .env.example .env
# Edit .env with your values
```

### Start Development
```bash
npm run dev
```

### Start Production
```bash
npm start
```

---

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection
│   │   ├── env.js       # Environment variables
│   │   └── socket.js    # Socket.IO config (deprecated - use socket folder)
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   ├── emergencyController.js
│   │   ├── hospitalController.js
│   │   ├── vitalController.js
│   │   ├── consultationController.js
│   │   ├── feedbackController.js
│   │   └── ambulanceController.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # JWT authentication
│   │   ├── security.js  # Security middleware
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Emergency.js
│   │   ├── Hospital.js
│   │   ├── Vital.js
│   │   ├── Consultation.js
│   │   ├── Feedback.js
│   │   └── Ambulance.js
│   ├── routes/          # API routes
│   │   └── index.js
│   ├── services/        # Business logic
│   │   ├── emergencyService.js
│   │   ├── hospitalService.js
│   │   ├── vitalService.js
│   │   ├── consultationService.js
│   │   ├── feedbackService.js
│   │   └── ambulanceService.js
│   ├── socket/          # Socket.IO implementation
│   │   ├── index.js
│   │   ├── ambulance.socket.js
│   │   ├── emergency.socket.js
│   │   └── vitals.socket.js
│   ├── utils/           # Utility functions
│   │   ├── logger.js
│   │   ├── jwt.js
│   │   └── AppError.js
│   ├── validations/     # Request validation
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── .env.example         # Environment template
├── .env.production      # Production environment template
├── .gitignore
├── package.json
├── RENDER_DEPLOYMENT.md
├── MONGODB_ATLAS_SETUP.md
├── PRODUCTION_README.md (this file)
└── API_DOCUMENTATION.md
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Application
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tracker-ai

# JWT
JWT_SECRET=your-32-character-minimum-secret-key
JWT_EXPIRES_IN=7d

# Client
CLIENT_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Generate Secure JWT_SECRET

```bash
# Method 1: OpenSSL
openssl rand -base64 64

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 3: Online
# https://randomkeygen.com/
```

---

## 🏗️ Production Features

### Security
- ✅ Helmet.js - Security headers
- ✅ CORS - Cross-origin resource sharing
- ✅ Rate Limiting - Prevent abuse
- ✅ MongoDB Sanitization - Prevent NoSQL injection
- ✅ JWT Authentication - Secure user sessions
- ✅ Password Hashing - Bcrypt encryption
- ✅ Input Validation - Request validation
- ✅ Error Handling - Global error handler

### Performance
- ✅ Compression - Gzip compression
- ✅ Connection Pooling - Database optimization
- ✅ Caching Headers - Response caching
- ✅ Query Optimization - Database indexes
- ✅ Pagination - Large dataset handling

### Monitoring
- ✅ Request Logging - Morgan logger
- ✅ Error Logging - Winston logger
- ✅ Health Checks - /api/health endpoint
- ✅ Performance Metrics - Response times

### Real-Time
- ✅ Socket.IO - WebSocket support
- ✅ Room Management - Targeted broadcasting
- ✅ Authentication - JWT token validation
- ✅ Error Handling - Connection recovery

---

## 🔒 Security Best Practices

### 1. Environment Variables
```bash
# Never commit .env files
# Use different secrets per environment
# Rotate secrets regularly
```

### 2. CORS Configuration
```javascript
// Whitelist specific origins
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];
```

### 3. Rate Limiting
```javascript
// Adjust based on your needs
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100 // 100 requests per window
```

### 4. Database Security
```bash
# Use MongoDB Atlas IP whitelist
# Enable audit logs (M10+)
# Use strong database passwords
# Limit user privileges
```

### 5. JWT Security
```bash
# Use strong secret (32+ characters)
# Set appropriate expiration (7d)
# Implement refresh tokens (optional)
# Store securely on client
```

---

## 📊 API Endpoints

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-api-domain.com/api`

### Authentication
```
POST   /api/auth/register    # Register user
POST   /api/auth/login       # Login user
GET    /api/auth/profile     # Get profile (authenticated)
```

### Emergencies
```
GET    /api/emergencies           # List all
POST   /api/emergencies           # Create
GET    /api/emergencies/:id       # Get one
PATCH  /api/emergencies/:id       # Update
DELETE /api/emergencies/:id       # Delete
PATCH  /api/emergencies/:id/status           # Update status
PATCH  /api/emergencies/:id/assign-ambulance # Assign ambulance
PATCH  /api/emergencies/:id/assign-hospital  # Assign hospital
GET    /api/emergencies/nearby               # Find nearby
GET    /api/emergencies/patient/:id          # Patient emergencies
```

### Hospitals
```
GET    /api/hospitals           # List all
POST   /api/hospitals           # Create
GET    /api/hospitals/:id       # Get one
PATCH  /api/hospitals/:id       # Update
DELETE /api/hospitals/:id       # Delete
PATCH  /api/hospitals/:id/capacity    # Update capacity
GET    /api/hospitals/nearby          # Find nearby
GET    /api/hospitals/specialty/:name # By specialty
```

### Vitals
```
GET    /api/vitals                      # List all
POST   /api/vitals                      # Create
GET    /api/vitals/:id                  # Get one
PATCH  /api/vitals/:id                  # Update
DELETE /api/vitals/:id                  # Delete
GET    /api/vitals/patient/:id          # Patient vitals
GET    /api/vitals/patient/:id/latest   # Latest vital
GET    /api/vitals/critical             # Critical vitals
GET    /api/vitals/emergency/:id        # Emergency vitals
GET    /api/vitals/consultation/:id     # Consultation vitals
```

### Consultations
```
GET    /api/consultations                    # List all
POST   /api/consultations                    # Create
GET    /api/consultations/:id                # Get one
PATCH  /api/consultations/:id                # Update
DELETE /api/consultations/:id                # Delete
PATCH  /api/consultations/:id/start          # Start
PATCH  /api/consultations/:id/complete       # Complete
POST   /api/consultations/:id/prescriptions  # Add prescription
POST   /api/consultations/:id/lab-tests      # Add lab test
GET    /api/consultations/patient/:id        # Patient consultations
GET    /api/consultations/doctor/:id         # Doctor consultations
```

### Feedback
```
GET    /api/feedbacks              # List all
POST   /api/feedbacks              # Create
GET    /api/feedbacks/:id          # Get one
PATCH  /api/feedbacks/:id          # Update
DELETE /api/feedbacks/:id          # Delete
POST   /api/feedbacks/:id/vote     # Vote
GET    /api/feedbacks/hospital/:id # Hospital feedback
GET    /api/feedbacks/doctor/:id   # Doctor feedback
GET    /api/feedbacks/my-feedbacks # My feedback
```

### Ambulances
```
GET    /api/ambulances              # List all
POST   /api/ambulances              # Create
GET    /api/ambulances/:id          # Get one
PATCH  /api/ambulances/:id          # Update
DELETE /api/ambulances/:id          # Delete
PATCH  /api/ambulances/:id/location # Update location
PATCH  /api/ambulances/:id/status   # Update status
PATCH  /api/ambulances/:id/fuel     # Update fuel
GET    /api/ambulances/available    # Available ambulances
```

### Health Check
```
GET    /                  # API info
GET    /api/health        # Health status
```

---

## 🔄 Socket.IO Events

### Connection
```javascript
socket.on('connect', () => {
  // Connected
});

socket.on('connection:success', (data) => {
  // Connection confirmed
});
```

### Ambulance
```javascript
// Client emits
socket.emit('ambulance:join', ambulanceId);
socket.emit('ambulance:updateLocation', { ambulanceId, coordinates });
socket.emit('ambulance:updateStatus', { ambulanceId, status });

// Server emits
socket.on('ambulance:locationUpdate', (data) => {});
socket.on('ambulance:statusUpdate', (data) => {});
socket.on('ambulance:assigned', (data) => {});
```

### Emergency
```javascript
// Client emits
socket.emit('emergency:join', emergencyId);
socket.emit('emergency:updateStatus', { emergencyId, status });

// Server emits
socket.on('emergency:created', (data) => {});
socket.on('emergency:statusChanged', (data) => {});
socket.on('emergency:hospitalAssigned', (data) => {});
```

### Vitals
```javascript
// Client emits
socket.emit('vitals:joinPatient', patientId);
socket.emit('vitals:stream', vitalData);

// Server emits
socket.on('vitals:new', (data) => {});
socket.on('vitals:criticalAlert', (data) => {});
```

---

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl https://your-api.com/api/health

# Register
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "+1234567890",
    "role": "Patient"
  }'

# Login
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get emergencies (with auth)
curl https://your-api.com/api/emergencies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Automated Testing
```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

---

## 📈 Monitoring & Logging

### Log Levels
```
error - Errors only
warn - Warnings and errors
info - Information, warnings, and errors (production default)
debug - Debug info (development only)
```

### Health Monitoring
```javascript
// GET /api/health
{
  "status": "success",
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### Error Logging
- All errors logged to console
- Production errors include minimal details (security)
- Development errors include stack traces

---

## 🚨 Error Handling

### Standard Error Response
```javascript
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🔧 Maintenance

### Database Backups
```bash
# Manual backup (MongoDB Atlas)
1. Go to cluster
2. Click "..." menu
3. Select "Download Snapshot"

# Automated backups (M10+ only)
- Enabled by default
- Point-in-time recovery
- 7-day retention
```

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm update express

# Check security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Rotate Secrets
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update in environment
# Render: Settings → Environment → Edit
# Update JWT_SECRET value

# Redeploy service
```

---

## 🐛 Troubleshooting

### Server Won't Start
```
Error: Missing required environment variables: MONGODB_URI
```
**Solution:** Add all required environment variables

### Database Connection Failed
```
Error: MongooseServerSelectionError
```
**Solution:** 
- Check MongoDB URI
- Verify IP whitelist
- Check database credentials

### Authentication Failed
```
Error: jwt malformed
```
**Solution:**
- Check JWT_SECRET is set
- Verify token format
- Check token expiration

### Rate Limit Exceeded
```
Error: Too many requests
```
**Solution:**
- Wait 15 minutes
- Increase rate limits
- Implement request queueing

---

## 📚 Additional Documentation

- **API Documentation:** See `API_DOCUMENTATION.md`
- **Socket.IO Events:** See `SOCKET_IMPLEMENTATION.md`
- **Deployment Guide:** See `RENDER_DEPLOYMENT.md`
- **MongoDB Setup:** See `MONGODB_ATLAS_SETUP.md`
- **Testing Guide:** See `TESTING_GUIDE.md`

---

## 🎯 Production Checklist

### Pre-Deployment
- [ ] All environment variables set
- [ ] MongoDB Atlas configured
- [ ] Secrets generated and secured
- [ ] CORS configured for production domain
- [ ] Rate limits configured
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Health checks working

### Deployment
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables added to Render
- [ ] Build successful
- [ ] Deployment successful
- [ ] Health check passing

### Post-Deployment
- [ ] API endpoints tested
- [ ] Authentication working
- [ ] Socket.IO connections working
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team notified

---

## 📞 Support

### Issues
- Check logs first
- Verify environment variables
- Test locally before deploying
- Check documentation

### Resources
- **Render Docs:** https://render.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **Express Docs:** https://expressjs.com
- **Socket.IO Docs:** https://socket.io/docs

---

## 🚀 Performance Tips

1. **Database Optimization**
   - Create indexes for frequent queries
   - Use projections to limit returned fields
   - Implement pagination
   - Use aggregation pipelines

2. **API Optimization**
   - Enable compression
   - Implement caching
   - Use CDN for static assets
   - Optimize response payloads

3. **Socket.IO Optimization**
   - Use rooms for targeted broadcasting
   - Limit event frequency
   - Implement reconnection logic
   - Clean up listeners

4. **Monitoring**
   - Set up alerts
   - Monitor error rates
   - Track response times
   - Monitor resource usage

---

**Production Ready! 🎉**

Your TrackER AI Backend is configured for production deployment.
