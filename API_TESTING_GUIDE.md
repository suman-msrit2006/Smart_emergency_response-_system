# 🧪 TrackER AI - API Testing Guide

Complete guide for testing all API endpoints manually and automatically.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Testing Tools](#testing-tools)
3. [Environment Setup](#environment-setup)
4. [Authentication Flow](#authentication-flow)
5. [Endpoint Tests](#endpoint-tests)
6. [Socket.IO Testing](#socketio-testing)
7. [Error Scenarios](#error-scenarios)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)

---

## ✅ Prerequisites

### Required
- Backend running (local or production)
- API testing tool (cURL, Postman, or Insomnia)
- Valid JWT token for authenticated endpoints

### Tools Installation

**cURL** (Command line - pre-installed on most systems)
```bash
curl --version
```

**Postman** (GUI - Recommended)
- Download: https://www.postman.com/downloads/
- Import collection from this guide

**HTTPie** (Command line - User-friendly)
```bash
# macOS
brew install httpie

# Linux
pip install httpie

# Windows
pip install httpie
```

---

## 🔧 Testing Tools

### Using cURL

**Basic Request:**
```bash
curl -X GET http://localhost:5000/api/health
```

**POST Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Pass123!"}'
```

**With Authentication:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using HTTPie

**Basic Request:**
```bash
http GET http://localhost:5000/api/health
```

**POST Request:**
```bash
http POST http://localhost:5000/api/auth/register \
  name="John Doe" \
  email="john@example.com" \
  password="Pass123!" \
  phone="+1234567890" \
  role="Patient"
```

**With Authentication:**
```bash
http GET http://localhost:5000/api/auth/profile \
  "Authorization: Bearer YOUR_TOKEN"
```

---

## 🌐 Environment Setup

### Variables

Create a file `test.env` with:

```env
API_URL=http://localhost:5000/api
TOKEN=
USER_ID=
HOSPITAL_ID=
EMERGENCY_ID=
VITAL_ID=
CONSULTATION_ID=
FEEDBACK_ID=
AMBULANCE_ID=
```

### For Testing

Replace in commands:
- `{API_URL}` → Your API URL
- `{TOKEN}` → Your JWT token
- `{USER_ID}` → User ID
- etc.

---

## 🔐 Authentication Flow

### 1. Register New User

**Request:**
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
```

**Expected Response (201):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60d5ec49f1b2c72b8c8e4a1b",
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+1234567890",
      "role": "Patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** for subsequent requests!

### 2. Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60d5ec49f1b2c72b8c8e4a1b",
      "name": "Test User",
      "email": "test@example.com",
      "role": "Patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Profile

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60d5ec49f1b2c72b8c8e4a1b",
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+1234567890",
      "role": "Patient",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 📡 Endpoint Tests

### Health Check

**No authentication required**

```bash
# Root endpoint
curl http://localhost:5000/

# Health endpoint
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "API is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

---

### Hospitals

#### Get All Hospitals

```bash
curl -X GET http://localhost:5000/api/hospitals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Hospital

```bash
curl -X POST http://localhost:5000/api/hospitals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City General Hospital",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "phone": "+1234567890",
    "email": "info@cityhospital.com",
    "location": {
      "type": "Point",
      "coordinates": [-73.935242, 40.730610]
    },
    "capacity": {
      "totalBeds": 500,
      "availableBeds": 50,
      "icuBeds": 100,
      "availableIcuBeds": 10,
      "emergencyBeds": 50,
      "availableEmergencyBeds": 5
    },
    "specialties": ["Cardiology", "Neurology", "Orthopedic"],
    "emergencyServices": true
  }'
```

#### Get Hospital by ID

```bash
curl -X GET http://localhost:5000/api/hospitals/{HOSPITAL_ID} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Hospital

```bash
curl -X PATCH http://localhost:5000/api/hospitals/{HOSPITAL_ID} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "capacity": {
      "availableBeds": 45
    }
  }'
```

#### Find Nearby Hospitals

```bash
curl -X GET "http://localhost:5000/api/hospitals/nearby?lat=40.730610&lng=-73.935242&maxDistance=5000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Emergencies

#### Create Emergency

```bash
curl -X POST http://localhost:5000/api/emergencies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "John Doe",
    "patientAge": 35,
    "patientGender": "Male",
    "contactNumber": "+1234567890",
    "emergencyType": "Medical Emergency",
    "severity": "High",
    "symptoms": "Chest pain, difficulty breathing",
    "location": {
      "type": "Point",
      "coordinates": [-73.935242, 40.730610]
    },
    "address": {
      "street": "456 Park Ave",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }'
```

#### Get All Emergencies

```bash
curl -X GET http://localhost:5000/api/emergencies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Emergency Status

```bash
curl -X PATCH http://localhost:5000/api/emergencies/{EMERGENCY_ID}/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Dispatched"
  }'
```

#### Assign Ambulance

```bash
curl -X PATCH http://localhost:5000/api/emergencies/{EMERGENCY_ID}/assign-ambulance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ambulanceId": "AMBULANCE_ID"
  }'
```

---

### Vitals

#### Record Vital Signs

```bash
curl -X POST http://localhost:5000/api/vitals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient": "USER_ID",
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heartRate": 75,
    "oxygenSaturation": 98,
    "temperature": 98.6,
    "respiratoryRate": 16,
    "bloodGlucose": 95,
    "notes": "Patient feeling normal"
  }'
```

#### Get Patient Vitals

```bash
curl -X GET http://localhost:5000/api/vitals/patient/{USER_ID} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Latest Vital

```bash
curl -X GET http://localhost:5000/api/vitals/patient/{USER_ID}/latest \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Consultations

#### Create Consultation

```bash
curl -X POST http://localhost:5000/api/consultations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient": "PATIENT_ID",
    "doctor": "DOCTOR_ID",
    "type": "In-Person",
    "chiefComplaint": "Chest pain",
    "scheduledAt": "2024-01-15T10:00:00.000Z"
  }'
```

#### Get All Consultations

```bash
curl -X GET http://localhost:5000/api/consultations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Start Consultation

```bash
curl -X PATCH http://localhost:5000/api/consultations/{CONSULTATION_ID}/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Complete Consultation

```bash
curl -X PATCH http://localhost:5000/api/consultations/{CONSULTATION_ID}/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "diagnosis": "Anxiety-related chest pain",
    "treatmentPlan": "Rest and stress management",
    "notes": "Patient should follow up in 2 weeks"
  }'
```

#### Add Prescription

```bash
curl -X POST http://localhost:5000/api/consultations/{CONSULTATION_ID}/prescriptions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medication": "Aspirin",
    "dosage": "100mg",
    "frequency": "Once daily",
    "duration": "7 days",
    "instructions": "Take with food"
  }'
```

---

### Feedback

#### Submit Feedback

```bash
curl -X POST http://localhost:5000/api/feedbacks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Hospital",
    "entityId": "HOSPITAL_ID",
    "rating": 5,
    "feedbackType": "Service",
    "comment": "Excellent service and staff",
    "isAnonymous": false
  }'
```

#### Get All Feedback

```bash
curl -X GET http://localhost:5000/api/feedbacks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Vote on Feedback

```bash
curl -X POST http://localhost:5000/api/feedbacks/{FEEDBACK_ID}/vote \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isHelpful": true
  }'
```

---

### Ambulances

#### Create Ambulance

```bash
curl -X POST http://localhost:5000/api/ambulances \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleNumber": "AMB-001",
    "type": "Advanced Life Support",
    "hospitalId": "HOSPITAL_ID",
    "driver": "DRIVER_ID",
    "location": {
      "type": "Point",
      "coordinates": [-73.935242, 40.730610]
    }
  }'
```

#### Update Ambulance Location

```bash
curl -X PATCH http://localhost:5000/api/ambulances/{AMBULANCE_ID}/location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "type": "Point",
      "coordinates": [-73.945242, 40.740610]
    }
  }'
```

#### Get Available Ambulances

```bash
curl -X GET http://localhost:5000/api/ambulances/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔌 Socket.IO Testing

### Using Socket.IO Client (Browser Console)

```javascript
// Connect to socket
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// Join ambulance room
socket.emit('ambulance:join', 'AMBULANCE_ID');

// Listen for location updates
socket.on('ambulance:locationUpdate', (data) => {
  console.log('Location update:', data);
});

// Join patient room
socket.emit('vitals:joinPatient', 'PATIENT_ID');

// Listen for new vitals
socket.on('vitals:new', (data) => {
  console.log('New vitals:', data);
});

// Listen for errors
socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Disconnect
socket.disconnect();
```

### Using Socket.IO Testing Tools

**Postman (WebSocket support):**
1. Create new WebSocket request
2. URL: `ws://localhost:5000`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Send events: `ambulance:join`, `vitals:joinPatient`

---

## ❌ Error Scenarios

### 400 - Bad Request

**Missing required fields:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Response:**
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### 401 - Unauthorized

**Missing token:**
```bash
curl -X GET http://localhost:5000/api/auth/profile
```

**Invalid token:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token"
```

**Response:**
```json
{
  "status": "error",
  "message": "Invalid token. Please log in again."
}
```

### 403 - Forbidden

**Insufficient permissions:**
```bash
# Patient trying to create hospital (requires Hospital Admin)
curl -X POST http://localhost:5000/api/hospitals \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Response:**
```json
{
  "status": "error",
  "message": "You do not have permission to perform this action"
}
```

### 404 - Not Found

**Invalid ID:**
```bash
curl -X GET http://localhost:5000/api/hospitals/invalid_id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 429 - Too Many Requests

**Rate limit exceeded:**
```bash
# Make 101 requests within 15 minutes
for i in {1..101}; do
  curl http://localhost:5000/api/health
done
```

**Response:**
```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 - Internal Server Error

**Database connection error:**
```bash
# Stop MongoDB and make request
curl -X GET http://localhost:5000/api/hospitals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "status": "error",
  "message": "Something went wrong!"
}
```

---

## ⚡ Performance Testing

### Response Time Test

```bash
# Using time command
time curl http://localhost:5000/api/health

# Expected: < 100ms for health check
# Expected: < 500ms for database queries
```

### Load Testing with Apache Bench

```bash
# Install Apache Bench
# macOS: brew install httpd
# Ubuntu: apt-get install apache2-utils

# Test 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:5000/api/health

# With authentication
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/hospitals
```

### Load Testing with wrk

```bash
# Install wrk
# macOS: brew install wrk
# Ubuntu: build from source

# Test for 30 seconds, 10 threads, 100 connections
wrk -t10 -c100 -d30s http://localhost:5000/api/health

# With authentication
wrk -t10 -c100 -d30s -H "Authorization: Bearer TOKEN" http://localhost:5000/api/hospitals
```

---

## 🔒 Security Testing

### SQL Injection Test (Should Fail)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com OR 1=1--",
    "password": "anything"
  }'
```

**Expected:** Validation error or login failure

### NoSQL Injection Test (Should Fail)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$gt": ""},
    "password": {"$gt": ""}
  }'
```

**Expected:** Sanitized by express-mongo-sanitize

### XSS Test (Should Be Sanitized)

```bash
curl -X POST http://localhost:5000/api/emergencies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "<script>alert(\"XSS\")</script>",
    "symptoms": "<img src=x onerror=alert(1)>"
  }'
```

**Expected:** Script tags removed or escaped

### CORS Test

```bash
# From different origin
curl -X GET http://localhost:5000/api/health \
  -H "Origin: http://evil.com"
```

**Expected:** CORS error if origin not allowed

---

## 📊 Test Results Template

### API Test Report

```
Test Date: 2024-01-01
API URL: http://localhost:5000/api
Tester: Your Name

=== AUTHENTICATION ===
✅ Register User - 201
✅ Login User - 200
✅ Get Profile - 200
✅ Invalid Token - 401
✅ Expired Token - 401

=== HOSPITALS ===
✅ Get All Hospitals - 200
✅ Create Hospital - 201
✅ Get Hospital by ID - 200
✅ Update Hospital - 200
✅ Delete Hospital - 200
✅ Find Nearby - 200

=== EMERGENCIES ===
✅ Create Emergency - 201
✅ Get All Emergencies - 200
✅ Update Status - 200
✅ Assign Ambulance - 200
✅ Assign Hospital - 200

=== VITALS ===
✅ Record Vitals - 201
✅ Get Patient Vitals - 200
✅ Get Latest Vital - 200
✅ Critical Vitals - 200

=== CONSULTATIONS ===
✅ Create Consultation - 201
✅ Start Consultation - 200
✅ Complete Consultation - 200
✅ Add Prescription - 200

=== FEEDBACK ===
✅ Submit Feedback - 201
✅ Get Feedbacks - 200
✅ Vote on Feedback - 200

=== AMBULANCES ===
✅ Create Ambulance - 201
✅ Update Location - 200
✅ Get Available - 200

=== SOCKET.IO ===
✅ Connect - Success
✅ Join Room - Success
✅ Receive Events - Success

=== SECURITY ===
✅ Rate Limiting - 429
✅ SQL Injection - Blocked
✅ NoSQL Injection - Sanitized
✅ XSS - Sanitized
✅ CORS - Configured

=== PERFORMANCE ===
✅ Health Check - 50ms
✅ Database Query - 200ms
✅ Load Test - 1000 req/s

TOTAL TESTS: 45
PASSED: 45
FAILED: 0
SUCCESS RATE: 100%
```

---

## 🎯 Automated Testing Script

### Bash Script

```bash
#!/bin/bash

API_URL="http://localhost:5000/api"
TOKEN=""

echo "=== TrackER AI API Test Suite ==="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ $response -eq 200 ]; then
  echo "✅ PASS"
else
  echo "❌ FAIL ($response)"
fi

# Test 2: Register
echo "Test 2: Register User"
response=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "Test123!",
    "phone": "+1234567890",
    "role": "Patient"
  }')
TOKEN=$(echo $response | grep -o '"token":"[^"]*' | sed 's/"token":"//')
if [ -n "$TOKEN" ]; then
  echo "✅ PASS"
else
  echo "❌ FAIL"
fi

# Test 3: Get Profile
echo "Test 3: Get Profile"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN")
if [ $response -eq 200 ]; then
  echo "✅ PASS"
else
  echo "❌ FAIL ($response)"
fi

# Add more tests...

echo ""
echo "=== Test Suite Complete ==="
```

---

## 📝 Postman Collection

### Import Collection

```json
{
  "info": {
    "name": "TrackER AI API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\",\n  \"phone\": \"+1234567890\",\n  \"role\": \"Patient\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## ✅ Testing Checklist

### Before Testing
- [ ] Backend server running
- [ ] Database connected
- [ ] Environment variables set
- [ ] Testing tool installed

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get user profile
- [ ] Invalid token returns 401
- [ ] Missing token returns 401

### Hospitals
- [ ] Create hospital
- [ ] Get all hospitals
- [ ] Get hospital by ID
- [ ] Update hospital
- [ ] Delete hospital
- [ ] Find nearby hospitals

### Emergencies
- [ ] Create emergency
- [ ] Get all emergencies
- [ ] Update status
- [ ] Assign ambulance
- [ ] Assign hospital

### Vitals
- [ ] Record vitals
- [ ] Get patient vitals
- [ ] Get latest vital
- [ ] Critical vitals alert

### Consultations
- [ ] Create consultation
- [ ] Start consultation
- [ ] Complete consultation
- [ ] Add prescription

### Feedback
- [ ] Submit feedback
- [ ] Get feedbacks
- [ ] Vote on feedback

### Ambulances
- [ ] Create ambulance
- [ ] Update location
- [ ] Get available ambulances

### Socket.IO
- [ ] Connect to socket
- [ ] Join rooms
- [ ] Receive events
- [ ] Disconnect gracefully

### Security
- [ ] Rate limiting works
- [ ] SQL injection blocked
- [ ] NoSQL injection sanitized
- [ ] XSS attempts sanitized
- [ ] CORS properly configured

### Performance
- [ ] Response times acceptable
- [ ] Load test passed
- [ ] No memory leaks

---

**API Testing Complete!** ✅

Use this guide to verify all endpoints work correctly before deployment.
