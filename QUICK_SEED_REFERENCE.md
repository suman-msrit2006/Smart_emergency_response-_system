# 🚀 Quick Seed Reference

## Run the Seed Script

```bash
cd server
npm run seed:personnel
```

---

## 🔑 Default Password

**ALL accounts:** `Ambulance123`

---

## 📧 Quick Login Emails

### Bengaluru
- rajesh.kumar@ambulance.com
- priya.sharma@ambulance.com
- amit.patel@ambulance.com
- sneha.reddy@ambulance.com

### Mumbai
- vikram.singh@ambulance.com
- anita.desai@ambulance.com
- rahul.mehta@ambulance.com
- pooja.joshi@ambulance.com

### Chennai
- karthik.venkatesh@ambulance.com
- lakshmi.raman@ambulance.com
- suresh.kumar@ambulance.com
- divya.krishnan@ambulance.com

### Hyderabad
- srinivas.rao@ambulance.com
- kavitha.reddy@ambulance.com
- naresh.naidu@ambulance.com
- swathi.chowdary@ambulance.com

---

## 🔍 Patient Search Terms

| Search | Shows Ambulances From |
|--------|----------------------|
| Koramangala | Bengaluru (4) |
| Bandra | Mumbai (4) |
| T Nagar | Chennai (4) |
| Hitech City | Hyderabad (4) |

---

## 🚑 Ambulance Numbers

**Bengaluru:** KA-05-AB-1001 to 1004  
**Mumbai:** MH-02-AB-2001 to 2004  
**Chennai:** TN-09-AB-3001 to 3004  
**Hyderabad:** TS-09-AB-4001 to 4004

---

## 📄 Full Documentation

- **Test Accounts:** `AMBULANCE_TEST_ACCOUNTS.md`
- **Implementation Summary:** `SEED_IMPLEMENTATION_SUMMARY.md`
- **Script Docs:** `server/src/scripts/README.md`

---

## ✅ Quick Verify

After seeding, check MongoDB:

```javascript
db.users.find({ role: 'Ambulance Personnel' }).count()
// Should return: 16

db.ambulances.find({ status: 'Available' }).count()
// Should return: 16

db.hospitals.find({}).count()
// Should return: 4
```

