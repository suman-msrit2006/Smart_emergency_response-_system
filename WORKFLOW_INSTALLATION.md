# Workflow Integration - Installation Instructions

## Required Dependencies

Run the following command in the `client` directory to install required packages:

```bash
cd client
npm install leaflet react-leaflet chart.js react-chartjs-2
```

## Dependencies Added:
- **leaflet** (^1.9.4): Map library for ambulance and hospital tracking
- **react-leaflet** (^4.2.1): React components for Leaflet
- **chart.js** (^4.4.1): Charting library for vitals graphs
- **react-chartjs-2** (^5.2.0): React wrapper for Chart.js

## After Installation:

```bash
npm run dev
```

The application should start successfully with all workflow pages functional.

## Workflow Navigation:

1. Home → `/`
2. Emergency/Ambulance Tracking → `/emergency`
3. Hospital Selection → `/hospital`
4. IoT Vitals Monitoring → `/vitals`
5. Doctor Consultation → `/doctor`
6. Patient Handover & Discharge → `/discharge`
7. Patient Feedback → `/feedback`

## Features Implemented:

✅ Global state management via WorkflowContext
✅ Live ambulance tracking with Leaflet maps
✅ Hospital selection with map integration
✅ Real-time IoT vital monitoring with Chart.js
✅ Doctor consultation portal
✅ Patient handover and discharge summary
✅ Patient feedback with star rating
✅ Complete end-to-end workflow
✅ Data persistence across pages
✅ Responsive design with Tailwind CSS

## Notes:

- All existing functionality preserved
- Backend APIs reused where available
- State flows seamlessly between pages
- Maps require internet connection for tiles
