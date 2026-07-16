# Quick Reset for SOS Testing

## Problem
Getting **"You already have an active emergency request"** error during testing?

## Solution
Run the reset script before each test!

---

## Quick Start

### Linux/Mac:
```bash
chmod +x reset-sos.sh
./reset-sos.sh
```

### Windows:
```cmd
reset-sos.bat
```

### With Custom Credentials:
```bash
# Linux/Mac
./reset-sos.sh myemail@test.com mypassword

# Windows
reset-sos.bat myemail@test.com mypassword
```

---

## What It Does

✅ Clears all emergency requests  
✅ Resets all ambulances to Available  
✅ Clears all vitals, consultations, notifications  
✅ **Preserves:** Users, hospitals, login credentials  

---

## Manual Reset (Using Postman/Thunder Client)

1. **Login** to get token:
   ```
   POST http://localhost:5000/api/auth/login
   Body: {"email":"patient@test.com","password":"password123"}
   ```

2. **Reset** SOS workflow:
   ```
   POST http://localhost:5000/api/dev/reset-sos
   Headers: Authorization: Bearer <your-token>
   ```

3. **Verify** state:
   ```
   GET http://localhost:5000/api/dev/state
   ```

---

## Testing Workflow

```bash
# 1. Reset before testing
./reset-sos.sh

# 2. Test Patient SOS (Browser 1)
#    ✅ Create emergency request (no error!)

# 3. Test Ambulance (Browser 2)
#    ✅ Accept request

# 4. Complete workflow
#    ✅ Hospital, Vitals, Doctor, Discharge

# 5. Test again? Just reset!
./reset-sos.sh
```

---

## Check System State Anytime

```bash
curl http://localhost:5000/api/dev/state
```

Shows counts of:
- Emergency requests
- Ambulances available/busy
- Vitals, consultations, notifications

---

## Troubleshooting

**Script not found?**
- Make sure you're in the project root directory

**Permission denied?** (Linux/Mac)
- Run: `chmod +x reset-sos.sh`

**Login failed?**
- Check email/password
- Make sure backend is running on port 5000

**Routes not found?**
- Check `NODE_ENV=development` in server `.env` file

---

## Read More

- **Full Guide:** See `DEV_RESET_GUIDE.md`
- **Technical Details:** See `DEV_RESET_IMPLEMENTATION_SUMMARY.md`

---

**That's it! Reset and test freely. 🚀**
