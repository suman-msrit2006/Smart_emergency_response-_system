# Quick Testing Guide - Ambulance Dashboard

## 🧹 FIRST: Clean Old Test Data

**Run this BEFORE each test session:**
```bash
cd server
npm run clean:requests
```

This removes all old emergency requests so you can test fresh every time.

## 🚀 Start Servers

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm run dev
```

## 🔐 Login Credentials

See `AMBULANCE_TEST_ACCOUNTS.md` for all accounts.

**Quick Test Account:**
- Email: `ambulance.bengaluru.1@voise.in`
- Password: `Ambulance123`

## ✅ Test Checklist

### 1. Dashboard Summary (Clean UI)
- [ ] Login as ambulance personnel
- [ ] Dashboard shows clean layout (no full request cards)
- [ ] See "Emergency Requests Summary Card"
- [ ] See "View All Requests" button
- [ ] Click "Go Online"

### 2. Receive Emergency Request
- [ ] Have patient send SOS request
- [ ] Dashboard pending count badge updates automatically
- [ ] Toast notification appears
- [ ] Badge shows correct number with pulse animation

### 3. Navigate to Emergency Requests Page
- [ ] Click "View All Requests" button
- [ ] Navigate to `/emergency-requests` page
- [ ] See full request details (patient, location, severity)
- [ ] See Accept/Reject buttons

### 4. Accept & Manage Request
- [ ] Click "Accept" button
- [ ] Request moves to "Active Assignment" section
- [ ] Click "Mark En Route" button
- [ ] Progress through all statuses:
  - [ ] En Route
  - [ ] Arrived
  - [ ] Patient Picked Up
  - [ ] Reached Hospital
  - [ ] Complete Handover

### 5. Real-time Updates
- [ ] Have second patient send SOS
- [ ] Verify dashboard updates without refresh
- [ ] Verify Emergency Requests page updates automatically

## 🐛 If Issues Occur

Check browser console (F12) for errors and share the logs.

## 📋 Expected Behavior

**Dashboard**: Clean command center with summary only  
**Emergency Requests Page**: Full request management with all details  
**Real-time**: Socket.IO keeps everything synced automatically

---

All good? You're ready to go! 🎉
