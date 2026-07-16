# Debug Emergency Request Issue

## I've added comprehensive logging to both frontend and backend.

## Steps to Debug:

### 1. Restart Both Servers

**Backend:**
```bash
# Stop with Ctrl+C
cd server
npm start
```

**Frontend:**
```bash
# Stop with Ctrl+C  
cd client
npm run dev
```

### 2. Open Browser Console

- Press **F12** or **Ctrl+Shift+I**
- Go to **Console** tab
- Clear all previous logs (trash icon)

### 3. Try Creating Emergency Request

1. Login as patient
2. Search location: "koramangala"
3. Select an ambulance
4. Click "REQUEST THIS AMBULANCE"

### 4. Check Browser Console

Look for logs like:
```
=== FRONTEND: Creating Emergency Request ===
Request Data: {
  "patientName": "...",
  "patientPhone": "...",
  "location": {...}
}
[emergencyRequestService] Sending request to: /emergency-requests
[emergencyRequestService] Response received: ...
```

OR errors like:
```
=== FRONTEND: Error Creating Emergency Request ===
Error message: ...
Error status: ...
```

### 5. Check Backend Terminal

Look for logs like:
```
=== CREATE EMERGENCY REQUEST START ===
Patient ID: ...
Request Data: {...}
Validating coordinates: ...
Creating emergency request with data: ...
=== CREATE EMERGENCY REQUEST END (SUCCESS) ===
```

OR errors like:
```
=== CREATE EMERGENCY REQUEST FAILED ===
Error type: ValidationError
Error message: ...
Validation errors: {...}
```

### 6. Share With Me

**From Browser Console**, copy and send:
- The complete `=== FRONTEND` logs
- Any red error messages

**From Backend Terminal**, copy and send:
- The complete `=== CREATE EMERGENCY REQUEST` logs
- Any error stack traces

---

## Common Issues to Check:

1. **No token** - User not logged in properly
2. **Wrong phone format** - User.phone doesn't match validation regex
3. **Invalid coordinates** - Location data malformed
4. **Database connection** - MongoDB not connected
5. **Validation errors** - Required fields missing

---

Once you share the exact logs, I can fix the issue immediately!
