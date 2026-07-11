# Testing Guide

Complete guide for testing the TrackER AI Backend API.

---

## 📋 Table of Contents

1. [Manual Testing](#manual-testing)
2. [Automated Testing](#automated-testing)
3. [API Testing with Postman](#api-testing-with-postman)
4. [Load Testing](#load-testing)
5. [Security Testing](#security-testing)
6. [Socket.IO Testing](#socketio-testing)

---

## 🧪 Manual Testing

### Prerequisites
```bash
# Install dependencies
cd Hackathonproject/server
npm install

# Start server
npm run dev
```

### Health Check
```bash
# Test root endpoint
curl http://localhost:5000/

# Expected response:
{
  "status": "success",
  "message": "Welcome to TrackER AI API",
  "version": "1.0.0",
  "environment": "development",
  "documentation": "/api/health"
}

# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "success",
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

---

## 🔐 Authentication Tests

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "+1234567890",
    "role": "Patient"
  }'

# Expected response (201):
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user-id",
      "name": "Test User",
      "email": "test@example.com",
      "role": "Patient"
    },
    "token": "jwt-token-here"
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Expected response (200):
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "jwt-token"
  }
}
```

### Get Profile (Authenticated)
```bash
# Save token from login response
TOKEN="your-jwt-token"

curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Expected response (200):
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user-id",
      "name": "Test User",
      "email": "test@example.com",
      "role": "Patient"
    }
  }
}
```

---

## 🚨 Emergency Tests

### Create Emergency
```bash
curl -X POST http://localhost:5000/api/emergencies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "Cardiac Arrest",
    "severity": "Critical",
    "description": "Patient experiencing severe chest pain",
    "location": {
      "address": "123 Main St, New York, NY",
      "coordinates": [-73.935242, 40.730610]
    },
    "contactNumber": "+1234567890",
    "symptoms": ["Chest Pain", "Shortness of Breath"]
  }'

# Expected response (201):
{
  "status": "success",
  "message": "Emergency request created successfully",
  "data": {
    "emergency": {
      "_id": "emergency-id",
      "type": "Cardiac Arrest",
      "severity": "Critical",
      "status": "Pending",
      ...
    }
  }
}
```

### Get All Emergencies
```bash
curl http://localhost:5000/api/emergencies \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl "http://localhost:5000/api/emergencies?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl "http://localhost:5000/api/emergencies?status=Pending" \
  -H "Authorization: Bearer $TOKEN"
```

### Update Emergency Status
```bash
curl -X PATCH http://localhost:5000/api/emergencies/EMERGENCY_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "Ambulance Dispatched"
  }'
```

---

## 🏥 Hospital Tests

### Get All Hospitals
```bash
curl http://localhost:5000/api/hospitals

# With filters
curl "http://localhost:5000/api/hospitals?city=NewYork&status=Active"
```

### Get Hospital by ID
```bash
curl http://localhost:5000/api/hospitals/HOSPITAL_ID
```

### Get Nearby Hospitals
```bash
curl "http://localhost:5000/api/hospitals/nearby?longitude=-73.935242&latitude=40.730610&maxDistance=10000"
```

---

## 💓 Vitals Tests

### Record Vitals
```bash
curl -X POST http://localhost:5000/api/vitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heartRate": 75,
    "oxygenSaturation": 98,
    "temperature": 37.0,
    "respiratoryRate": 16,
    "painLevel": 0,
    "consciousness": "Alert",
    "location": "Home"
  }'
```

### Get Patient Vitals
```bash
curl http://localhost:5000/api/vitals/patient/PATIENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Get Critical Vitals
```bash
curl http://localhost:5000/api/vitals/critical \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Feedback Tests

### Submit Feedback
```bash
curl -X POST http://localhost:5000/api/feedbacks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "Hospital",
    "relatedTo": {
      "hospital": "HOSPITAL_ID"
    },
    "rating": 5,
    "title": "Excellent Service",
    "comment": "Very satisfied with the care received",
    "categories": ["Service Quality", "Staff Behavior"],
    "isAnonymous": false
  }'
```

### Vote on Feedback
```bash
curl -X POST http://localhost:5000/api/feedbacks/FEEDBACK_ID/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "vote": "helpful"
  }'
```

---

## 🔄 Error Testing

### Test 401 Unauthorized
```bash
# No token
curl http://localhost:5000/api/auth/profile

# Invalid token
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid-token"
```

### Test 400 Bad Request
```bash
# Missing required fields
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Test 404 Not Found
```bash
curl http://localhost:5000/api/nonexistent
```

### Test 429 Rate Limit
```bash
# Make many requests quickly (in production only)
for i in {1..150}; do
  curl http://localhost:5000/api/health
done
```

---

## 🤖 Automated Testing

### Setup Testing Framework
```bash
# Install testing dependencies
npm install --save-dev jest supertest mongodb-memory-server

# Create test directory
mkdir -p src/__tests__
```

### Example Test File
Create `src/__tests__/auth.test.js`:

```javascript
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test123!',
          phone: '+1234567890',
          role: 'Patient'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test123!',
          phone: '+1234567890',
          role: 'Patient'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
    });
  });
});
```

### Run Tests
```bash
npm test
```

---

## 📮 API Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Create new collection: "TrackER AI"
4. Add environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (set after login)

### Test Scenarios

#### 1. Authentication Flow
```
1. Register User → Save token
2. Login User → Save token
3. Get Profile → Use token
4. Logout → Clear token
```

#### 2. Emergency Flow
```
1. Create Emergency
2. Get All Emergencies
3. Get Emergency by ID
4. Update Status
5. Assign Ambulance
6. Assign Hospital
```

#### 3. Data Flow
```
1. Create Hospital
2. Create Ambulance
3. Create Emergency
4. Record Vitals
5. Submit Feedback
```

---

## 🚀 Load Testing

### Using Apache Bench
```bash
# Install Apache Bench
sudo apt-get install apache2-utils  # Ubuntu
brew install ab  # macOS

# Test health endpoint
ab -n 1000 -c 10 http://localhost:5000/api/health

# Test with POST request
ab -n 100 -c 10 -p data.json -T application/json \
   http://localhost:5000/api/auth/login
```

### Using Artillery
```bash
# Install Artillery
npm install -g artillery

# Create test script: artillery-test.yml
artillery run artillery-test.yml
```

**artillery-test.yml:**
```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
  
scenarios:
  - name: "Health check"
    flow:
      - get:
          url: "/api/health"
  
  - name: "Get emergencies"
    flow:
      - get:
          url: "/api/emergencies"
```

---

## 🔒 Security Testing

### SQL Injection Prevention
```bash
# Try NoSQL injection
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$ne": null},
    "password": {"$ne": null}
  }'

# Should return 400 Bad Request (sanitized)
```

### JWT Token Validation
```bash
# Expired token
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer expired-token"

# Malformed token
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer malformed.token.here"
```

### Rate Limiting
```bash
# Rapid requests (production only)
for i in {1..200}; do
  curl http://localhost:5000/api/health &
done

# Should get 429 after limit reached
```

---

## 🔌 Socket.IO Testing

### Using Socket.IO Client
```bash
npm install socket.io-client
```

**test-socket.js:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  
  // Join emergency room
  socket.emit('emergency:join', 'emergency-id');
});

socket.on('emergency:statusChanged', (data) => {
  console.log('📢 Emergency status changed:', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});
```

### Run Socket Test
```bash
node test-socket.js
```

---

## ✅ Testing Checklist

### Manual Testing
- [ ] Health check endpoint
- [ ] User registration
- [ ] User login
- [ ] Authentication (valid token)
- [ ] Authentication (invalid token)
- [ ] Create emergency
- [ ] List emergencies
- [ ] Update emergency status
- [ ] List hospitals
- [ ] Filter hospitals
- [ ] Record vitals
- [ ] Get patient vitals
- [ ] Submit feedback
- [ ] Vote on feedback
- [ ] Error handling (400, 401, 404, 500)

### Automated Testing
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Tests passing locally
- [ ] Tests passing in CI/CD
- [ ] Code coverage > 70%

### Load Testing
- [ ] Health endpoint load test
- [ ] API endpoints load test
- [ ] Socket.IO connections test
- [ ] Database performance test

### Security Testing
- [ ] NoSQL injection prevention
- [ ] JWT validation
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Helmet security headers
- [ ] Input sanitization

### Socket.IO Testing
- [ ] Connection with auth
- [ ] Connection without auth
- [ ] Room joining
- [ ] Event broadcasting
- [ ] Error handling
- [ ] Disconnection handling

---

## 📊 Performance Benchmarks

### Expected Performance
- **Health Check:** < 50ms
- **Authentication:** < 200ms
- **Database Queries:** < 100ms
- **API Endpoints:** < 500ms
- **Socket Events:** < 100ms

### Monitoring Tools
- **New Relic** - Application performance
- **DataDog** - Infrastructure monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay

---

## 🐛 Common Issues

### Tests Failing
```
Error: ECONNREFUSED
```
**Solution:** Ensure server is running

### Database Connection Error
```
Error: MongooseServerSelectionError
```
**Solution:** Check MongoDB is running

### Token Expired
```
Error: jwt expired
```
**Solution:** Generate new token (login again)

---

## 📝 Test Reports

### Generate Coverage Report
```bash
npm test -- --coverage
```

### View HTML Report
```bash
open coverage/lcov-report/index.html
```

---

## 🎯 Best Practices

1. **Test Isolation** - Each test should be independent
2. **Clean Data** - Clean up after each test
3. **Mock External Services** - Don't depend on external APIs
4. **Test Edge Cases** - Test boundary conditions
5. **Descriptive Names** - Use clear test names
6. **Fast Tests** - Keep tests running quickly
7. **CI/CD Integration** - Run tests automatically

---

**Testing Complete! ✅**

Your API is thoroughly tested and ready for production.
