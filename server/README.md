# TrackER AI - Backend API

AI-Powered Smart Emergency Response & Healthcare Coordination Platform - Backend API

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod
- **Security:** Helmet, CORS, express-rate-limit, express-mongo-sanitize
- **Password Hashing:** bcryptjs
- **Logging:** Morgan
- **Environment Management:** dotenv

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection configuration
│   │   └── env.js            # Environment variables management
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication & authorization
│   │   ├── errorHandler.js   # Global error handling
│   │   ├── notFound.js       # 404 handler
│   │   └── security.js       # Security middleware (helmet, cors, rate limiting)
│   ├── models/
│   │   └── User.js           # User model schema
│   ├── routes/
│   │   ├── index.js          # Main route aggregator
│   │   └── authRoutes.js     # Authentication routes
│   ├── validations/
│   │   └── authValidation.js # Request validation schemas
│   ├── utils/
│   │   ├── AppError.js       # Custom error class
│   │   ├── catchAsync.js     # Async error wrapper
│   │   ├── jwt.js            # JWT utilities
│   │   └── logger.js         # Logging utilities
│   ├── app.js                # Express app configuration
│   └── server.js             # Server entry point
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn package manager

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the `server/` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tracker-ai?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** 
- Replace `username`, `password`, and `cluster` with your MongoDB Atlas credentials
- Generate a strong JWT secret (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Step 3: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with username and password
4. Whitelist your IP address (or allow access from anywhere for development: 0.0.0.0/0)
5. Get your connection string and update `MONGODB_URI` in `.env`

## 🚀 Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints Overview

### Base URL
```
http://localhost:5000/api
```

### Complete API Modules

#### 1. Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)

#### 2. Hospitals (`/api/hospitals`)
- `GET /` - Get all hospitals (with pagination, filters)
- `POST /` - Create hospital (Hospital Admin)
- `GET /:id` - Get hospital details
- `PATCH /:id` - Update hospital (Hospital Admin)
- `DELETE /:id` - Delete hospital (Hospital Admin)
- `PATCH /:id/capacity` - Update bed capacity
- `GET /nearby` - Find nearby hospitals (geospatial)
- `GET /specialty/:specialty` - Filter by specialty

#### 3. Ambulances (`/api/ambulances`)
- `GET /` - Get all ambulances (with filters)
- `POST /` - Create ambulance (Hospital Admin)
- `GET /:id` - Get ambulance details
- `PATCH /:id` - Update ambulance
- `DELETE /:id` - Deactivate ambulance
- `PATCH /:id/location` - Update GPS location
- `PATCH /:id/status` - Update status
- `PATCH /:id/fuel` - Update fuel level
- `GET /available` - Get available ambulances nearby

#### 4. Emergencies (`/api/emergencies`)
- `GET /` - Get all emergencies (with filters)
- `POST /` - Create emergency request
- `GET /:id` - Get emergency details
- `PATCH /:id` - Update emergency
- `DELETE /:id` - Cancel emergency
- `PATCH /:id/status` - Update status
- `PATCH /:id/assign-ambulance` - Assign ambulance
- `PATCH /:id/assign-hospital` - Assign hospital
- `GET /nearby` - Get nearby emergencies
- `GET /patient/:patientId` - Get patient's emergencies

#### 5. Vitals (`/api/vitals`)
- `GET /` - Get all vital records (with filters)
- `POST /` - Record vital signs
- `GET /:id` - Get vital record
- `PATCH /:id` - Update vital record
- `DELETE /:id` - Delete vital record
- `GET /patient/:patientId` - Get patient vitals
- `GET /patient/:patientId/latest` - Get latest vitals
- `GET /critical` - Get critical vital signs
- `GET /emergency/:emergencyId` - Vitals by emergency
- `GET /consultation/:consultationId` - Vitals by consultation

#### 6. Consultations (`/api/consultations`)
- `GET /` - Get all consultations (with filters)
- `POST /` - Create consultation
- `GET /:id` - Get consultation details
- `PATCH /:id` - Update consultation
- `DELETE /:id` - Delete consultation
- `PATCH /:id/start` - Start consultation
- `PATCH /:id/complete` - Complete consultation
- `POST /:id/prescriptions` - Add prescription
- `POST /:id/lab-tests` - Order lab test
- `PATCH /:id/lab-tests/:labTestId` - Update lab test
- `GET /patient/:patientId` - Patient consultations
- `GET /doctor/:doctorId` - Doctor consultations

#### 7. Feedbacks (`/api/feedbacks`)
- `GET /` - Get all feedbacks (with filters)
- `POST /` - Submit feedback
- `GET /:id` - Get feedback details
- `PATCH /:id` - Update/respond to feedback (Admin)
- `DELETE /:id` - Delete feedback
- `POST /:id/vote` - Vote helpful/not helpful
- `GET /hospital/:hospitalId` - Hospital feedbacks
- `GET /doctor/:doctorId` - Doctor feedbacks
- `GET /my-feedbacks` - User's feedbacks

### 📚 Complete API Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation with request/response examples.

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Security Middleware
- **Helmet:** Sets secure HTTP headers
- **CORS:** Configured for allowed origins
- **Rate Limiting:** 
  - General API: 100 requests per 15 minutes
  - Auth endpoints: 5 requests per 15 minutes
- **MongoDB Sanitization:** Prevents NoSQL injection attacks
- **Password Hashing:** bcrypt with salt rounds of 12

### Authentication
- JWT token-based authentication
- Token expiration (default: 7 days)
- Password change detection
- Account deactivation support

## 🛡️ Error Handling

All errors follow a consistent format:

**Development Mode:**
```json
{
  "status": "fail",
  "error": { /* full error object */ },
  "message": "Detailed error message",
  "stack": "Error stack trace"
}
```

**Production Mode:**
```json
{
  "status": "fail",
  "message": "User-friendly error message"
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 📝 Data Models

### User Model
- `name`, `email`, `password`, `phone`, `role`
- Roles: Patient, Doctor, Ambulance Driver, Hospital Admin
- Password hashing with bcrypt
- JWT authentication support

### Hospital Model
- Complete hospital information with address and location
- Facilities and specialties tracking
- Bed capacity management (total, available, ICU, emergency)
- Geospatial queries support
- Rating and accreditation

### Ambulance Model
- Vehicle details and equipment tracking
- Real-time location tracking (GeoJSON Point)
- Status management (Available, En Route, On Scene, etc.)
- Driver and paramedics assignment
- Fuel level and maintenance tracking

### Emergency Model
- Emergency type and severity classification
- Patient information and location
- Ambulance and hospital assignment
- Response time tracking
- Status workflow management
- Vital signs and medical history

### Vital Model
- Comprehensive vital signs tracking
- Blood pressure, heart rate, oxygen saturation
- Temperature, respiratory rate, blood glucose
- Weight, height, BMI calculation
- Pain level and consciousness assessment
- Automatic status assessment (Normal, Abnormal, Critical)

### Consultation Model
- Doctor-patient consultation records
- Chief complaint and symptoms
- Diagnosis with ICD codes
- Physical examination notes
- Prescriptions and lab tests
- Treatment plan and follow-up
- Billing and payment tracking

### Feedback Model
- Multi-type feedback system
- Rating and categories
- Admin response capability
- Helpful voting system
- Anonymous feedback support

## 🧪 Testing the API

### Quick Test Commands

**1. Register a Patient:**
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

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**3. Create Emergency (save token first):**
```bash
curl -X POST http://localhost:5000/api/emergencies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patient": "patient_id",
    "type": "Cardiac Arrest",
    "severity": "Critical",
    "description": "Patient experiencing chest pain",
    "location": {
      "coordinates": [-73.935242, 40.730610],
      "address": "123 Main St, NY"
    },
    "contactNumber": "+1234567890"
  }'
```

**4. Get Nearby Hospitals:**
```bash
curl -X GET "http://localhost:5000/api/hospitals/nearby?longitude=-73.935242&latitude=40.730610"
```

**5. Record Vital Signs:**
```bash
curl -X POST http://localhost:5000/api/vitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patient": "patient_id",
    "bloodPressure": {"systolic": 120, "diastolic": 80},
    "heartRate": {"value": 75},
    "oxygenSaturation": {"value": 98},
    "temperature": {"value": 98.6, "unit": "F"}
  }'
```

### Using Postman

1. Import the endpoints from API_DOCUMENTATION.md
2. Set environment variable: `baseUrl` = `http://localhost:5000`
3. Create environment variable: `token` (auto-populated after login)
4. Use `{{baseUrl}}` and `Bearer {{token}}` in requests

## 🔧 Development

### Adding New Routes

1. Create controller in `src/controllers/`
2. Create route file in `src/routes/`
3. Add validation schema in `src/validations/`
4. Import and use in `src/routes/index.js`

### Adding Protected Routes

```javascript
import { protect, restrictTo } from '../middleware/auth.js';

router.get('/admin-only', protect, restrictTo('Hospital Admin'), controller);
```

## 📊 Database Schema Validation

Mongoose schemas include built-in validation. Additional validation is handled by Zod schemas in the validation layer.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MONGODB_URI is correct
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your IP

### JWT Errors
- Verify JWT_SECRET is set in .env
- Check token format: `Bearer <token>`
- Ensure token hasn't expired

### Rate Limiting
- Wait 15 minutes if you hit the limit
- Adjust limits in `src/middleware/security.js` for development

## 📦 NPM Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-secret-key>
JWT_EXPIRES_IN=7d
CLIENT_URL=<your-frontend-url>
```

### Recommended Hosting
- **Backend:** Railway, Render, Heroku, AWS EC2
- **Database:** MongoDB Atlas

## 📄 License

ISC

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for TrackER AI Platform**
