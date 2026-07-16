# Login Credentials - Quick Reference 🔑

## 👤 PATIENT ACCOUNT

```
📧 Email:    test.patient@voise.in
🔑 Password: Patient@123
👤 Role:     Patient
```

**Use for:** Creating emergency requests (SOS)

---

## 🚑 AMBULANCE PERSONNEL ACCOUNTS

**Password for ALL ambulance accounts:** `Ambulance123`

### Bengaluru (Koramangala)

| Name | Email | Ambulance |
|------|-------|-----------|
| Rajesh Kumar | rajesh.kumar@ambulance.com | KA-05-AB-1001 |
| Priya Sharma | priya.sharma@ambulance.com | KA-05-AB-1002 |
| Amit Patel | amit.patel@ambulance.com | KA-05-AB-1003 |
| Sneha Reddy | sneha.reddy@ambulance.com | KA-05-AB-1004 |

### Mumbai (Bandra)

| Name | Email | Ambulance |
|------|-------|-----------|
| Vikram Singh | vikram.singh@ambulance.com | MH-02-AB-2001 |
| Anita Desai | anita.desai@ambulance.com | MH-02-AB-2002 |
| Rahul Mehta | rahul.mehta@ambulance.com | MH-02-AB-2003 |
| Pooja Joshi | pooja.joshi@ambulance.com | MH-02-AB-2004 |

### Chennai (T. Nagar)

| Name | Email | Ambulance |
|------|-------|-----------|
| Karthik Venkatesh | karthik.venkatesh@ambulance.com | TN-09-AB-3001 |
| Lakshmi Raman | lakshmi.raman@ambulance.com | TN-09-AB-3002 |
| Suresh Kumar | suresh.kumar@ambulance.com | TN-09-AB-3003 |
| Divya Krishnan | divya.krishnan@ambulance.com | TN-09-AB-3004 |

### Hyderabad (Hitech City)

| Name | Email | Ambulance |
|------|-------|-----------|
| Srinivas Rao | srinivas.rao@ambulance.com | TS-09-AB-4001 |
| Kavitha Reddy | kavitha.reddy@ambulance.com | TS-09-AB-4002 |
| Naresh Naidu | naresh.naidu@ambulance.com | TS-09-AB-4003 |
| Swathi Chowdary | swathi.chowdary@ambulance.com | TS-09-AB-4004 |

**Use for:** Accepting and managing emergency requests

---

## ⚠️ IMPORTANT NOTES:

1. **Email format:** `firstname.lastname@ambulance.com`
   - ✅ `sneha.reddy@ambulance.com` (correct)
   - ❌ `sneha.reddy@ambulance.in` (wrong)
   - ❌ `sneha@ambulance.com` (wrong)

2. **Password is case-sensitive:** `Ambulance123`
   - ✅ `Ambulance123` (correct)
   - ❌ `ambulance123` (wrong)
   - ❌ `AMBULANCE123` (wrong)

3. **Patient email:** `test.patient@voise.in` (ends with `.in` not `.com`)

---

## 🧪 Testing Flow:

### 1. Patient Creates Request
- Login: `test.patient@voise.in` / `Patient@123`
- Go to `/emergency`
- Search "koramangala"
- Request ambulance

### 2. Ambulance Accepts Request
- Logout
- Login: `rajesh.kumar@ambulance.com` / `Ambulance123`
- Go to `/emergency-requests`
- Accept request
- Progress through workflow

---

**Copy-paste these credentials for quick testing!** 📋
