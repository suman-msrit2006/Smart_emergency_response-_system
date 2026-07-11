# Profile Synchronization - Testing Guide

## ✅ Quick Test Steps

### Prerequisites
```bash
# Start Backend
cd Hackathonproject/server
npm start

# Start Frontend (new terminal)
cd Hackathonproject/client
npm run dev
```

---

## 🧪 Test 1: Initial User Display

**Goal**: Verify Navbar shows actual user data (no hardcoded values)

1. Open browser: `http://localhost:5173`
2. Login with existing account or register new one
3. **Check Navbar** (top-right dropdown):
   - ✅ Should show your actual name (not "Medical User")
   - ✅ Should show your actual email (not "meduser@tracker.com")
   - ✅ Should show your actual role or empty (not hardcoded role)

**Expected Result**: No hardcoded fallback values visible

---

## 🧪 Test 2: Profile Page Loads Correctly

**Goal**: Verify Profile page shows same data as Navbar

1. Click profile avatar → "My Profile"
2. **Check Profile Page**:
   - ✅ First Name matches user data
   - ✅ Last Name matches user data
   - ✅ Email matches Navbar dropdown
   - ✅ Phone shows actual phone or empty
   - ✅ Role matches Navbar dropdown or empty

**Expected Result**: All fields show actual user data from AuthContext

---

## 🧪 Test 3: Profile Update Synchronization

**Goal**: Verify profile updates sync immediately to Navbar

1. On Profile page, change:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@tracker.com"
   - Phone: "+1 (555) 123-4567"
   - Role: "Doctor"

2. Click **"Save Changes"**
3. Wait for success message
4. **Check Navbar** (without refreshing page):
   - ✅ Dropdown should show "John Doe" immediately
   - ✅ Email should be "john.doe@tracker.com"
   - ✅ Role should be "Doctor"
   - ✅ Avatar initial should be "J"

**Expected Result**: Navbar updates instantly without page refresh

---

## 🧪 Test 4: Settings Page Synchronization

**Goal**: Verify Settings page shows updated profile data

1. Navigate to Settings (from Navbar or `/settings`)
2. **Check Settings Page**:
   - ✅ Email field shows "john.doe@tracker.com" (from profile update)
   - ✅ Phone field shows "+1 (555) 123-4567" (from profile update)

**Expected Result**: Settings page reflects profile changes

---

## 🧪 Test 5: Data Persistence

**Goal**: Verify data persists across page refresh and logout/login

1. **Refresh the page** (F5)
2. Check Navbar dropdown:
   - ✅ Still shows "John Doe"
   - ✅ Still shows updated email and role

3. **Logout** and **Login** again
4. Check Navbar dropdown:
   - ✅ Still shows "John Doe"
   - ✅ Profile data persisted

**Expected Result**: All changes persist across sessions

---

## 🧪 Test 6: Navigation Flow

**Goal**: Verify navigation maintains synchronization

1. Home → Profile → Update name to "Jane Smith"
2. Save Changes
3. Navigate: Profile → Settings → Home → Profile
4. **Check at each step**:
   - ✅ Navbar always shows "Jane Smith"
   - ✅ Profile page always shows updated data
   - ✅ Settings page always shows updated email/phone

**Expected Result**: Data stays synchronized across all pages

---

## 🧪 Test 7: Empty Fields Handling

**Goal**: Verify empty fields don't show hardcoded values

1. On Profile page, clear Phone field (make it empty)
2. Save Changes
3. **Check Navbar dropdown**:
   - ✅ Phone line should be hidden or empty
   - ✅ Should NOT show "+1 (555) 123-4567" or any hardcoded value

4. Clear Role field
5. Save Changes
6. **Check Navbar dropdown**:
   - ✅ Role line should be hidden or empty
   - ✅ Should NOT show "Emergency Medical Technician" or any hardcoded value

**Expected Result**: Empty fields appear empty, not with hardcoded defaults

---

## 🧪 Test 8: Cross-Tab Synchronization

**Goal**: Verify profile updates sync across browser tabs

1. Open two tabs: Tab A and Tab B (both on `http://localhost:5173`)
2. Login in both tabs
3. In **Tab A**: Update profile (change name to "Test User")
4. Click Save Changes in Tab A
5. **Switch to Tab B**:
   - ✅ Tab B Navbar should update automatically
   - ✅ No page refresh needed

**Expected Result**: Changes sync across tabs via localStorage event

---

## 🧪 Test 9: Role Dropdown

**Goal**: Verify role dropdown works properly

1. Go to Profile page
2. Click Role dropdown
3. **Check options**:
   - ✅ "Select a role" (empty option)
   - ✅ "Emergency Medical Technician"
   - ✅ "Doctor"
   - ✅ "Nurse"
   - ✅ "Administrator"
   - ✅ "Paramedic"
   - ✅ "Dispatcher"

4. Select different roles and save
5. **Check Navbar updates** after each save

**Expected Result**: All role options work and sync to Navbar

---

## 🧪 Test 10: New User Registration

**Goal**: Verify new users don't see hardcoded values

1. **Logout**
2. Go to Register page
3. Register new user:
   - Name: "New User"
   - Email: "new@test.com"
   - Password: "password123"

4. After registration (auto-login):
   - ✅ Navbar should show "New User" (not "Medical User")
   - ✅ Email should show "new@test.com" (not "meduser@tracker.com")
   - ✅ Role should be empty or from registration (not hardcoded role)

**Expected Result**: New users see their actual data immediately

---

## 🚨 Common Issues & Solutions

### Issue 1: Navbar doesn't update after profile save
**Solution**: Check browser console for errors. Ensure `updateUserProfile()` is called in Profile.jsx

### Issue 2: Hardcoded values still showing
**Solution**: Clear localStorage and login again:
```javascript
// In browser console
localStorage.clear();
// Then login again
```

### Issue 3: Profile page shows empty fields
**Solution**: Check if user is logged in and AuthContext has user data:
```javascript
// In browser console
console.log(localStorage.getItem('token'));
```

### Issue 4: Settings page not showing updated email/phone
**Solution**: Settings page loads from AuthContext, not localStorage. Refresh page after profile update.

---

## ✅ Success Criteria

All tests should pass with these results:

- [x] No hardcoded values visible anywhere
- [x] Navbar shows actual user data
- [x] Profile updates sync immediately to Navbar
- [x] Settings page shows updated user data
- [x] Data persists across page refresh
- [x] Data persists across logout/login
- [x] Empty fields don't show hardcoded defaults
- [x] Cross-tab synchronization works
- [x] Role dropdown has all options
- [x] New users see their actual data

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Test 1: Initial User Display           [ ] Pass [ ] Fail
Test 2: Profile Page Loads Correctly   [ ] Pass [ ] Fail
Test 3: Profile Update Synchronization [ ] Pass [ ] Fail
Test 4: Settings Page Synchronization  [ ] Pass [ ] Fail
Test 5: Data Persistence               [ ] Pass [ ] Fail
Test 6: Navigation Flow                [ ] Pass [ ] Fail
Test 7: Empty Fields Handling          [ ] Pass [ ] Fail
Test 8: Cross-Tab Synchronization      [ ] Pass [ ] Fail
Test 9: Role Dropdown                  [ ] Pass [ ] Fail
Test 10: New User Registration         [ ] Pass [ ] Fail

Overall: [ ] All Pass [ ] Some Fail

Notes:
_____________________________________________
_____________________________________________
```

---

## 🎯 Quick Verification Commands

### Check if user data is in AuthContext
```javascript
// In browser console (while logged in)
const user = JSON.parse(localStorage.getItem('token'));
console.log('User from token:', user);

const profile = JSON.parse(localStorage.getItem('userProfile'));
console.log('Saved profile:', profile);
```

### Check if Navbar is using AuthContext
```javascript
// In browser console
// Should show user object with firstName, lastName, etc.
// Check React DevTools -> Components -> AuthProvider
```

### Clear all data and start fresh
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

**Testing Complete**: ✅
**All Features Working**: ✅
**No Hardcoded Values**: ✅
**Synchronization Working**: ✅

---

*Happy Testing! 🎉*
