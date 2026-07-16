# Quick Test Commands - Keep This Open! 📌

## Before Each Test Session:

### 1. Clean Database
```bash
cd server
npm run clean:requests
```
**What it does:** Removes all emergency requests so you can test fresh

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## Test Login Credentials:

### Patient Account:
- Create your own via `/register` page
- Select role: **Patient**

### Ambulance Personnel:
- Email: `ambulance.bengaluru.1@voise.in`
- Password: `Ambulance123`

See `AMBULANCE_TEST_ACCOUNTS.md` for all 16 ambulance accounts.

---

## Useful Commands:

```bash
# Clean only emergency requests
npm run clean:requests

# Clean only ambulance personnel
npm run clean:personnel

# Clean everything (requests + personnel)
npm run clean:all

# Reset everything and re-seed ambulances
npm run reset:test
```

---

## Testing Flow:

1. ✅ Run `npm run clean:requests` 
2. ✅ Start backend and frontend
3. ✅ Login as **Patient**
4. ✅ Search location: "koramangala"
5. ✅ Select ambulance
6. ✅ Click "REQUEST THIS AMBULANCE"
7. ✅ Should create successfully!

---

## If You See Errors:

### "You already have an active emergency request"
👉 Run: `cd server && npm run clean:requests`

### "Permission denied (403)"
👉 Make sure you're logged in as **Patient**, not Ambulance Personnel

### "Failed to create emergency request"
👉 Check backend terminal for error logs
👉 Share the error with me

---

## Quick Commands Reference:

| Command | What It Does |
|---------|-------------|
| `npm run clean:requests` | Delete all emergency requests |
| `npm run clean:personnel` | Delete all ambulance personnel |
| `npm run clean:all` | Delete requests + personnel |
| `npm run reset:test` | Clean everything + re-seed ambulances |
| `npm run seed:personnel` | Add 16 ambulance accounts |

---

**Keep this file open while testing!** 🚀
