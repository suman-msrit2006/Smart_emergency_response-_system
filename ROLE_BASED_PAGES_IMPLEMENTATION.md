# Role-Based Page Access Implementation

## Overview
Implemented role-based rendering for shared pages between Patient and Ambulance Personnel to ensure each user role only sees features relevant to them.

## Date
July 15, 2026

---

## Changes Summary

### Files Modified
1. ✅ `client/src/pages/Hospital.jsx` - Added role-based views
2. ✅ `client/src/pages/Vitals.jsx` - Added role-based views

### What Changed
- Added `useAuth` hook import to access current user role
- Added role detection logic (`isAmbulancePersonnel`, `isPatient`)
- Split page rendering into two conditional views based on user role
- Maintained all existing functionality and UI design
- No changes to routes, authentication, backend APIs, or workflow

---

## Hospital Page (`/hospital`)

### Patient View (Read-Only)
**Features:**
- ✅ View assigned hospital details only
- ✅ Hospital name displayed prominently
- ✅ Status: "Assigned & Confirmed"
- ✅ View available doctors count
- ✅ View available beds count
- ✅ Read-only map (no scroll, no zoom, no drag)
- ✅ Single marker showing assigned hospital
- ✅ Information message about ambulance heading to hospital
- ✅ Navigation button to continue to Vitals page
- ❌ **NO** selection dropdown
- ❌ **NO** location search
- ❌ **NO** hospital selection functionality
- ❌ **NO** accept/dispatch buttons
- ❌ **NO** coordination features

### Ambulance Personnel View (Full Access)
**Features:**
- ✅ All existing functionality preserved
- ✅ Direct hospital selection via dropdown
- ✅ Location-based hospital search
- ✅ Interactive map with all hospitals
- ✅ Click to select hospital
- ✅ Accept and dispatch functionality
- ✅ Hospital coordination features
- ✅ Distance calculation
- ✅ Stats panel (nearby hospitals, doctors)
- ✅ Hospital list with details
- ✅ Call hospital functionality

---

## Vitals Page (`/vitals`)

### Patient View (Read-Only)
**Features:**
- ✅ View real-time vital signs only
- ✅ Header: "Your Vital Signs (Read Only)"
- ✅ "View Only Mode" badge displayed
- ✅ Display current vitals: Heart Rate, SpO₂, Temperature, Blood Pressure
- ✅ Visual status indicator (Stable/Warning/Critical)
- ✅ Real-time vitals graph (last 30 seconds)
- ✅ Information message about medical team monitoring
- ✅ Patient name from user context or "You"
- ❌ **NO** patient name input field
- ❌ **NO** Start/Stop monitoring buttons
- ❌ **NO** record editing capabilities
- ❌ **NO** saved records table
- ❌ **NO** clear table button
- ❌ **NO** Doctor consultation portal button

### Ambulance Personnel View (Full Access)
**Features:**
- ✅ All existing functionality preserved
- ✅ Patient name input field
- ✅ Start/Stop monitoring controls
- ✅ Real-time data recording (every second)
- ✅ Current vitals display with live updates
- ✅ Status monitoring (Stable/Warning/Critical)
- ✅ Real-time charts (Heart Rate, SpO₂)
- ✅ Saved records table with all vitals
- ✅ Clear table functionality
- ✅ Doctor Consultation Portal button
- ✅ Backend API integration for saving vitals
- ✅ Export/screenshot capabilities

---

## Technical Implementation

### Role Detection Logic
```javascript
// Import useAuth hook
import { useAuth } from '../context/AuthContext';

// Inside component
const { user } = useAuth();

// Check user role
const isAmbulancePersonnel = user?.role === 'Ambulance Personnel';
const isPatient = user?.role === 'Patient' || !isAmbulancePersonnel;
```

### Conditional Rendering Pattern
```javascript
// Patient view (read-only)
if (isPatient) {
  return (
    <div>
      {/* Read-only content for patients */}
    </div>
  );
}

// Ambulance personnel view (full access)
return (
  <div>
    {/* Full functionality for ambulance personnel */}
  </div>
);
```

---

## Shared Pages (Unchanged)

These pages remain accessible to both roles without restrictions:

1. ✅ **Profile** (`/profile`) - Personal profile management
2. ✅ **Settings** (`/settings`) - User settings
3. ✅ **Help** (`/help`) - Help and documentation

**Reasoning:** These are personal/utility pages that don't require role-based restrictions.

---

## Testing Checklist

### Hospital Page Testing

#### As Patient:
- [ ] Login as patient user
- [ ] Navigate to `/hospital`
- [ ] Verify only assigned hospital is shown
- [ ] Verify no selection dropdown visible
- [ ] Verify no location search visible
- [ ] Verify map is read-only (no interaction)
- [ ] Verify hospital details are displayed correctly
- [ ] Verify "Continue to Vitals" button works

#### As Ambulance Personnel:
- [ ] Login as ambulance personnel
- [ ] Navigate to `/hospital`
- [ ] Verify dropdown shows all hospitals
- [ ] Verify location search works
- [ ] Verify map is interactive
- [ ] Verify hospital selection works
- [ ] Verify accept/dispatch button works
- [ ] Verify stats panel displays correctly

### Vitals Page Testing

#### As Patient:
- [ ] Login as patient user
- [ ] Navigate to `/vitals`
- [ ] Verify "View Only Mode" badge is shown
- [ ] Verify no input controls visible
- [ ] Verify vitals are displayed (if monitoring active)
- [ ] Verify chart displays correctly
- [ ] Verify no editing capabilities

#### As Ambulance Personnel:
- [ ] Login as ambulance personnel
- [ ] Navigate to `/vitals`
- [ ] Verify patient name input field is visible
- [ ] Verify Start/Stop monitoring buttons work
- [ ] Verify monitoring generates live data
- [ ] Verify saved records table populates
- [ ] Verify clear table button works
- [ ] Verify Doctor Portal button navigates correctly
- [ ] Verify backend API saves vitals

---

## Security Considerations

### Frontend Protection
✅ Role-based UI rendering prevents patients from seeing ambulance features
✅ Conditional logic ensures proper feature access based on user role
✅ Read-only views disable interactive elements for patients

### Backend Protection Required
⚠️ **IMPORTANT:** Frontend role checks are for UX only. Backend APIs **MUST** enforce role-based permissions:

```javascript
// Example backend middleware (NOT implemented in this task)
if (req.user.role === 'Patient' && req.method !== 'GET') {
  return res.status(403).json({ error: 'Patients cannot modify records' });
}
```

**Backend security is outside the scope of this task** but should be implemented separately.

---

## User Experience Flow

### Patient Journey
1. Patient logs in → Patient Dashboard
2. Clicks "SOS Emergency" → Search ambulance
3. Request ambulance → Ambulance assigned
4. Navigate to "Assigned Hospital" → **View only** hospital details
5. Navigate to "Vitals" → **View only** their vitals being monitored
6. Provide feedback after service

### Ambulance Personnel Journey
1. Ambulance personnel logs in → Ambulance Dashboard
2. Accept emergency request from queue
3. Navigate to "Hospital Coordination" → **Select** and coordinate with hospital
4. Navigate to "IoT Vitals" → **Record and monitor** patient vitals
5. Navigate to "Doctor Portal" → Consult with specialists
6. Navigate to "Discharge" → Complete handover
7. View patient feedback

---

## Benefits

### For Patients
✅ Simplified, distraction-free interface
✅ Clear view of assigned hospital and vital signs
✅ No confusing ambulance-specific controls
✅ Peace of mind with "View Only" indicators
✅ Focus on their health status during emergency

### For Ambulance Personnel
✅ Full operational control preserved
✅ No workflow disruption
✅ All existing features remain functional
✅ Professional tools for emergency response
✅ Efficient hospital coordination and vitals monitoring

### For Development Team
✅ Clean, maintainable code structure
✅ Role-based logic clearly separated
✅ No breaking changes to existing functionality
✅ Easy to extend for future roles (e.g., Hospital Staff, Doctor)
✅ Follows React best practices with hooks and conditional rendering

---

## Future Enhancements

### Potential Improvements
1. **Doctor Role:** Add separate view for hospital doctors
2. **Hospital Staff Role:** Add view for hospital coordination staff
3. **Admin Role:** Add administrative dashboard for system management
4. **Granular Permissions:** Implement permission-based feature flags
5. **Audit Logging:** Track which role accessed which features
6. **Backend Enforcement:** Add middleware to enforce role-based API access

---

## Rollback Plan

If issues are discovered, rollback is simple:

```bash
# Revert Hospital.jsx
git checkout HEAD~1 client/src/pages/Hospital.jsx

# Revert Vitals.jsx
git checkout HEAD~1 client/src/pages/Vitals.jsx
```

All changes are non-breaking and isolated to these two files.

---

## Summary

✅ **Hospital Page:** Patients see read-only view, Ambulance personnel see full functionality
✅ **Vitals Page:** Patients see read-only vitals, Ambulance personnel can record/monitor
✅ **No Breaking Changes:** All existing functionality preserved
✅ **Clean Implementation:** Role-based conditional rendering using useAuth hook
✅ **Maintained Design:** No UI/UX changes, only feature visibility
✅ **Ready for Testing:** Clear test cases defined above

**Status:** ✅ **COMPLETE AND READY FOR TESTING**
