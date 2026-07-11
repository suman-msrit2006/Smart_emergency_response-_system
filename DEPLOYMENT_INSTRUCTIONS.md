# 🚀 TrackER AI - Step-by-Step Deployment Instructions

Complete guide to deploying TrackER AI to production.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Custom Domain Setup](#custom-domain-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All code is committed to GitHub
- [ ] Backend runs locally without errors
- [ ] Frontend runs locally without errors
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] No sensitive data in code
- [ ] `.gitignore` includes `.env` files
- [ ] Dependencies are up to date
- [ ] No console.log statements with sensitive data

### Required Accounts

Create free accounts for:

1. **MongoDB Atlas** - https://www.mongodb.com/cloud/atlas
2. **Render** - https://render.com (for backend)
3. **Vercel** - https://vercel.com (for frontend)
4. **GitHub** - https://github.com (for code hosting)

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. **Sign up / Login**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create account or login

2. **Create Organization**
   - Click "Create an Organization"
   - Name: "TrackER AI"
   - Click "Next" → "Create Organization"

3. **Create Project**
   - Click "New Project"
   - Name: "tracker-ai-production"
   - Click "Next" → "Create Project"

4. **Create Cluster**
   - Click "Build a Database"
   - Select "FREE" (M0 Shared)
   - Provider: AWS (or your preference)
   - Region: Choose closest to your users
   - Cluster Name: "tracker-ai-cluster"
   - Click "Create"
   - Wait 3-5 minutes for cluster creation

### Step 2: Configure Database Access

1. **Create Database User**
   - Navigate to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: `tracker_admin`
   - Password: Click "Autogenerate Secure Password"
   - **IMPORTANT:** Copy and save this password securely!
   - Database User Privileges: "Atlas Admin"
   - Click "Add User"

2. **Whitelist IP Addresses**
   - Navigate to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0`
   - Comment: "All IPs (production)"
   - Click "Confirm"
   - Wait for status to become "Active"

### Step 3: Get Connection String

1. **Get Connection String**
   - Navigate to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Driver: Node.js
   - Version: 5.5 or later
   - Copy the connection string

2. **Format Connection String**
   ```
   mongodb+srv://tracker_admin:<password>@tracker-ai-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=tracker-ai-cluster
   ```

3. **Replace `<password>`** with your actual password

4. **Add Database Name** after `.mongodb.net/`:
   ```
   mongodb+srv://tracker_admin:YOUR_PASSWORD@tracker-ai-cluster.xxxxx.mongodb.net/tracker-ai?retryWrites=true&w=majority&appName=tracker-ai-cluster
   ```

5. **Save this connection string** - you'll need it for Render!

### Step 4: Database Configuration (Optional)

1. **Create Database**
   - Navigate to "Browse Collections"
   - Click "Add My Own Data"
   - Database name: `tracker-ai`
   - Collection name: `users`
   - Click "Create"

2. **Configure Backup** (Paid tiers only)
   - Navigate to "Backup"
   - Enable continuous backup
   - Set retention policy

---

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Code

1. **Verify package.json**
   ```json
   {
     "scripts": {
       "start": "node src/server.js",
       "dev": "node --watch src/server.js"
     },
     "engines": {
       "node": ">=18.0.0",
       "npm": ">=9.0.0"
     }
   }
   ```

2. **Verify .gitignore**
   ```
   node_modules
   .env
   .env.local
   .env.production
   ```

3. **Push to GitHub**
   ```bash
   cd Hackathonproject
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub
4. Authorize Render to access your repositories

### Step 3: Create Web Service

1. **Create New Web Service**
   - Dashboard → "New +" → "Web Service"
   - Connect GitHub repository
   - Select your repository
   - If not visible, click "Configure GitHub"

2. **Configure Service**
   - Name: `tracker-ai-backend`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `Hackathonproject/server`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

3. **Click "Advanced"**
   - Auto-Deploy: Yes (deploys on git push)
   - Health Check Path: `/api/health`

### Step 4: Add Environment Variables

Click "Environment" → "Add Environment Variable"

Add these variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://tracker_admin:YOUR_PASSWORD@tracker-ai-cluster.xxxxx.mongodb.net/tracker-ai?retryWrites=true&w=majority&appName=tracker-ai-cluster
JWT_SECRET=your-production-jwt-secret-min-64-characters-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

**Generate JWT_SECRET:**
```bash
# On your local machine
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Important:**
- CLIENT_URL will be your Vercel URL (we'll update this later)
- Keep JWT_SECRET secure and never share it
- MONGODB_URI should be your Atlas connection string

### Step 5: Deploy

1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. Check logs for any errors
4. Look for "Server running" message

### Step 6: Get Backend URL

Once deployed, Render provides a URL:
```
https://tracker-ai-backend.onrender.com
```

**Save this URL** - you'll need it for frontend!

### Step 7: Test Backend

```bash
# Test health endpoint
curl https://tracker-ai-backend.onrender.com/api/health

# Expected response:
{
  "status": "success",
  "message": "API is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update Environment Variables**

   Edit `Hackathonproject/client/.env`:
   ```env
   VITE_API_URL=https://tracker-ai-backend.onrender.com/api
   VITE_SOCKET_URL=https://tracker-ai-backend.onrender.com
   ```

2. **Test Build Locally**
   ```bash
   cd Hackathonproject/client
   npm run build
   ```

   Should complete without errors.

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update frontend for production"
   git push origin main
   ```

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub
4. Authorize Vercel

### Step 3: Deploy Frontend

1. **Import Project**
   - Dashboard → "Add New..." → "Project"
   - "Import Git Repository"
   - Select your repository
   - If not visible, click "Adjust GitHub App Permissions"

2. **Configure Project**
   - Project Name: `tracker-ai-frontend`
   - Framework Preset: Vite
   - Root Directory: `Hackathonproject/client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   
   Click "Environment Variables" → Add:
   
   ```
   VITE_API_URL=https://tracker-ai-backend.onrender.com/api
   VITE_SOCKET_URL=https://tracker-ai-backend.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Deployment should succeed

### Step 4: Get Frontend URL

Vercel provides a URL:
```
https://tracker-ai-frontend.vercel.app
```

### Step 5: Update Backend CORS

Now we need to update backend's CLIENT_URL:

1. **Go to Render Dashboard**
   - Select your web service
   - Go to "Environment"
   - Find `CLIENT_URL`
   - Update to: `https://tracker-ai-frontend.vercel.app`
   - Save changes

2. **Redeploy Backend**
   - Render will auto-redeploy
   - Wait 1-2 minutes

---

## ✅ Post-Deployment Verification

### Backend Health Check

```bash
curl https://tracker-ai-backend.onrender.com/api/health
```

Expected: Status 200 with health data

### Frontend Access

Visit: `https://tracker-ai-frontend.vercel.app`

Expected: Home page loads

### Complete User Flow Test

1. **Register**
   - Go to `/register`
   - Fill form: name, email, password, phone, role
   - Submit
   - Should redirect to home
   - Should be logged in

2. **Login**
   - Logout
   - Go to `/login`
   - Enter credentials
   - Submit
   - Should redirect to home
   - Should be logged in

3. **Create Emergency**
   - Go to `/emergency`
   - Click "Create Emergency"
   - Fill form
   - Submit
   - Should appear in list

4. **View Hospitals**
   - Go to `/hospital`
   - Should load hospitals
   - Try filters

5. **Record Vitals**
   - Go to `/vitals`
   - Click "Record Vitals"
   - Fill form
   - Submit
   - Should appear in history

6. **Check Real-time**
   - Open browser console (F12)
   - Look for "Socket connected"
   - Record vitals
   - Check for real-time updates

### API Endpoint Tests

```bash
# Register
curl -X POST https://tracker-ai-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "+1234567890",
    "role": "Patient"
  }'

# Login
curl -X POST https://tracker-ai-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get emergencies (with token)
curl https://tracker-ai-backend.onrender.com/api/emergencies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🌐 Custom Domain Setup (Optional)

### Backend (Render)

1. **Add Custom Domain**
   - Render Dashboard → Your service
   - "Settings" → "Custom Domain"
   - Add: `api.yourdomain.com`
   - Follow DNS instructions

2. **Update Frontend Environment**
   - Update `VITE_API_URL` to `https://api.yourdomain.com/api`
   - Redeploy frontend

### Frontend (Vercel)

1. **Add Custom Domain**
   - Vercel Dashboard → Your project
   - "Settings" → "Domains"
   - Add: `yourdomain.com` or `app.yourdomain.com`
   - Follow DNS instructions

2. **Update Backend CORS**
   - Update Render `CLIENT_URL` to `https://yourdomain.com`
   - Redeploy backend

---

## 📊 Monitoring & Maintenance

### Render Monitoring

1. **Logs**
   - Dashboard → Service → "Logs"
   - View real-time logs
   - Check for errors

2. **Metrics**
   - Dashboard → Service → "Metrics"
   - CPU usage
   - Memory usage
   - Request count
   - Response times

3. **Alerts** (Paid plans)
   - Set up email alerts
   - Monitor uptime
   - Track performance

### Vercel Monitoring

1. **Analytics**
   - Dashboard → Project → "Analytics"
   - Page views
   - Performance metrics
   - Web vitals

2. **Logs**
   - Dashboard → Project → "Deployments" → Select deployment → "Logs"

### Database Monitoring

1. **MongoDB Atlas Metrics**
   - Atlas Dashboard → Cluster → "Metrics"
   - Connections
   - Operations
   - Storage
   - Network

2. **Set Up Alerts**
   - Atlas Dashboard → "Alerts"
   - Connection count
   - Query performance
   - Disk usage

### Uptime Monitoring

Use free services:

1. **UptimeRobot** - https://uptimerobot.com
   - Monitor backend health endpoint
   - Email alerts on downtime
   - 50 monitors free

2. **Checkly** - https://www.checklyhq.com
   - API monitoring
   - Performance tracking

---

## 🔧 Maintenance Tasks

### Weekly

- [ ] Check error logs (Render + Vercel)
- [ ] Monitor database size (Atlas)
- [ ] Check API response times
- [ ] Review security alerts (GitHub)

### Monthly

- [ ] Update dependencies
  ```bash
  npm outdated
  npm update
  ```
- [ ] Review and optimize database indexes
- [ ] Check SSL certificate expiry
- [ ] Review and rotate secrets (if needed)
- [ ] Backup important data

### Quarterly

- [ ] Security audit
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] Performance optimization review
- [ ] Update documentation
- [ ] Review and update error handling

---

## 🐛 Troubleshooting

### Backend Won't Deploy

**Issue: Build fails**
```
Error: Cannot find module 'express'
```
**Solution:**
- Check `package.json` includes all dependencies
- Verify `npm install` runs without errors locally
- Check Render logs for specific error

**Issue: Server starts but crashes**
```
Error: Missing required environment variables
```
**Solution:**
- Verify all environment variables are set in Render
- Check variable names match exactly
- Restart service after updating variables

**Issue: Can't connect to MongoDB**
```
Error: MongooseServerSelectionError
```
**Solution:**
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify MONGODB_URI is correct (no spaces)
- Check database user credentials
- Ensure cluster is running

### Frontend Won't Deploy

**Issue: Build fails**
```
Error: Module not found
```
**Solution:**
- Check all imports are correct
- Verify `npm install` runs locally
- Check Vercel build logs

**Issue: Deployed but shows errors**
```
Network Error
```
**Solution:**
- Check VITE_API_URL is correct
- Verify backend is running
- Check backend CORS allows frontend domain
- Open browser console for detailed errors

### CORS Errors

**Issue: "CORS policy" error in browser**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Solution:**
- Update `CLIENT_URL` in Render to match Vercel URL exactly
- Include both `https://` and without `www`
- Redeploy backend after CORS changes
- Clear browser cache

### Socket.IO Not Connecting

**Issue: Socket not connecting**
```
Socket connection error
```
**Solution:**
- Check VITE_SOCKET_URL in Vercel
- Verify backend Socket.IO is enabled
- Check browser console for specific errors
- Verify JWT token is valid

### Database Issues

**Issue: Slow queries**
**Solution:**
- Add indexes for frequently queried fields
- Use MongoDB Atlas Performance Advisor
- Optimize queries in services

**Issue: Connection limit reached**
**Solution:**
- Check for connection leaks
- Implement connection pooling
- Upgrade Atlas tier if needed

---

## 🔄 Redeployment

### Backend (Render)

**Automatic (on git push):**
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render auto-deploys in 2-3 minutes.

**Manual:**
- Render Dashboard → Service → "Manual Deploy" → "Deploy latest commit"

### Frontend (Vercel)

**Automatic (on git push):**
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel auto-deploys in 1-2 minutes.

**Manual:**
- Vercel Dashboard → Project → "Deployments" → "Redeploy"

---

## 🔐 Security Best Practices

### Environment Variables

- ✅ Never commit `.env` files
- ✅ Use strong, unique JWT_SECRET (64+ characters)
- ✅ Rotate secrets periodically
- ✅ Use different secrets for dev/prod
- ✅ Store secrets securely (password manager)

### Database

- ✅ Use strong database passwords
- ✅ Whitelist specific IPs in production (if possible)
- ✅ Enable audit logs (paid tiers)
- ✅ Regular backups
- ✅ Monitor unusual activity

### Application

- ✅ Keep dependencies updated
- ✅ Run security audits (`npm audit`)
- ✅ Use HTTPS everywhere
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Sanitize database queries
- ✅ Log security events

---

## 📈 Scaling Considerations

### When to Scale

- Backend response times > 1 second
- Database CPU > 80%
- Memory usage > 80%
- Connection limits reached
- 429 rate limit errors increasing

### Scaling Options

**Render:**
- Upgrade to Standard instance ($7/month)
- Enable autoscaling
- Add more instances

**MongoDB Atlas:**
- Upgrade to M10+ ($0.08/hour)
- Enable sharding
- Add read replicas

**Vercel:**
- Pro plan ($20/month)
- Edge functions
- CDN optimization

---

## 📞 Support Resources

### Documentation
- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com

### Community
- **Render Community:** https://community.render.com
- **Vercel Community:** https://github.com/vercel/vercel/discussions
- **MongoDB Community:** https://www.mongodb.com/community/forums

### Status Pages
- **Render Status:** https://status.render.com
- **Vercel Status:** https://www.vercel-status.com
- **MongoDB Atlas Status:** https://status.cloud.mongodb.com

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code committed to GitHub
- [ ] Tests passing locally
- [ ] Environment variables documented
- [ ] No sensitive data in code
- [ ] Dependencies updated

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string obtained

### Backend
- [ ] Render account created
- [ ] Web service configured
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health check passing
- [ ] Logs checked

### Frontend
- [ ] Vercel account created
- [ ] Project imported
- [ ] Environment variables set
- [ ] Build successful
- [ ] Site accessible
- [ ] Console checked for errors

### Integration
- [ ] Backend URL updated in frontend
- [ ] Frontend URL updated in backend CORS
- [ ] Can register new user
- [ ] Can login
- [ ] All pages work
- [ ] Real-time features work
- [ ] API endpoints tested

### Post-Deployment
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Backup strategy in place
- [ ] Documentation updated

---

## 🎉 Deployment Complete!

Your TrackER AI platform is now live in production!

**Backend:** https://tracker-ai-backend.onrender.com
**Frontend:** https://tracker-ai-frontend.vercel.app
**Database:** MongoDB Atlas

**Next Steps:**
1. Share with users
2. Monitor performance
3. Collect feedback
4. Iterate and improve

---

**Congratulations on your successful deployment!** 🚀

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready
