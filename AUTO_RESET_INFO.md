# Auto-Reset on Server Startup

## What Happens Now

**Every time you start the server in development mode, the system automatically clears all SOS workflow data.**

### ✅ On Server Start:
```
Server starting...
═══════════════════════════════════════════════════
  AUTO-RESET: Clearing SOS workflow data...
═══════════════════════════════════════════════════
✅ AUTO-RESET COMPLETE:
   - Emergency Requests: 5 deleted
   - Emergencies: 3 deleted
   - Ambulances: 10 reset to Available
   - Vitals: 150 deleted
   - Consultations: 8 deleted
   - Notifications: 25 deleted
   - Feedback: 12 deleted
✅ System ready for fresh SOS testing!
═══════════════════════════════════════════════════
Server running in development mode on port 5000
⚠️  AUTO-RESET ENABLED: SOS data cleared on every server restart
```

---

## Benefits

✅ **No Manual Cleanup** - Just restart the server  
✅ **Always Fresh** - Every test starts clean  
✅ **No "Active Request" Errors** - Old data automatically cleared  
✅ **Zero Extra Steps** - Happens automatically  

---

## When It Runs

### ✅ Runs (Auto-Reset Enabled):
- `NODE_ENV=development` in `.env`
- Every server restart
- After database connection established

### ❌ Does NOT Run (Auto-Reset Disabled):
- `NODE_ENV=production` in `.env`
- Production deployments
- Any non-development environment

---

## What Gets Cleared

Same as manual reset:
- Emergency Requests (all)
- Emergencies (all)
- Ambulances (reset to Available/Online)
- Vitals (all)
- Consultations (all)
- Notifications (all)
- Feedback (all)

**Preserved:**
- Users (all accounts)
- Hospitals
- Ambulance vehicles (only status reset)
- Authentication tokens

---

## How to Disable Auto-Reset

### Option 1: Change Environment (Recommended)
```bash
# In server/.env
NODE_ENV=production
```

### Option 2: Comment Out Code (Temporary)
```javascript
// In server/src/server.js
connectDB().then(async () => {
  // await autoResetOnStartup();  // Commented out
});
```

---

## Testing Workflow

### Old Way (Manual):
```bash
# 1. Start server
npm run dev

# 2. Run reset script
./reset-sos.sh

# 3. Start testing
```

### New Way (Automatic):
```bash
# 1. Start server (auto-resets!)
npm run dev

# 2. Start testing immediately
```

---

## Manual Reset Still Available

If you need to reset **without restarting the server**:

```bash
# Using script
./reset-sos.sh

# Using API
curl -X POST http://localhost:5000/api/dev/reset-sos \
  -H "Authorization: Bearer <token>"
```

---

## Production Safety

### ✅ Automatically Disabled in Production:
- Check: `if (config.env !== 'development') return;`
- No reset happens in production
- No risk of data loss

### Deployment:
```bash
# Production .env
NODE_ENV=production  # Auto-reset disabled
```

Server will start normally without any resets.

---

## Console Output

### Development Mode:
```
✅ MongoDB connected: development-db
═══════════════════════════════════════════════════
  AUTO-RESET: Clearing SOS workflow data...
═══════════════════════════════════════════════════
✅ AUTO-RESET COMPLETE:
   - Emergency Requests: 5 deleted
   - Ambulances: 10 reset to Available
✅ System ready for fresh SOS testing!
═══════════════════════════════════════════════════
Server running in development mode on port 5000
⚠️  AUTO-RESET ENABLED: SOS data cleared on every server restart
```

### Production Mode:
```
✅ MongoDB connected: production-db
Server running in production mode on port 5000
```
(No auto-reset message)

---

## Troubleshooting

### Issue: "Auto-reset not running"
**Check:** `NODE_ENV=development` in `server/.env`

### Issue: "Want to keep some test data"
**Solution:** 
- Set `NODE_ENV=production` temporarily
- Or comment out auto-reset in `server.js`
- Or use manual reset only when needed

### Issue: "Reset fails on startup"
**Behavior:** Server continues to start (non-blocking)
**Log:** Shows error but doesn't crash server

---

## Summary

| Scenario | Behavior |
|----------|----------|
| **Development + Server Restart** | ✅ Auto-reset runs |
| **Production + Server Restart** | ❌ Auto-reset skipped |
| **Need reset without restart** | ✅ Use manual reset API/script |
| **Want to keep test data** | Change to production mode temporarily |

---

**Result: Every server restart = Fresh start for SOS testing! 🚀**
