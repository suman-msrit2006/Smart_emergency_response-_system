# TrackER AI - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Hospital APIs](#hospital-apis)
3. [Ambulance APIs](#ambulance-apis)
4. [Emergency APIs](#emergency-apis)
5. [Vitals APIs](#vitals-apis)
6. [Consultation APIs](#consultation-apis)
7. [Feedback APIs](#feedback-apis)

---

## Authentication APIs

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890",
  "role": "Patient"
}
```

**Roles:** `Patient`, `Doctor`, `Ambulance Driver`, `Hospital Admin`

---

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

---

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

---

## Hospital APIs

### Create Hospital
```http
POST /api/hospitals
Authorization: Bearer <token>
Role: Hospital Admin
```

**Request Body:**
```json
{
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
  "phone": "+1234567890",
  "email": "info@cityhospital.com",
  "emergencyContact": "+1234567899",
  "specialties": ["Cardiology", "Emergency", "Orthopedics"],
  "facilities": {
    "emergencyRoom": true,
    "icu": true,
    "operationTheater": true,
    "ambulanceService": true
  },
  "capacity": {
    "totalBeds": 200,
    "availableBeds": 150,
    "icuBeds": 20,
    "emergencyBeds": 30
  },
  "accreditation": "JCI Accredited",
  "website": "https://cityhospital.com"
}
```

---

### Get All Hospitals
```http
GET /api/hospitals?page=1&limit=10&status=Active&city=New York&specialty=Cardiology
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `status` (string) - Filter by status: Active, Inactive, Under Maintenance
- `city` (string) - Filter by city
- `specialty` (string) - Filter by specialty
- `sortBy` (string) - Sort field (default: createdAt)
- `order` (string) - Sort order: asc, desc (default: desc)

---

### Get Hospital by ID
```http
GET /api/hospitals/:id
```

---

### Update Hospital
```http
PATCH /api/hospitals/:id
Authorization: Bearer <token>
Role: Hospital Admin
```

---

### Delete Hospital
```http
DELETE /api/hospitals/:id
Authorization: Bearer <token>
Role: Hospital Admin
```

---

### Update Hospital Capacity
```http
PATCH /api/hospitals/:id/capacity
Authorization: Bearer <token>
Role: Hospital Admin
```

**Request Body:**
```json
{
  "availableBeds": 140,
  "icuBeds": 18,
  "emergencyBeds": 25
}
```

---

### Get Nearby Hospitals
```http
GET /api/hospitals/nearby?longitude=-73.935242&latitude=40.730610&maxDistance=10000
```

**Query Parameters:**
- `longitude` (number, required)
- `latitude` (number, required)
- `maxDistance` (number) - Max distance in meters (default: 10000)

---

### Get Hospitals by Specialty
```http
GET /api/hospitals/specialty/:specialty
```

---

## Ambulance APIs

### Create Ambulance
```http
POST /api/ambulances
Authorization: Bearer <token>
Role: Hospital Admin
```

**Request Body:**
```json
{
  "vehicleNumber": "AMB001",
  "type": "Advanced Life Support",
  "hospital": "hospital_id_here",
  "driver": "driver_user_id_here",
  "paramedics": ["paramedic_user_id_1", "paramedic_user_id_2"],
  "equipment": {
    "defibrillator": true,
    "oxygenSupply": true,
    "ventilator": true,
    "stretcher": true,
    "firstAidKit": true,
    "spinalBoard": true
  },
  "capacity": 2,
  "licensePlate": "ABC123",
  "model": "Mercedes Sprinter",
  "year": 2023,
  "fuelLevel": 100
}
```

**Types:** `Basic Life Support`, `Advanced Life Support`, `Air Ambulance`, `Patient Transport`

---

### Get All Ambulances
```http
GET /api/ambulances?page=1&limit=10&status=Available&hospital=hospital_id&type=Advanced Life Support
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`, `limit`, `sortBy`, `order` (pagination)
- `status` - Available, En Route, On Scene, Transporting, At Hospital, Out of Service
- `hospital` - Filter by hospital ID
- `type` - Filter by ambulance type

---

### Get Ambulance by ID
```http
GET /api/ambulances/:id
Authorization: Bearer <token>
```

---

### Update Ambulance
```http
PATCH /api/ambulances/:id
Authorization: Bearer <token>
Role: Hospital Admin, Ambulance Driver
```

---

### Delete Ambulance
```http
DELETE /api/ambulances/:id
Authorization: Bearer <token>
Role: Hospital Admin
```

---

### Update Ambulance Location
```http
PATCH /api/ambulances/:id/location
Authorization: Bearer <token>
Role: Ambulance Driver
```

**Request Body:**
```json
{
  "coordinates": [-73.935242, 40.730610]
}
```

---

### Update Ambulance Status
```http
PATCH /api/ambulances/:id/status
Authorization: Bearer <token>
Role: Ambulance Driver, Hospital Admin
```

**Request Body:**
```json
{
  "status": "En Route"
}
```

---

### Update Fuel Level
```http
PATCH /api/ambulances/:id/fuel
Authorization: Bearer <token>
Role: Ambulance Driver
```

**Request Body:**
```json
{
  "fuelLevel": 75
}
```

---

### Get Available Ambulances
```http
GET /api/ambulances/available?longitude=-73.935242&latitude=40.730610&maxDistance=20000
```

---

## Emergency APIs

### Create Emergency
```http
POST /api/emergencies
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patient": "patient_user_id",
  "type": "Cardiac Arrest",
  "severity": "Critical",
  "description": "Patient experiencing severe chest pain and difficulty breathing",
  "location": {
    "coordinates": [-73.935242, 40.730610],
    "address": "123 Main St, New York, NY"
  },
  "contactNumber": "+1234567890",
  "vitals": {
    "bloodPressure": "180/110",
    "heartRate": 120,
    "oxygenLevel": 88,
    "temperature": 99.5
  },
  "symptoms": ["Chest pain", "Shortness of breath", "Sweating"],
  "allergies": ["Penicillin"],
  "currentMedications": ["Aspirin", "Lisinopril"],
  "medicalHistory": "Previous heart attack in 2020",
  "callerName": "Jane Doe",
  "callerRelation": "Family"
}
```

**Types:** `Cardiac Arrest`, `Accident`, `Stroke`, `Respiratory Distress`, `Trauma`, `Burn`, `Poisoning`, `Allergic Reaction`, `Seizure`, `Other`

**Severity:** `Critical`, `High`, `Medium`, `Low`

---

### Get All Emergencies
```http
GET /api/emergencies?page=1&limit=10&status=Pending&severity=Critical&patient=patient_id
Authorization: Bearer <token>
```

---

### Get Emergency by ID
```http
GET /api/emergencies/:id
Authorization: Bearer <token>
```

---

### Update Emergency
```http
PATCH /api/emergencies/:id
Authorization: Bearer <token>
Role: Hospital Admin, Ambulance Driver, Doctor
```

---

### Update Emergency Status
```http
PATCH /api/emergencies/:id/status
Authorization: Bearer <token>
Role: Hospital Admin, Ambulance Driver
```

**Request Body:**
```json
{
  "status": "Ambulance Dispatched"
}
```

**Statuses:** `Pending`, `Ambulance Dispatched`, `Ambulance En Route`, `Ambulance On Scene`, `Transporting`, `Arrived at Hospital`, `Completed`, `Cancelled`

---

### Assign Ambulance to Emergency
```http
PATCH /api/emergencies/:id/assign-ambulance
Authorization: Bearer <token>
Role: Hospital Admin
```

**Request Body:**
```json
{
  "ambulanceId": "ambulance_id_here",
  "estimatedArrival": "2024-01-01T12:30:00Z"
}
```

---

### Assign Hospital to Emergency
```http
PATCH /api/emergencies/:id/assign-hospital
Authorization: Bearer <token>
Role: Hospital Admin, Ambulance Driver
```

**Request Body:**
```json
{
  "hospitalId": "hospital_id_here"
}
```

---

### Get Nearby Emergencies
```http
GET /api/emergencies/nearby?longitude=-73.935242&latitude=40.730610&maxDistance=50000
Authorization: Bearer <token>
```

---

### Get Patient Emergencies
```http
GET /api/emergencies/patient/:patientId
Authorization: Bearer <token>
```

---

### Cancel Emergency
```http
DELETE /api/emergencies/:id
Authorization: Bearer <token>
```

---

## Vitals APIs

### Record Vital Signs
```http
POST /api/vitals
Authorization: Bearer <token>
Role: Doctor, Ambulance Driver, Hospital Admin
```

**Request Body:**
```json
{
  "patient": "patient_id",
  "emergency": "emergency_id",
  "consultation": "consultation_id",
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
  "respiratoryRate": {
    "value": 16
  },
  "bloodGlucose": {
    "value": 95
  },
  "weight": {
    "value": 150,
    "unit": "lbs"
  },
  "height": {
    "value": 68,
    "unit": "inches"
  },
  "painLevel": 3,
  "consciousness": "Alert",
  "notes": "Patient stable, responding well to treatment",
  "location": "Emergency Room",
  "recordedAt": "2024-01-01T12:00:00Z"
}
```

---

### Get All Vitals
```http
GET /api/vitals?page=1&limit=10&patient=patient_id&status=Critical&location=Hospital
Authorization: Bearer <token>
```

---

### Get Vital by ID
```http
GET /api/vitals/:id
Authorization: Bearer <token>
```

---

### Update Vital
```http
PATCH /api/vitals/:id
Authorization: Bearer <token>
Role: Doctor, Ambulance Driver, Hospital Admin
```

---

### Delete Vital
```http
DELETE /api/vitals/:id
Authorization: Bearer <token>
Role: Doctor, Hospital Admin
```

---

### Get Patient Vitals
```http
GET /api/vitals/patient/:patientId?limit=10
Authorization: Bearer <token>
```

---

### Get Latest Vital for Patient
```http
GET /api/vitals/patient/:patientId/latest
Authorization: Bearer <token>
```

---

### Get Critical Vitals
```http
GET /api/vitals/critical
Authorization: Bearer <token>
Role: Doctor, Hospital Admin
```

---

### Get Vitals by Emergency
```http
GET /api/vitals/emergency/:emergencyId
Authorization: Bearer <token>
```

---

### Get Vitals by Consultation
```http
GET /api/vitals/consultation/:consultationId
Authorization: Bearer <token>
```

---

## Consultation APIs

### Create Consultation
```http
POST /api/consultations
Authorization: Bearer <token>
Role: Doctor, Hospital Admin
```

**Request Body:**
```json
{
  "patient": "patient_id",
  "doctor": "doctor_id",
  "hospital": "hospital_id",
  "emergency": "emergency_id",
  "type": "Emergency",
  "scheduledAt": "2024-01-01T10:00:00Z",
  "chiefComplaint": "Patient complaining of severe abdominal pain",
  "symptoms": [
    {
      "name": "Abdominal pain",
      "severity": "Severe",
      "duration": "2 hours"
    },
    {
      "name": "Nausea",
      "severity": "Moderate",
      "duration": "1 hour"
    }
  ]
}
```

**Types:** `Emergency`, `Scheduled`, `Walk-in`, `Follow-up`, `Telemedicine`

---

### Get All Consultations
```http
GET /api/consultations?page=1&limit=10&patient=patient_id&doctor=doctor_id&status=In Progress
Authorization: Bearer <token>
```

---

### Get Consultation by ID
```http
GET /api/consultations/:id
Authorization: Bearer <token>
```

---

### Update Consultation
```http
PATCH /api/consultations/:id
Authorization: Bearer <token>
Role: Doctor
```

**Request Body:**
```json
{
  "status": "In Progress",
  "diagnosis": {
    "primary": "Acute Appendicitis",
    "secondary": ["Peritonitis"],
    "icdCode": "K35.8"
  },
  "examination": {
    "generalAppearance": "Patient appears in distress",
    "cardiovascular": "Normal heart sounds",
    "respiratory": "Clear breath sounds bilaterally",
    "gastrointestinal": "Tender abdomen, positive McBurney's point"
  },
  "treatmentPlan": "Emergency appendectomy recommended",
  "followUpRequired": true,
  "followUpDate": "2024-01-15T10:00:00Z",
  "admissionRequired": true,
  "billingAmount": 5000
}
```

---

### Start Consultation
```http
PATCH /api/consultations/:id/start
Authorization: Bearer <token>
Role: Doctor
```

---

### Complete Consultation
```http
PATCH /api/consultations/:id/complete
Authorization: Bearer <token>
Role: Doctor
```

---

### Add Prescription
```http
POST /api/consultations/:id/prescriptions
Authorization: Bearer <token>
Role: Doctor
```

**Request Body:**
```json
{
  "medication": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "Three times daily",
  "duration": "7 days",
  "instructions": "Take with food",
  "refills": 0
}
```

---

### Add Lab Test
```http
POST /api/consultations/:id/lab-tests
Authorization: Bearer <token>
Role: Doctor
```

**Request Body:**
```json
{
  "testName": "Complete Blood Count"
}
```

---

### Update Lab Test
```http
PATCH /api/consultations/:id/lab-tests/:labTestId
Authorization: Bearer <token>
Role: Doctor, Hospital Admin
```

**Request Body:**
```json
{
  "status": "Completed",
  "results": "WBC: 12,000, RBC: 4.5M, Hemoglobin: 14g/dL",
  "completedAt": "2024-01-01T15:00:00Z"
}
```

---

### Get Patient Consultations
```http
GET /api/consultations/patient/:patientId
Authorization: Bearer <token>
```

---

### Get Doctor Consultations
```http
GET /api/consultations/doctor/:doctorId?date=2024-01-01
Authorization: Bearer <token>
```

---

## Feedback APIs

### Submit Feedback
```http
POST /api/feedbacks
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "Hospital",
  "relatedTo": {
    "hospital": "hospital_id"
  },
  "rating": 5,
  "title": "Excellent Service",
  "comment": "The staff was very professional and caring. The facilities were clean and modern.",
  "categories": ["Service Quality", "Staff Behavior", "Cleanliness"],
  "isAnonymous": false
}
```

**Types:** `Hospital`, `Ambulance`, `Doctor`, `Consultation`, `Emergency`, `General`

---

### Get All Feedbacks
```http
GET /api/feedbacks?page=1&limit=10&type=Hospital&rating=5&hospital=hospital_id
```

---

### Get Feedback by ID
```http
GET /api/feedbacks/:id
```

---

### Update Feedback (Admin Response)
```http
PATCH /api/feedbacks/:id
Authorization: Bearer <token>
Role: Hospital Admin
```

**Request Body:**
```json
{
  "status": "Reviewed",
  "adminResponse": {
    "response": "Thank you for your feedback. We're glad you had a positive experience."
  }
}
```

---

### Delete Feedback
```http
DELETE /api/feedbacks/:id
Authorization: Bearer <token>
```

---

### Vote on Feedback
```http
POST /api/feedbacks/:id/vote
```

**Request Body:**
```json
{
  "vote": "helpful"
}
```

**Vote Options:** `helpful`, `notHelpful`

---

### Get Hospital Feedbacks
```http
GET /api/feedbacks/hospital/:hospitalId
```

---

### Get Doctor Feedbacks
```http
GET /api/feedbacks/doctor/:doctorId
```

---

### Get My Feedbacks
```http
GET /api/feedbacks/my-feedbacks
Authorization: Bearer <token>
```

---

## Error Responses

All error responses follow this format:

```json
{
  "status": "fail",
  "message": "Error message here"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Pagination Response Format

All paginated responses follow this format:

```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

---

## Notes

1. All timestamps should be in ISO 8601 format
2. Coordinates format: [longitude, latitude]
3. All protected routes require valid JWT token
4. Role-based access control is enforced on specific endpoints
5. Rate limiting: 100 requests per 15 minutes (general), 5 requests per 15 minutes (auth)
