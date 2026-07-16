# 🚀 START HERE - Fresh Clean Testing

## ✅ Backend Database: CLEANED!

Your database has been cleaned. Now clean your browser!

---

## 🌐 STEP 1: Clean Browser Cache

### Easiest Way:

**Go to this URL:**
```
http://localhost:5173/cleanup
```

**Click:** "Full Cleanup & Logout" button

**Done!** ✅

---

## 🎯 STEP 2: Login and Test

### Patient Login (Creates SOS Request):

**URL:** `http://localhost:5173/login`

**Credentials:**
```
Email:    test.patient@voise.in
Password: Patient@123
```

**What to do:**
1. Click "Emergency SOS"
2. Search "koramangala"
3. Select ambulance
4. Click "REQUEST THIS AMBULANCE"
5. Should create successfully! ✅

---

### Ambulance Login (Accepts Request):

**URL:** `http://localhost:5173/login`
*(Open in different browser or incognito)*

**Credentials:**
```
Email:    sneha.reddy@ambulance.com
Password: Ambulance123
```

**What to do:**
1. Click "Emergency Requests"
2. See pending request from patient
3. Click "Accept"
4. Progress through workflow ✅

---

## 💡 Pro Tips:

### Use 2 Browsers Simultaneously:

- **Chrome Normal:** Patient account
- **Chrome Incognito:** Ambulance account

This lets you see real-time updates!

### Before Next Test:

```bash
cd server
npm run clean:full
```

Then visit: `http://localhost:5173/cleanup`

---

## 🔗 Important URLs:

| URL | Purpose |
|-----|---------|
| `/login` | Login page |
| `/cleanup` | Clear browser cache |
| `/debug` | Check user info |

---

## ⚠️ If You Get Errors:

1. **"Already have active request"**
   → Run `npm run clean:full` and visit `/cleanup`

2. **"Permission denied (403)"**
   → You're using wrong role. Go to `/debug` to check

3. **Page won't load**
   → Clear browser cache using `/cleanup`

---

## 🎉 You're All Set!

**Database:** ✅ Cleaned  
**Ready to test:** ✅ YES

**Start by visiting:**
```
http://localhost:5173/cleanup
```

**Then login and test!** 🚀

---

See `FRESH_START_GUIDE.md` for detailed cleanup process.
