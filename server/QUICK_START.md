# TrackER AI Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd Hackathonproject/server
npm install
```

### Step 2: Set Up MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account / Sign in
3. Create a new cluster (Free M0 cluster)
4. Create a database user:
   - Username: `tracker_admin`
   - Password: (generate a strong password)
5. Add IP to whitelist:
   - Click "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

### Step 3: Create Environment File
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000

# Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://tracker_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tracker-ai?retryWrites=true&w=majority

# Generate a strong secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-key-here

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: Start the Server
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database: tracker-ai
✅ Server running in development mode on port 5000
ℹ️  API Health Check: http://localhost:5000/api/health
```

### Step 5: Test the API

Open a new terminal and test:

```bash
# Health check
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

## 🧪 Test User Registration & Login

### Register a Patient:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "phone": "+1234567890",
    "role": "Patient"
  }'
```

Save the token from the response!

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Get Profile (replace TOKEN):
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Create Sample Data

### 1. Register Hospital Admin:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hospital Admin",
    "email": "admin@hospital.com",
    "password": "AdminPass123",
    "phone": "+1234567891",
    "role": "Hospital Admin"
  }'
```
**Save the token as ADMIN_TOKEN**

### 2. Create a Hospital:
```bash
curl -X POST http://localhost:5000/api/hospitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "City General Hospital",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "location": {
      "coordinates": [-73.935242, 40.730610]
    },
    "phone": "+1234567892",
    "email": "info@cityhospital.com",
    "emergencyContact": "+1234567893",
    "specialties": ["Cardiology", "Emergency", "Orthopedics"],
    "capacity": {
      "totalBeds": 200,
      "availableBeds": 150,
      "icuBeds": 20,
      "emergencyBeds": 30
    }
  }'
```
**Save the hospital ID**

### 3. Get All Hospitals:
```bash
curl http://localhost:5000/api/hospitals
```

### 4. Get Nearby Hospitals:
```bash
curl "http://localhost:5000/api/hospitals/nearby?longitude=-73.935242&latitude=40.730610"
```

## 🏥 Test Emergency Flow

### 1. Create Emergency (as Patient):
```bash
curl -X POST http://localhost:5000/api/emergencies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -d '{
    "patient": "PATIENT_USER_ID",
    "type": "Cardiac Arrest",
    "severity": "Critical",
    "description": "Patient experiencing severe chest pain and difficulty breathing",
    "location": {
      "coordinates": [-73.935242, 40.730610],
      "address": "123 Main St, New York, NY"
    },
    "contactNumber": "+1234567890",
    "symptoms": ["Chest pain", "Shortness of breath"],
    "callerName": "Jane Doe",
    "callerRelation": "Family"
  }'
```

### 2. Get All Emergencies:
```bash
curl http://localhost:5000/api/emergencies \
  -H "Authorization: Bearer PATIENT_TOKEN"
```

## 📊 Test Vitals Recording

### Record Vital Signs:
```bash
curl -X POST http://localhost:5000/api/vitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -d '{
    "patient": "PATIENT_USER_ID",
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heartRate": {
      "value": 75
    },
    "oxygenSaturation": {
      "value": 98
    },
    "temperature": {
      "value": 98.6,
      "unit": "F"
    },
    "painLevel": 0,
    "consciousness": "Alert",
    "location": "Home"
  }'
```

### Get Patient Vitals:
```bash
curl "http://localhost:5000/api/vitals/patient/PATIENT_USER_ID" \
  -H "Authorization: Bearer PATIENT_TOKEN"
```

## 🎉 You're All Set!

Your backend is now running with:
- ✅ Authentication working
- ✅ Hospital management
- ✅ Emergency system
- ✅ Vitals tracking
- ✅ Complete API access

## 📚 Next Steps

1. **Explore More APIs**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. **Test with Postman**: Import endpoints and test interactively
3. **Connect Frontend**: Point your React app to `http://localhost:5000`
4. **Add More Data**: Create ambulances, consultations, feedbacks

## 🔧 Troubleshooting

### MongoDB Connection Failed
- Check your internet connection
- Verify MongoDB Atlas credentials
- Ensure IP is whitelisted
- Check connection string format

### JWT Secret Error
- Ensure JWT_SECRET is set in .env
- Generate a new secret if needed

### Port Already in Use
- Change PORT in .env to another port (e.g., 5001)
- Or kill the process using port 5000

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

## 💡 Tips

1. Use Postman for easier API testing
2. Keep your MongoDB Atlas free tier active
3. Check logs in terminal for debugging
4. Use MongoDB Compass to view your database
5. Test with different user roles

## 🆘 Need Help?

- Check [README.md](./README.md) for detailed setup
- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for all endpoints
- Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture

---

**Happy Coding! 🚀**
