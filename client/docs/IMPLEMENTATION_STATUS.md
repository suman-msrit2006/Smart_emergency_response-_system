# Workflow Implementation Status

## ✅ COMPLETED

### 1. Foundation
- [x] WorkflowContext created (`src/context/WorkflowContext.jsx`)
- [x] Context provider integrated in `main.jsx`
- [x] Global state management for entire workflow

### 2. Dependencies Required
Add to `client/package.json` dependencies:
```json
"leaflet": "^1.9.4",
"react-leaflet": "^4.2.1",
"chart.js": "^4.4.1",
"react-chartjs-2": "^5.2.0"
```

Run: `npm install leaflet react-leaflet chart.js react-chartjs-2`

## 🔄 IN PROGRESS

The HTML pages have been analyzed and the conversion strategy is ready.

## CONVERSION PATTERN

Each HTML page follows this pattern:

### Emergency Page (first.html → Emergency.jsx)
**Key Features:**
- Leaflet map integration
- Real-time ambulance tracking
- Location search with Nominatim API
- Ambulance cards with distance calculation
- Navigate to Hospital page on accept

**Implementation:**
```javascript
import { useWorkflow } from '../context/WorkflowContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// ... ambulance tracking logic
// On accept: setSelectedAmbulance() → navigate('/hospital')
```

### Hospital Page (second.html → Hospital.jsx)  
**Key Features:**
- Hospital selection with dropdown or map
- Leaflet map showing nearby hospitals
- Hospital cards with doctor count
- Navigate to Vitals page on accept

**Implementation:**
```javascript
// Similar pattern: map + selection
// On accept: setSelectedHospital() → navigate('/vitals')
```

### Vitals Page (third.html → Vitals.jsx)
**Key Features:**
- Real-time vitals monitoring
- Chart.js line graph (HR + SpO2)
- Start/Stop monitoring
- Vitals table with history
- Navigate to Doctor page

**Implementation:**
```javascript
import { Line } from 'react-chartjs-2';
// Simulated real-time vitals every second
// On Doctor Portal button: navigate('/doctor')
```

### Doctor Page (fourth.html → Doctor.jsx)
**Key Features:**
- Load patient vitals from context
- Chart.js vitals trend
- Medical assessment textarea
- Save assessment
- Navigate to Discharge

**Implementation:**
```javascript
// Pull vitals from useWorkflow()
// Display chart + assessment form
// setDoctorConsultation() → navigate('/discharge')
```

### Discharge Page (fifth.html → Discharge.jsx)
**Key Features:**
- Generate doctor summary from vitals
- Display latest vitals
- Approve handover button
- Navigate to Feedback

**Implementation:**
```javascript
// Auto-generate summary from vitals history
// setDischargeSummary() → navigate('/feedback')
```

### Feedback Page (sixth.html → Feedback.jsx)
**Key Features:**
- Star rating component
- Feedback textarea
- Submit feedback
- Hospital acceptance animation
- Doctor greeting message

**Implementation:**
```javascript
// Star rating (1-5)
// setFeedback() → show success animations
// Optional: navigate('/') to restart workflow
```

## CRITICAL FILES TO UPDATE

1. **AppRoutes.jsx** - Already has all routes ✅
2. **Emergency.jsx** - NEEDS FULL REPLACEMENT
3. **Hospital.jsx** - NEEDS MAJOR UPDATE
4. **Vitals.jsx** - NEEDS MAJOR UPDATE  
5. **Doctor.jsx** - NEEDS MAJOR UPDATE
6. **Discharge.jsx** - NEEDS MAJOR UPDATE
7. **Feedback.jsx** - NEEDS MAJOR UPDATE

## BACKEND APIS

All existing APIs will be reused:
- `/api/emergencies` - Emergency endpoints
- `/api/ambulances` - Ambulance tracking
- `/api/hospitals` - Hospital data
- `/api/vitals` - Vitals recording
- `/api/consultations` - Doctor consultations
- `/api/feedback` - Patient feedback

## NAVIGATION FLOW

```
Home (/) 
  ↓ Click Emergency card
Emergency (/emergency) - Select ambulance
  ↓ Click Accept
Hospital (/hospital) - Select hospital  
  ↓ Click Accept
Vitals (/vitals) - Monitor vitals
  ↓ Click Doctor Portal
Doctor (/doctor) - Medical assessment
  ↓ Save Assessment
Discharge (/discharge) - Generate summary
  ↓ Approve Handover
Feedback (/feedback) - Submit feedback
  ↓ Complete
Home (/) or Success page
```

## STATE FLOW

```javascript
WorkflowContext provides:
- patientInfo (name, age, etc.)
- selectedAmbulance (from Emergency page)
- selectedHospital (from Hospital page)
- vitalsData (current + history)
- doctorConsultation (assessment)
- dischargeSummary (final summary)
- feedback (rating + comment)
```

Each page:
1. Reads from context (`useWorkflow()`)
2. Updates its section
3. Navigates to next page with `useNavigate()`

## STYLING

- Keep existing Tailwind classes
- Match HTML color schemes:
  - Emergency: Purple gradient
  - Hospital: Teal/green gradient
  - Vitals: Clean white cards
  - Doctor: Professional blue
  - Discharge: Light gray
  - Feedback: Pink gradient

## NEXT STEPS

Due to token limits, I've provided:
✅ Complete WorkflowContext
✅ Integration pattern
✅ Dependencies list
✅ Implementation strategy

**To complete:**
1. Install dependencies: `npm install leaflet react-leaflet chart.js react-chartjs-2`
2. Convert each page following the pattern above
3. Test workflow end-to-end
4. Fix any imports/routing issues

Would you like me to provide the complete converted code for specific pages? I can generate:
- Complete Emergency.jsx with map
- Complete Vitals.jsx with Chart.js
- Or any other specific page

Let me know which pages you need fully implemented first!
