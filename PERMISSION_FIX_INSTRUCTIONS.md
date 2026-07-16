# Permission Issue - 403 Forbidden

## Problem Identified:
`POST /api/emergency-requests 403` - Permission denied

The user's role is not being recognized properly by the `restrictTo` middleware.

## Steps to Debug:

### 1. Restart Backend
```bash
# Stop with Ctrl+C
cd server
npm start
```

### 2. Try Creating Emergency Request Again

### 3. Check Backend Logs

You should now see logs like:
```
[AUTH] User authenticated: {
  id: '...',
  email: '...',
  role: 'Patient',  <-- THIS IS THE KEY
  name: '...'
}

[AUTH] Checking role restriction: {
  requiredRoles: ['Patient'],
  userRole: '...',  <-- Check if this matches
  userId: '...',
  allowed: true/false
}
```

### 4. Share the Logs

Copy and send the `[AUTH]` logs from your backend terminal.

---

## Possible Issues:

1. **User role is undefined** - User document doesn't have role field
2. **User role is wrong** - Logged in as 'Ambulance Personnel' instead of 'Patient'
3. **Token contains wrong user** - Old token with wrong role

## Quick Check:

**In browser console**, check what user is logged in:
```javascript
console.log(JSON.parse(localStorage.getItem('user')));
```

Make sure it shows:
```json
{
  "role": "Patient",
  ...
}
```

If role is missing or wrong, **logout and login again** as a patient.

---

Once you share the [AUTH] logs, I'll fix it immediately!
