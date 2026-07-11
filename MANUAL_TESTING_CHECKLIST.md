# Manual Testing Checklist - TrackER AI

Use this checklist before deploying to production or showcasing to clients.

---

## 1. Authentication Flow

### Register
- [ ] Navigate to `/register`
- [ ] Try submitting with empty fields → Should show validation errors
- [ ] Try invalid email format → Should show error
- [ ] Try weak password (< 8 chars) → Should show error
- [ ] Enter valid data:
  - Name: John Doe
  - Email: john.doe@example.com
  - Phone: +1-555-123-4567
  - Password: Test@1234
  - Role: Emergency Medical Technician
- [ ] Check "I agree to terms" checkbox
- [ ] Click Register → Should redirect to home
- [ ] Verify user is logged in (check Navbar dropdown)

### Login
- [ ] Logout (if logged in)
- [ ] Navigate to `/login`
- [ ] Try invalid credentials → Should show error
- [ ] Enter correct credentials
- [ ] Click Login → Should redirect to home
- [ ] Verify user is logged in

### Logout
- [ ] Click user dropdown in Navbar
- [ ] Click Logout
- [ ] Verify redirect to `/login`
- [ ] Try accessing `/profile` → Should redirect to `/login`

---

## 2. Emergency Workflow

### Search Location
- [ ] Navigate to `/emergency`
- [ ] Enter location: "Connaught Place Delhi"
- [ ] Click Search
- [ ] Verify map centers on location
- [ ] Verify ambulances appear on map
- [ ] Verify stats panel shows:
  - Total nearby ambulances
  - Available ambulances count
  - En route ambulances count
  - Fastest ambulance ID

### Dispatch Ambulance
- [ ] Verify ambulance list shows sorted by distance
- [ ] Verify fastest ambulance highlighted
- [ ] Click "ACCEPT & DISPATCH" button
- [ ] Verify success message
- [ ] Verify redirect to `/hospital`

---

## 3. Hospital Selection

### Direct Selection
- [ ] Select a hospital from dropdown
- [ ] Click "SELECT CHOSEN HOSPITAL"
- [ ] Verify hospital appears selected on map (yellow star icon)
- [ ] Verify stats panel updates

### Location-Based Search
- [ ] Enter patient location: "Koramangala"
- [ ] Click "FIND NEARBY HOSPITALS"
- [ ] Verify map centers on location
- [ ] Verify patient marker appears
- [ ] Verify nearby hospitals calculated with distances
- [ ] Click on a hospital in the list
- [ ] Verify selection updates

### Accept Hospital
- [ ] Ensure a hospital is selected
- [ ] Click "ACCEPT SELECTED HOSPITAL & DISPATCH"
- [ ] Verify success message
- [ ] Verify redirect to `/vitals`

---

## 4. Vitals Monitoring

### Start Monitoring
- [ ] Enter patient name: "Ravi Kumar"
- [ ] Click "Start Monitoring"
- [ ] Verify vitals update every second:
  - Heart Rate
  - SpO₂
  - Temperature
  - Blood Pressure
- [ ] Verify status badge updates (Stable/Warning/Critical)
- [ ] Verify chart updates in real-time
- [ ] Verify records table populates with timestamp

### Stop Monitoring
- [ ] Let monitoring run for 10-15 seconds
- [ ] Click "Stop Monitoring"
- [ ] Verify vitals stop updating
- [ ] Verify records remain in table

### Navigate to Doctor
- [ ] Click "Doctor Consultation Portal" button
- [ ] Verify redirect to `/doctor`

---

## 5. Doctor Consultation

### Load Patient Data
- [ ] Enter patient name: "Ravi Kumar"
- [ ] Click "Load Patient Data"
- [ ] Verify latest vitals display
- [ ] Verify vitals trend chart displays
- [ ] Verify recent vitals history table shows data
- [ ] Verify status badge (Stable/Warning/Critical)

### Save Assessment
- [ ] Enter doctor's analysis in textarea:
  ```
  Patient showing stable vitals. HR trending downward to normal range.
  SpO₂ maintaining above 95%. Temperature stable at 37.2°C.
  Recommend continued monitoring and IV fluids.
  Alert hospital emergency team for immediate admission.
  ```
- [ ] Click "Save Assessment & Notify Teams"
- [ ] Verify success message
- [ ] Verify redirect to `/discharge`

### Print Records
- [ ] Click "Print" button
- [ ] Verify print preview opens with vitals table
- [ ] Close print preview

---

## 6. Discharge & Handover

### Generate Summary
- [ ] Enter patient name (or verify it's auto-filled)
- [ ] Click "Generate Doctor Summary"
- [ ] Verify summary displays:
  - Patient condition
  - Vitals trend
  - Treatments administered
  - Discharge instructions
  - Special notes
- [ ] Verify vitals grid shows all 4 vitals
- [ ] Verify status badge displays

### Approve Handover
- [ ] Click "Approve & Complete Handover"
- [ ] Verify success message
- [ ] Verify redirect to `/feedback`

---

## 7. Feedback Submission

### Rate Experience
- [ ] Verify patient name displays
- [ ] Click on 5 stars to rate
- [ ] Verify stars turn yellow
- [ ] Verify "You rated: 5 stars" message

### Submit Feedback
- [ ] Enter comment: "Excellent service! Fast response and professional care."
- [ ] Click "Submit Feedback"
- [ ] Verify "Thank You!" message appears
- [ ] Verify reference number displays
- [ ] Wait and verify animations appear in sequence:
  1. Hospital Acceptance Confirmed (with bounce animation)
  2. Doctor's Message (fade in)
  3. Get Well Soon (scale in)

### Return Home
- [ ] Click "Return to Home" button
- [ ] Verify redirect to `/`
- [ ] Verify workflow is reset (can start new emergency)

---

## 8. Profile Management

### View Profile
- [ ] Click user dropdown → Profile
- [ ] Verify profile data loads
- [ ] Verify avatar initial displays

### Update Profile
- [ ] Change first name to "Jane"
- [ ] Change last name to "Smith"
- [ ] Update email to "jane.smith@example.com"
- [ ] Update phone to "+1-555-987-6543"
- [ ] Click "Save Changes"
- [ ] Verify success message
- [ ] Verify avatar initial updates to "J"
- [ ] Refresh page
- [ ] Verify changes persisted

### Cancel Changes
- [ ] Make changes to form
- [ ] Click "Cancel"
- [ ] Verify form resets to saved data
- [ ] Verify redirect to home

---

## 9. Settings Management

### Update Settings
- [ ] Navigate to `/settings`
- [ ] Toggle "Email Notifications" on
- [ ] Toggle "SMS Notifications" off
- [ ] Update emergency contact email
- [ ] Update emergency contact phone
- [ ] Click "Save Settings"
- [ ] Verify success message
- [ ] Refresh page
- [ ] Verify settings persisted

---

## 10. Help Page

### View Help
- [ ] Navigate to `/help`
- [ ] Verify quick links display
- [ ] Click on FAQ items to expand
- [ ] Verify FAQ content displays
- [ ] Verify contact support info displays

---

## 11. API Integration Tests

### With Backend Running
- [ ] Ensure backend server is running on http://localhost:5000
- [ ] Complete emergency workflow
- [ ] Open browser DevTools → Network tab
- [ ] Verify all API calls return 200/201 status
- [ ] Check MongoDB to verify data saved:
  - Emergency record
  - Vitals records
  - Consultation record
  - Feedback record

### Without Backend (Fallback)
- [ ] Stop backend server
- [ ] Start new emergency workflow
- [ ] Search for location
- [ ] Verify fallback message: "Using demo ambulance data"
- [ ] Verify demo ambulances display
- [ ] Continue workflow
- [ ] Verify all pages work with demo data

---

## 12. Cross-Browser Testing

- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Verify all functionality works consistently

---

## 13. Responsive Design Testing

### Mobile (375px)
- [ ] Open DevTools → Responsive mode → iPhone SE (375px)
- [ ] Verify Navbar collapses to hamburger menu
- [ ] Verify all forms are usable
- [ ] Verify maps display correctly
- [ ] Verify charts display correctly
- [ ] Test emergency workflow end-to-end

### Tablet (768px)
- [ ] Open DevTools → Responsive mode → iPad (768px)
- [ ] Verify layout adjusts correctly
- [ ] Test navigation
- [ ] Test forms

### Desktop (1920px)
- [ ] Open DevTools → Responsive mode → 1920px
- [ ] Verify layout uses full width appropriately
- [ ] Verify no horizontal scroll

---

## 14. Performance Testing

### Page Load
- [ ] Open DevTools → Network tab
- [ ] Hard refresh home page (Ctrl+Shift+R)
- [ ] Verify page loads in < 3 seconds
- [ ] Check bundle sizes in Network tab

### Memory Leaks
- [ ] Open DevTools → Performance → Memory
- [ ] Record memory profile
- [ ] Navigate through all pages
- [ ] Complete full workflow
- [ ] Stop recording
- [ ] Verify no memory leaks (memory returns to baseline)

### React Re-renders
- [ ] Install React DevTools extension
- [ ] Enable "Highlight updates"
- [ ] Navigate through pages
- [ ] Verify no excessive re-rendering

---

## 15. Error Handling

### Invalid Form Data
- [ ] Try submitting empty forms → Verify validation errors
- [ ] Try invalid email formats → Verify error messages
- [ ] Try weak passwords → Verify error messages

### Network Errors
- [ ] Disconnect from internet (or use DevTools → Network → Offline)
- [ ] Try loading Emergency page
- [ ] Verify error handling with fallback data
- [ ] Try submitting forms
- [ ] Verify error messages display

### Invalid Routes
- [ ] Navigate to `/invalid-route`
- [ ] Verify 404 page displays
- [ ] Verify navigation back to home works

---

## 16. Security Testing

### Authentication
- [ ] Logout
- [ ] Try accessing `/profile` directly → Should redirect to `/login`
- [ ] Try accessing `/vitals` directly → Should redirect to `/login`
- [ ] Login
- [ ] Verify JWT token in localStorage
- [ ] Logout
- [ ] Verify token removed from localStorage

### Input Sanitization
- [ ] Try entering `<script>alert('XSS')</script>` in forms
- [ ] Verify input is escaped (no script execution)

---

## Checklist Completion

- **Total Checks:** 150+
- **Completed:** ___/150+
- **Pass Rate:** ___%

---

## Sign-Off

- [ ] All critical functionality tested ✅
- [ ] All bugs fixed ✅
- [ ] Performance acceptable ✅
- [ ] Security verified ✅
- [ ] Ready for deployment ✅

**Tested By:** _________________  
**Date:** _________________  
**Signature:** _________________

---

## Notes

_Add any observations, issues, or recommendations here:_

---

**Status:** READY FOR DEPLOYMENT 🚀
