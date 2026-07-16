# Create Patient Account - Quick Guide

## You're Currently Logged In As:
- **Name:** Rajesh Kumar
- **Role:** Ambulance Personnel ❌
- **Email:** rajesh.kumar@ambulance.com

## Problem:
Ambulance Personnel CANNOT create emergency requests. Only Patients can!

---

## ✅ SOLUTION - Create Patient Account:

### Step 1: Logout
Click on the debug page's **"Force Clear & Re-Login"** button

OR

Go to your profile and click Logout

### Step 2: Register as Patient

1. Go to: `http://localhost:5173/register`

2. Fill in the form:
   ```
   Name: Your Name (e.g., "Dikshith Test")
   Email: test.patient@gmail.com (any email you want)
   Password: Test@123
   Phone: 9876543210
   Role: ⚠️ SELECT "Patient" (NOT Ambulance Personnel!)
   Age: 25
   Blood Group: O+
   Address: Koramangala, Bangalore
   Emergency Contact: 9876543211
   ```

3. Click **Register**

### Step 3: Verify You're Logged In As Patient

Go to `/debug` and check:
- ✅ Role should show "Patient"
- ✅ Email should be your new patient email

### Step 4: Create Emergency Request

Now try:
1. Go to `/emergency`
2. Search "koramangala"
3. Select ambulance
4. Click "REQUEST THIS AMBULANCE"
5. **Should work!** ✅

---

## 📌 Remember:

**Two Separate Accounts:**

1. **Patient Account** - For creating emergency requests (SOS)
2. **Ambulance Personnel Account** - For accepting requests (ambulance.bengaluru.1@voise.in)

You need BOTH accounts to test the complete workflow!

---

## Full Test Flow:

1. **Login as Patient** → Create SOS request
2. **Logout**
3. **Login as Ambulance Personnel** → Accept request
4. Progress through status updates

---

Go to `/register` now and create a patient account! 🚀
