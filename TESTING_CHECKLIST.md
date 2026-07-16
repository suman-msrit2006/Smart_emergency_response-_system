# Role-Based Navigation Testing Checklist

## Pre-Test Setup
- [ ] Backend server running
- [ ] Frontend dev server running
- [ ] Database seeded with test data
- [ ] Browser DevTools Network tab open
- [ ] Two browser sessions ready (one for Patient, one for Ambulance Personnel)

## Test 1: Patient Login & Dashboard Access
### Steps:
1. [ ] Login as Patient
2. [ ] Verify redirected to `/patient-dashboard`
3. [ ] Check Network tab - should see NO 403 errors
4. [ ] Verify only patient-related API calls are made
5. [ ] Click on "SOS Emergency" card
6. [ ] Verify redirected to `/emergency` page
7. [ ] Check Network tab - should only see ambulance location queries (allowed)

### Expected Results:
- ✅ No 403 permission errors
- ✅ No calls to `/api/ambulances/my-ambulance`
- ✅ No calls to `/api/emergency-requests/active`
- ✅ No calls to `/api/notifications` (ambulance-specific)

## Test 2: Patient Attempting Ambulance-Only Pages
### Steps:
1. [ ] While logged in as Patient
2. [ ] Navigate to `/emergency-requests` (ambulance only)
3. [ ] Verify immediate redirect to `/patient-dashboard`
4. [ ] Check Network tab during redirect
5. [ ] Try navigating to `/feedback-management` (ambulance only)
6. [ ] Verify immediate redirect to `/patient-dashboard`

### Expected Results:
- ✅ Immediate redirect without loading page content
- ✅ NO API calls to ambulance-specific endpoints
- ✅ No 403 errors (redirected before API calls)

## Test 3: Ambulance Personnel Login & Dashboard Access
### Steps:
1. [ ] Login as Ambulance Personnel
2. [ ] Verify redirected to `/ambulance-dashboard`
3. [ ] Check Network tab - should see NO 403 errors
4. [ ] Verify ambulance-specific API calls execute:
   - `/api/ambulances/my-ambulance`
   - `/api/emergency-requests/active`
   - `/api/notifications/unread-count`
5. [ ] Click "Go Online" button
6. [ ] Verify status updates successfully
7. [ ] Click "Emergency Requests" card
8. [ ] Verify redirected to `/emergency-requests`

### Expected Results:
- ✅ No 403 permission errors
- ✅ All ambulance-specific APIs execute successfully
- ✅ Notification bell shows unread count (if any)
- ✅ GPS tracking starts when online

## Test 4: Ambulance Personnel Attempting Patient-Only Pages
### Steps:
1. [ ] While logged in as Ambulance Personnel
2. [ ] Navigate to `/emergency` (patient SOS page)
3. [ ] Verify immediate redirect to `/ambulance-dashboard`
4. [ ] Check Network tab during redirect
5. [ ] Try navigating to `/feedback` (patient feedback page)
6. [ ] Verify immediate redirect to `/ambulance-dashboard`

### Expected Results:
- ✅ Immediate redirect without loading page content
- ✅ NO API calls to patient-specific endpoints
- ✅ No 403 errors (redirected before API calls)

## Test 5: Shared Pages - Hospital Selection
### Steps:
1. [ ] Login as Patient
2. [ ] Navigate to `/hospital`
3. [ ] Verify read-only view displayed
4. [ ] Verify assigned hospital shown (if any)
5. [ ] Logout and login as Ambulance Personnel
6. [ ] Navigate to `/hospital`
7. [ ] Verify full functionality (search, select, accept)
8. [ ] Check Network tab - should see NO 403 errors

### Expected Results:
- ✅ Patient sees read-only view
- ✅ Ambulance Personnel sees full functionality
- ✅ No 403 errors for either role
- ✅ Each role sees appropriate UI

## Test 6: Shared Pages - Vitals Monitoring
### Steps:
1. [ ] Login as Patient
2. [ ] Navigate to `/vitals`
3. [ ] Verify read-only view displayed
4. [ ] Verify "View Only Mode" badge shown
5. [ ] Logout and login as Ambulance Personnel
6. [ ] Navigate to `/vitals`
7. [ ] Verify full functionality (start/stop monitoring)
8. [ ] Start monitoring and verify vitals update
9. [ ] Check Network tab - should see NO 403 errors

### Expected Results:
- ✅ Patient sees read-only view with current vitals
- ✅ Ambulance Personnel can start/stop monitoring
- ✅ No 403 errors for either role
- ✅ Vitals API calls only when ambulance starts monitoring

## Test 7: SOS Emergency Workflow (End-to-End)
### Steps:
#### Patient Side (Browser 1):
1. [ ] Login as Patient
2. [ ] Navigate to `/emergency`
3. [ ] Enter location and search for ambulances
4. [ ] Select an ambulance
5. [ ] Click "REQUEST AMBULANCE"
6. [ ] Verify request created (check Network tab)
7. [ ] Wait for acceptance

#### Ambulance Side (Browser 2):
8. [ ] Login as Ambulance Personnel
9. [ ] Navigate to `/emergency-requests`
10. [ ] Verify new request appears in pending list
11. [ ] Click "Accept" on the request
12. [ ] Verify request moves to active assignment

#### Patient Side (Browser 1):
13. [ ] Verify acceptance notification received
14. [ ] Verify redirected to `/hospital` page

### Expected Results:
- ✅ No 403 errors during entire workflow
- ✅ Patient creates request successfully
- ✅ Ambulance Personnel receives request
- ✅ Acceptance updates both sides via Socket.IO
- ✅ Workflow completes cleanly

## Test 8: Navbar Notification System
### Steps:
1. [ ] Login as Patient
2. [ ] Click notification bell icon
3. [ ] Verify appropriate behavior (no unread count)
4. [ ] Logout and login as Ambulance Personnel
5. [ ] Check notification bell - verify unread count appears (if any)
6. [ ] Click notification bell
7. [ ] Verify redirected to `/feedback-management`
8. [ ] Check Network tab - should see NO 403 errors

### Expected Results:
- ✅ Patient sees notification icon (no count)
- ✅ Ambulance Personnel sees unread count
- ✅ No 403 errors when fetching notification count
- ✅ Bell click navigates to correct page

## Test 9: Direct URL Navigation
### Steps:
1. [ ] Login as Patient
2. [ ] Manually type `/ambulance-dashboard` in URL bar
3. [ ] Press Enter
4. [ ] Verify immediate redirect to `/patient-dashboard`
5. [ ] Check Network tab - NO API calls to ambulance endpoints
6. [ ] Repeat with `/emergency-requests`, `/feedback-management`
7. [ ] Logout and login as Ambulance Personnel
8. [ ] Manually type `/patient-dashboard` in URL bar
9. [ ] Verify redirect to `/ambulance-dashboard`
10. [ ] Try `/emergency`, `/feedback`
11. [ ] Verify redirects to `/ambulance-dashboard`

### Expected Results:
- ✅ All unauthorized direct URL accesses redirect immediately
- ✅ No API calls made before redirect
- ✅ No 403 errors in Network tab
- ✅ Users land on their role-appropriate dashboard

## Test 10: Page Refresh on Protected Pages
### Steps:
1. [ ] Login as Patient
2. [ ] Navigate to `/hospital`
3. [ ] Refresh the page (F5 or Ctrl+R)
4. [ ] Verify page loads correctly
5. [ ] Check Network tab - NO 403 errors
6. [ ] Login as Ambulance Personnel
7. [ ] Navigate to `/emergency-requests`
8. [ ] Refresh the page
9. [ ] Verify page loads correctly with pending requests
10. [ ] Check Network tab - NO 403 errors

### Expected Results:
- ✅ Pages reload without errors
- ✅ Role verification happens before API calls
- ✅ No 403 errors after refresh
- ✅ Data loads correctly after authentication

## Common Issues to Watch For

### ❌ FAIL Indicators:
- 403 status codes in Network tab
- API calls to wrong role endpoints
- Console errors about unauthorized access
- Page loads briefly before redirect
- Data flashing before redirect

### ✅ PASS Indicators:
- No 403 errors anywhere
- Clean, immediate redirects
- Only appropriate API calls for each role
- No console errors
- Smooth user experience

## Performance Check
- [ ] Redirects happen within 100ms
- [ ] No visible flash of unauthorized content
- [ ] API calls only after role verification
- [ ] No redundant API calls
- [ ] Socket.IO connections stable

## Browser Compatibility
Test the above scenarios in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

## Summary
- Total Test Cases: 10
- Critical Tests (must pass): Tests 1, 2, 3, 4, 7, 9
- Important Tests: Tests 5, 6, 8, 10

All tests must pass with ZERO 403 permission errors for the fix to be considered complete.
