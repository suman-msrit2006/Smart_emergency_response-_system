# Testing Guide - Role-Based Registration

## 🧪 QUICK TESTING GUIDE

**Before You Start:**
- Ensure backend server is running (`cd server && npm start`)
- Ensure frontend is running (`cd client && npm run dev`)
- Have MongoDB Atlas connection working
- Clear browser cache and localStorage

---

## ✅ TEST 1: Patient Registration Flow

### **Steps:**

1. **Navigate to Registration**
   ```
   URL: http://localhost:5173/register
   Expected: See "Join TrackER AI" with 2 cards
   ```

2. **Verify Patient Card**
   ```
   Look for:
   ✓ Blue circular icon with user symbol
   ✓ "Patient" title
   ✓ 4 bullet points (Request, Track, View, Submit)
   ✓ "Register as Patient" blue button
   ✓ Card has hover effect (elevates on hover)
   ```

3. **Click Patient Card**
   ```
   Click: "Register as Patient" button
   Expected: 
   - Cards disappear
   - Registration form appears
   - Role badge shows "🟢 Patient"
   - See "Back to role selection" link
   ```

4. **Verify Patient Form Fields**
   ```
   Should see these fields:
   ☐ Full Name *
   ☐ Email *
   ☐ Password *
   ☐ Confirm Password *
   ☐ Phone Number *
   ☐ Age *
   ☐ Gender * (dropdown)
   ☐ Emergency Contact Number *
   
   Should NOT see:
   ✗ Employee ID
   ✗ Ambulance Number
   ✗ License Number
   ✗ Organization
   ```

5. **Test Back Navigation**
   ```
   Click: "← Back to role selection"
   Expected:
   - Return to card selection
   - Form data cleared
   - Can select either role again
   ```

6. **Fill Patient Form with Valid Data**
   ```
   Full Name: John Doe
   Email: john.patient@test.com
   Password: TestPass123
   Confirm Password: TestPass123
   Phone: +1234567890
   Age: 35
   Gender: Male
   Emergency Contact: +0987654321
   ```

7. **Submit Form**
   ```
   Click: "Create account" button
   Expected:
   - Button shows "Creating account..."
   - After 1-2 seconds, redirect to dashboard
   - User is logged in
   - Can see user name in navbar
   ```

8. **Verify Database Storage**
   ```
   Check MongoDB:
   - New user document created
   - role: "Patient"
   - age: 35
   - gender: "Male"
   - emergencyContactNumber: "+0987654321"
   - password is hashed
   ```

9. **Test Login After Registration**
   ```
   1. Logout
   2. Go to /login
   3. Enter: john.patient@test.com / TestPass123
   4. Click "Sign in"
   Expected: Login successful, redirect to dashboard
   ```

---

## ✅ TEST 2: Ambulance Personnel Registration Flow

### **Steps:**

1. **Navigate to Registration**
   ```
   URL: http://localhost:5173/register
   Expected: See "Join TrackER AI" with 2 cards
   ```

2. **Verify Ambulance Card**
   ```
   Look for:
   ✓ Teal circular icon with document symbol
   ✓ "Ambulance Personnel" title
   ✓ 4 bullet points (Accept, Update, Monitor, Complete)
   ✓ "Register as Ambulance Personnel" teal button
   ✓ Card has hover effect (elevates on hover)
   ```

3. **Click Ambulance Card**
   ```
   Click: "Register as Ambulance Personnel" button
   Expected: 
   - Cards disappear
   - Registration form appears
   - Role badge shows "🚑 Ambulance Personnel"
   - See "Back to role selection" link
   ```

4. **Verify Ambulance Form Fields**
   ```
   Should see these fields:
   ☐ Full Name *
   ☐ Email *
   ☐ Password *
   ☐ Confirm Password *
   ☐ Phone Number *
   ☐ Employee ID *
   ☐ Ambulance Number *
   ☐ Driving License Number *
   ☐ Organization / Hospital *
   
   Should NOT see:
   ✗ Age
   ✗ Gender
   ✗ Emergency Contact Number
   ```

5. **Test Back Navigation**
   ```
   Click: "← Back to role selection"
   Expected:
   - Return to card selection
   - Form data cleared
   - Can select either role again
   ```

6. **Fill Ambulance Form with Valid Data**
   ```
   Full Name: Jane Smith
   Email: jane.ambulance@test.com
   Password: TestPass456
   Confirm Password: TestPass456
   Phone: +1234567890
   Employee ID: EMP12345
   Ambulance Number: AMB-001
   License Number: DL12345678
   Organization: City General Hospital
   ```

7. **Submit Form**
   ```
   Click: "Create account" button
   Expected:
   - Button shows "Creating account..."
   - After 1-2 seconds, redirect to dashboard
   - User is logged in
   - Can see user name in navbar
   ```

8. **Verify Database Storage**
   ```
   Check MongoDB:
   - New user document created
   - role: "Ambulance Personnel"
   - employeeId: "EMP12345"
   - ambulanceNumber: "AMB-001"
   - licenseNumber: "DL12345678"
   - organization: "City General Hospital"
   - password is hashed
   ```

9. **Test Login After Registration**
   ```
   1. Logout
   2. Go to /login
   3. Enter: jane.ambulance@test.com / TestPass456
   4. Click "Sign in"
   Expected: Login successful, redirect to dashboard
   ```

---

## ✅ TEST 3: Validation Tests

### **A. Password Validation**

1. **Test Weak Password**
   ```
   Password: "test"
   Expected: Error - "Password must be at least 8 characters long"
   ```

2. **Test Password Without Uppercase**
   ```
   Password: "testpass123"
   Expected: Error - "Password must contain uppercase, lowercase, and number"
   ```

3. **Test Password Without Number**
   ```
   Password: "TestPassword"
   Expected: Error - "Password must contain uppercase, lowercase, and number"
   ```

4. **Test Password Mismatch**
   ```
   Password: "TestPass123"
   Confirm: "TestPass456"
   Expected: Error - "Passwords do not match"
   ```

### **B. Patient-Specific Validation**

1. **Test Age Validation**
   ```
   Age: -5
   Expected: Error - "Please enter a valid age"
   
   Age: 200
   Expected: Error - "Please enter a valid age"
   
   Age: (empty)
   Expected: Error - "Age is required for Patient registration"
   ```

2. **Test Gender Validation**
   ```
   Gender: (not selected)
   Expected: Error - "Please select a gender"
   ```

3. **Test Emergency Contact Validation**
   ```
   Emergency Contact: (empty)
   Expected: Error - "Emergency contact number is required"
   ```

### **C. Ambulance-Specific Validation**

1. **Test Employee ID Validation**
   ```
   Employee ID: (empty)
   Expected: Error - "Employee ID is required"
   ```

2. **Test Ambulance Number Validation**
   ```
   Ambulance Number: (empty)
   Expected: Error - "Ambulance Number is required"
   ```

3. **Test License Number Validation**
   ```
   License Number: (empty)
   Expected: Error - "Driving License Number is required"
   ```

4. **Test Organization Validation**
   ```
   Organization: (empty)
   Expected: Error - "Organization/Hospital is required"
   ```

### **D. Common Field Validation**

1. **Test Email Validation**
   ```
   Email: "invalid-email"
   Expected: Error - "Invalid email address"
   ```

2. **Test Required Fields**
   ```
   Leave any required field empty
   Expected: Browser validation "Please fill out this field"
   ```

---

## ✅ TEST 4: Existing Login Verification

### **Steps:**

1. **Navigate to Login**
   ```
   URL: http://localhost:5173/login
   ```

2. **Verify Login Page Unchanged**
   ```
   Should see:
   ✓ "Sign in to your account" heading
   ✓ Email field
   ✓ Password field
   ✓ "Remember me" checkbox
   ✓ "Sign in" button
   ✓ "Create account" link
   ✓ NO changes to layout or design
   ```

3. **Test Login with Patient Account**
   ```
   Email: john.patient@test.com
   Password: TestPass123
   Expected: Login successful
   ```

4. **Test Login with Ambulance Account**
   ```
   Email: jane.ambulance@test.com
   Password: TestPass456
   Expected: Login successful
   ```

5. **Verify User State**
   ```
   After login, check:
   ✓ User name in navbar
   ✓ Role displayed correctly in profile
   ✓ Can access dashboard
   ✓ Can access protected routes
   ✓ Logout works correctly
   ```

---

## ✅ TEST 5: Responsive Design

### **Mobile (375px width)**

1. **Role Selection Cards**
   ```
   Expected:
   - Cards stack vertically (1 column)
   - Cards full width
   - Icons clearly visible
   - Text readable
   - Buttons full width
   - No horizontal scroll
   ```

2. **Registration Form**
   ```
   Expected:
   - Form fields full width
   - Labels clearly visible
   - Inputs easy to tap
   - Back button visible
   - Role badge centered
   - No horizontal scroll
   ```

### **Tablet (768px width)**

1. **Role Selection Cards**
   ```
   Expected:
   - Cards side by side (2 columns)
   - Proper spacing between cards
   - All content visible
   - Hover effects work
   ```

2. **Registration Form**
   ```
   Expected:
   - Form centered
   - Good spacing
   - All fields visible
   - Easy to interact
   ```

### **Desktop (1920px width)**

1. **Role Selection Cards**
   ```
   Expected:
   - Cards side by side (2 columns)
   - Max width maintained
   - Centered layout
   - Beautiful spacing
   - Smooth hover animations
   ```

2. **Registration Form**
   ```
   Expected:
   - Form centered
   - Max width maintained
   - Clean professional look
   - All animations smooth
   ```

---

## ✅ TEST 6: Browser Compatibility

### **Test on Each Browser:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**What to Check:**
1. Card animations work
2. Form validation works
3. Password fields mask correctly
4. Dropdowns work correctly
5. Submit button works
6. Error messages display correctly
7. Redirects work correctly
8. No console errors

---

## ✅ TEST 7: Edge Cases

### **A. Network Errors**

1. **Simulate Slow Network**
   ```
   Expected:
   - Loading state shows
   - Button disabled during submission
   - "Creating account..." message displays
   ```

2. **Simulate Failed Registration**
   ```
   Try duplicate email:
   Expected: Error message "Email already registered"
   ```

### **B. Navigation Edge Cases**

1. **Browser Back Button**
   ```
   Steps:
   1. Select role → form appears
   2. Press browser back button
   Expected: Go back to previous page (not role selection)
   ```

2. **Multiple Role Switches**
   ```
   Steps:
   1. Select Patient → back
   2. Select Ambulance → back
   3. Select Patient → fill form → submit
   Expected: Everything works correctly
   ```

### **C. Authentication Edge Cases**

1. **Already Authenticated**
   ```
   Steps:
   1. Login to account
   2. Navigate to /register
   Expected: Redirect to dashboard
   ```

2. **Session Expiry**
   ```
   Steps:
   1. Register account
   2. Wait for token to expire
   3. Try to access protected route
   Expected: Redirect to login
   ```

---

## 📊 TEST RESULTS CHECKLIST

### **Patient Registration:**
- [ ] Card displays correctly
- [ ] Form fields correct
- [ ] Validation works
- [ ] Submit successful
- [ ] Data stored in DB
- [ ] Login works after registration
- [ ] Dashboard accessible

### **Ambulance Registration:**
- [ ] Card displays correctly
- [ ] Form fields correct
- [ ] Validation works
- [ ] Submit successful
- [ ] Data stored in DB
- [ ] Login works after registration
- [ ] Dashboard accessible

### **Existing Login:**
- [ ] Login page unchanged
- [ ] Patient login works
- [ ] Ambulance login works
- [ ] User state correct
- [ ] Protected routes work
- [ ] No breaking changes

### **UI/UX:**
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop layout correct
- [ ] Animations smooth
- [ ] Colors correct
- [ ] Hover effects work
- [ ] No UI bugs

### **Validation:**
- [ ] Password strength enforced
- [ ] Email validation works
- [ ] Required fields validated
- [ ] Role-specific validation works
- [ ] Error messages clear
- [ ] Form prevents invalid submission

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: Cards Not Displaying**
```
Problem: Role selection cards don't appear
Solution: Check that step state is 'role-selection'
```

### **Issue 2: Form Fields Missing**
```
Problem: Not all form fields showing
Solution: Verify selectedRole is set correctly
```

### **Issue 3: Validation Not Working**
```
Problem: Form submits with invalid data
Solution: Check validateForm() function in Register.jsx
```

### **Issue 4: Registration Fails**
```
Problem: Backend returns error
Solution: Check MongoDB connection and schema
```

### **Issue 5: Login Doesn't Work**
```
Problem: Can't login after registration
Solution: Verify JWT token is stored in localStorage
```

---

## ✅ SIGN-OFF CHECKLIST

Before marking as complete:

- [ ] All TEST 1 steps passed (Patient)
- [ ] All TEST 2 steps passed (Ambulance)
- [ ] All TEST 3 validations work
- [ ] TEST 4 login verification passed
- [ ] TEST 5 responsive design verified
- [ ] TEST 6 browser compatibility checked
- [ ] TEST 7 edge cases handled
- [ ] No console errors
- [ ] No visual bugs
- [ ] Performance acceptable
- [ ] Database storage verified

---

## 📞 TESTING COMPLETE

Once all tests pass:

1. ✅ Document any issues found
2. ✅ Verify fixes for all issues
3. ✅ Retest after fixes
4. ✅ Sign off on implementation
5. ✅ Ready for staging deployment

---

**Happy Testing!** 🎉

