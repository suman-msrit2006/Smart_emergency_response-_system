# Quick Deployment Reference - TrackER AI

**One-page reference for quick deployment**

---

## 🚀 DEPLOYMENT IN 3 STEPS

### 1️⃣ MongoDB Atlas (10 min)
```
1. Visit https://mongodb.com/cloud/atlas/register
2. Create M0 (Free) cluster
3. Create database user & save password
4. Network Access → Add 0.0.0.0/0
5. Get connection string
6. Add /trackerai before ?retryWrites

✅ Output: mongodb+srv://user:pass@cluster.mongodb.net/trackerai?retryWrites=true&w=majority
```

### 2️⃣ Render Backend (15 min)
```
1. Visit https://dashboard.render.com
2. New → Web Service → Connect GitHub
3. Root Directory: server
4. Build: npm install
5. Start: node src/server.js
6. Environment Variables:
   NODE_ENV=production
   MONGODB_URI=[from step 1]
   JWT_SECRET=[generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
   CLIENT_URL=https://[will-update-after-step-3].vercel.app
   PORT=5000
7. Deploy

✅ Output: https://your-app.onrender.com
```

### 3️⃣ Vercel Frontend (10 min)
```
1. Visit https://vercel.com/dashboard
2. New Project → Import GitHub Repo
3. Root Directory: client
4. Environment Variables:
   VITE_API_URL=https://[from-step-2].onrender.com/api
   VITE_SOCKET_URL=https://[from-step-2].onrender.com
5. Deploy

✅ Output: https://your-app.vercel.app
```

### 🔄 Update CORS
```
Go back to Render → Update CLIENT_URL to Vercel URL → Save (auto-redeploys)
```

---

## 📝 ENVIRONMENT VARIABLES CHEAT SHEET

### Frontend (Vercel)
```bash
VITE_API_URL=https://backend.onrender.com/api
VITE_SOCKET_URL=https://backend.onrender.com
```

### Backend (Render)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/trackerai?retryWrites=true&w=majority
JWT_SECRET=[32+ characters - generate new]
JWT_EXPIRES_IN=7d
CLIENT_URL=https://frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔐 GENERATE JWT SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ VERIFICATION

### Backend Health Check
```bash
curl https://your-backend.onrender.com/api/health
```

Expected:
```json
{"status":"success","message":"API is healthy"}
```

### Frontend Test
- Visit https://your-frontend.vercel.app
- Register account
- Login
- Test emergency workflow

---

## 🐛 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Failed to fetch" | Update VITE_API_URL in Vercel |
| "CORS error" | Update CLIENT_URL in Render |
| "MongoDB timeout" | Add 0.0.0.0/0 to Atlas whitelist |
| "JWT error" | Set JWT_SECRET in Render |
| Slow first load | Normal on Render free tier (15min idle → sleep) |

---

## 💰 COST

**Free Tier:** $0/month (Vercel + Render Free + MongoDB M0)  
**Recommended:** $7/month (Vercel Free + Render Starter + MongoDB M0)  
**Production:** $84/month (Vercel Pro + Render Starter + MongoDB M10)

---

## 📚 FULL GUIDES

- `DEPLOYMENT_COMPLETE_GUIDE.md` - Start here
- `DEPLOYMENT_GUIDE_MONGODB_ATLAS.md` - Database setup
- `DEPLOYMENT_GUIDE_RENDER.md` - Backend deployment
- `DEPLOYMENT_GUIDE_VERCEL.md` - Frontend deployment
- `BUILD_VERIFICATION_REPORT.md` - Build verification
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist

---

## ⏱️ TIMELINE

- MongoDB Setup: 10 minutes
- Backend Deploy: 15 minutes
- Frontend Deploy: 10 minutes
- Testing: 10 minutes
- **Total: ~45 minutes**

---

## 🎯 SUCCESS CRITERIA

- [ ] Backend health endpoint returns 200
- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login
- [ ] Can access protected routes
- [ ] Emergency workflow functional
- [ ] No console errors

---

**Quick Reference v1.0** | Print or keep open during deployment | Good luck! 🚀
