# Test Patient Account Created! ✅

## Patient Login Credentials:

```
📧 Email:    test.patient@voise.in
🔑 Password: Patient@123
👤 Role:     Patient
```

---

## 🚀 NOW DO THIS:

### Step 1: Logout from Ambulance Account

On the debug page (`/debug`), click **"Force Clear & Re-Login"**

OR manually logout from current account

### Step 2: Login as Patient

1. Go to `/login`
2. Enter:
   - Email: `test.patient@voise.in`
   - Password: `Patient@123`
3. Login

### Step 3: Verify You're Logged In Correctly

Go to `/debug` and check:
- ✅ Role should be "Patient"
- ✅ Email should be "test.patient@voise.in"

### Step 4: Create Emergency Request

1. Go to `/emergency`
2. Search location: `koramangala`
3. Select any ambulance
4. Click **"REQUEST THIS AMBULANCE"**
5. **SUCCESS!** ✅

---

## 🔄 Complete Testing Flow:

### Phase 1: Patient Creates Request
1. ✅ Login as: `test.patient@voise.in`
2. ✅ Create emergency request

### Phase 2: Ambulance Accepts Request
1. Logout
2. Login as: `ambulance.bengaluru.1@voise.in` / `Ambulance123`
3. Go to `/emergency-requests`
4. Accept the request
5. Progress through statuses

---

## 📋 Quick Commands:

```bash
# Create test patient (if deleted)
cd server
npm run seed:patient

# Clean old requests before testing
npm run clean:requests

# Full reset (clean + seed everything)
npm run reset:test
```

---

## 🎯 TWO ACCOUNTS FOR TESTING:

| Account Type | Email | Password | Use For |
|-------------|-------|----------|---------|
| **Patient** | test.patient@voise.in | Patient@123 | Creating SOS requests |
| **Ambulance** | ambulance.bengaluru.1@voise.in | Ambulance123 | Accepting/managing requests |

---

**Now logout, login as patient, and test!** 🚀
