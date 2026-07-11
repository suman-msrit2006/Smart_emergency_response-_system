# Backend Deployment Guide - Render

**Platform:** Render  
**Application:** TrackER AI Backend (Node.js + Express + MongoDB)  
**Estimated Time:** 15-20 minutes

---

## 📋 PREREQUISITES

- [ ] Render account created (https://render.com/register)
- [ ] Git repository with your code
- [ ] MongoDB Atlas database configured
- [ ] JWT secret generated

---

## 🔐 PREPARE SECRETS

### 1. Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** - you'll need it for environment variables.

Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Prepare Your Repository

1. **Ensure your code is pushed to GitHub/GitLab:**
   ```bash
   git add .
   git commit -m "Prepare backend for production deployment"
   git push origin main
   ```

2. **Verify server directory structure:**
   ```
   server/
   ├── node_modules/
   ├── src/
   │   ├── config/
   │   ├── controllers/
   │   ├── middleware/
   │   ├── models/
   │   ├── routes/
   │   ├── services/
   │   ├── socket/
   │   ├── utils/
   │   ├── validations/
   │   ├── app.js
   │   └── server.js
   ├── .env
   ├── .env.example
   ├── .gitignore
   └── package.json
   ```

---

### Step 2: Create Web Service on Render

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/
   - Click "New +" → "Web Service"

2. **Connect Git Repository:**
   - Select "Connect a repository"
   - Choose GitHub or GitLab
   - Authorize Render to access repositories
   - Select "Hackathonproject" repository

3. **Configure Service Settings:**

   **Basic Settings:**
   - **Name:** `tracker-ai-backend` (or your preferred name)
   - **Region:** Choose closest to your users (e.g., Oregon (US West))
   - **Branch:** `main`
   - **Root Directory:** `server` ← **IMPORTANT!**
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`

   **Instance Type:**
   - **Free:** For testing ($0/month)
   - **Starter:** For production ($7/month, recommended)
   - **Standard:** For high traffic ($25/month)

---

### Step 3: Configure Environment Variables

Click "Advanced" → "Environment Variables" and add:

```
NODE_ENV=production

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trackerai?retryWrites=true&w=majority

JWT_SECRET=your_generated_secret_from_step1

JWT_EXPIRES_IN=7d

CLIENT_URL=https://your-frontend.vercel.app

PORT=5000

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100
```

**IMPORTANT NOTES:**
- Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
- Replace `JWT_SECRET` with the secret you generated
- Replace `CLIENT_URL` with your Vercel frontend URL (update after frontend is deployed)
- Don't include quotes around values

---

### Step 4: Deploy

1. **Click "Create Web Service"**
   - Render will automatically:
     - Clone your repository
     - Install dependencies
     - Start your server

2. **Wait for deployment** (usually 2-5 minutes)

3. **Monitor Deployment Logs:**
   ```
   ==> Cloning from https://github.com/...
   ==> Checking out commit...
   ==> Running 'npm install'
   ==> Starting service with 'node src/server.js'
   ✅ [SUCCESS] MongoDB Connected
   ✅ [SUCCESS] Server running in production mode on port 5000
   ```

4. **Deployment Complete:**
   ```
   Your service is live at:
   https://tracker-ai-backend.onrender.com
   ```

---

### Step 5: Verify Deployment

1. **Test Health Endpoint:**
   
   Open in browser or use curl:
   ```bash
   curl https://your-service-name.onrender.com/api/health
   ```

   **Expected Response:**
   ```json
   {
     "status": "success",
     "message": "API is healthy",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 123.456,
     "environment": "production"
   }
   ```

2. **Test Root Endpoint:**
   ```bash
   curl https://your-service-name.onrender.com/
   ```

   **Expected Response:**
   ```json
   {
     "status": "success",
     "message": "Welcome to TrackER AI API",
     "version": "1.0.0",
     "environment": "production",
     "documentation": "/api/health"
   }
   ```

3. **Check Logs:**
   - Go to Render Dashboard
   - Click on your service
   - View "Logs" tab
   - Verify no errors

---

### Step 6: Configure MongoDB Atlas IP Whitelist

1. **Go to MongoDB Atlas Dashboard:**
   - https://cloud.mongodb.com/

2. **Navigate to Network Access:**
   - Click "Network Access" in sidebar
   - Click "Add IP Address"

3. **Allow Render's IPs:**
   - **Option 1 (Recommended for cloud):** Click "Allow Access from Anywhere"
     - IP: `0.0.0.0/0`
     - Note: Render uses dynamic IPs
   
   - **Option 2 (More secure):** Add Render's IP ranges
     - Get IPs from: https://render.com/docs/static-outbound-ip-addresses
     - Add each IP individually

4. **Save and wait** for changes to propagate (1-2 minutes)

---

### Step 7: Update Frontend with Backend URL

Now that your backend is deployed, update your frontend environment variables:

1. **Go to Vercel Dashboard**
2. **Select your frontend project**
3. **Settings → Environment Variables**
4. **Update these variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
5. **Save and trigger redeployment**

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### Configure Custom Domain (Optional)

1. **In Render Dashboard:**
   - Go to your service
   - Click "Settings"
   - Scroll to "Custom Domains"

2. **Add Custom Domain:**
   - Click "Add Custom Domain"
   - Enter: `api.your-domain.com`

3. **Configure DNS:**
   - **Type:** CNAME
   - **Name:** api
   - **Value:** your-service-name.onrender.com
   - **TTL:** 3600

4. **Enable HTTPS:**
   - Render automatically provisions SSL certificate
   - Wait 5-10 minutes for certificate

---

### Enable Persistent Disk (Optional)

For file uploads or caching:

1. **Go to Service Settings**
2. **Scroll to "Disk"**
3. **Click "Add Disk"**
4. **Configure:**
   - **Name:** `data`
   - **Mount Path:** `/data`
   - **Size:** 1 GB (Free tier)

---

### Configure Background Worker (Optional)

For scheduled tasks:

1. **Create new Background Worker**
2. **Same repository and root directory**
3. **Start Command:** `node src/workers/scheduler.js`

---

## 🔍 TROUBLESHOOTING

### Issue: Service fails to start

**Symptoms:**
- "Service exited with error"
- Port binding errors

**Solutions:**
1. Check environment variables are set correctly
2. Verify `PORT` environment variable is set
3. Check logs for specific error messages
4. Ensure MongoDB connection string is valid

---

### Issue: MongoDB connection timeout

**Symptoms:**
- "MongoServerSelectionError"
- Connection timeout errors

**Solutions:**
1. Verify MongoDB Atlas is running
2. Check IP whitelist allows `0.0.0.0/0`
3. Verify MongoDB URI is correct
4. Check MongoDB Atlas cluster status

---

### Issue: CORS errors from frontend

**Symptoms:**
- "Access-Control-Allow-Origin" errors
- API calls failing with CORS errors

**Solutions:**
1. Verify `CLIENT_URL` environment variable matches frontend URL
2. Check CORS middleware configuration
3. Ensure credentials are enabled
4. Try with exact URL (no trailing slash)

---

### Issue: JWT authentication fails

**Symptoms:**
- Login returns errors
- "Invalid token" errors

**Solutions:**
1. Verify `JWT_SECRET` is set
2. Check `JWT_SECRET` is the same across all instances
3. Ensure JWT_EXPIRES_IN is valid format
4. Verify bcrypt is working correctly

---

### Issue: Free tier sleeps

**Symptoms:**
- First request after 15 min takes 30+ seconds
- Service spins down when idle

**Solutions:**
1. Upgrade to Starter plan ($7/month) for always-on service
2. Use external ping service (UptimeRobot, Better Uptime)
3. Configure health check endpoint for regular pings

---

## 📊 MONITORING & LOGS

### View Logs

1. **Real-time Logs:**
   - Render Dashboard → Your Service → Logs tab
   - See all console output in real-time

2. **Download Logs:**
   - Click "Download Logs" button
   - Get last 10,000 lines

### Monitor Service Health

1. **Metrics Dashboard:**
   - Go to service page
   - View CPU, Memory, Network usage
   - Track request rate and response times

2. **Set Up Alerts:**
   - Settings → Notifications
   - Add email for deploy notifications
   - Add webhook for external alerting

---

## 🔄 CONTINUOUS DEPLOYMENT

### Automatic Deployments

Render automatically deploys when you push to your repository:

1. **Auto-Deploy Enabled (default):**
   - Push to `main` branch
   - Render automatically redeploys

2. **Manual Deploy:**
   - Dashboard → Manual Deploy button
   - Deploy specific branch or commit

### Deploy Hooks

Create webhook for external triggers:

1. **Settings → Deploy Hook**
2. **Copy webhook URL**
3. **Trigger deployment:**
   ```bash
   curl -X POST https://api.render.com/deploy/srv-xxxxx
   ```

---

## 🎛️ ADVANCED CONFIGURATION

### Health Check Configuration

Render.yaml file (optional):

Create `server/render.yaml`:

```yaml
services:
  - type: web
    name: tracker-ai-backend
    env: node
    region: oregon
    plan: starter
    buildCommand: npm install
    startCommand: node src/server.js
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
```

### Auto-Scaling (Paid plans)

1. **Settings → Scaling**
2. **Configure:**
   - Min instances: 1
   - Max instances: 5
   - CPU threshold: 70%

---

## 🔒 SECURITY BEST PRACTICES

### Secrets Management

✅ **DO:**
- Store all secrets in environment variables
- Use strong JWT secrets (32+ characters)
- Rotate secrets regularly
- Use MongoDB Atlas user with least privileges

❌ **DON'T:**
- Commit secrets to Git
- Use weak or default passwords
- Share secrets in plain text
- Reuse secrets across environments

### HTTPS Configuration

✅ Render provides automatic HTTPS:
- Free SSL certificate
- Auto-renewal
- HTTP → HTTPS redirect (automatic)

---

## 💰 PRICING

**Free Tier:**
- $0/month
- 750 hours/month
- Sleeps after 15 min inactivity
- Shared CPU/Memory
- ✅ Good for: Testing, demos

**Starter Tier (Recommended):**
- $7/month
- Always on
- Dedicated CPU/Memory
- Faster builds
- ✅ Good for: Production, small apps

**Standard Tier:**
- $25/month
- More resources
- Auto-scaling available
- ✅ Good for: High traffic, multiple users

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Render account created
- [ ] Repository connected
- [ ] Root directory set to `server`
- [ ] Environment variables configured:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] CLIENT_URL
  - [ ] PORT=5000
- [ ] MongoDB Atlas IP whitelist configured (0.0.0.0/0)
- [ ] Service deployed successfully
- [ ] Health endpoint responding
- [ ] Database connection working
- [ ] Frontend CORS working
- [ ] Logs showing no errors
- [ ] Frontend environment variables updated with backend URL

---

## 📞 SUPPORT

**Render Documentation:**
- https://render.com/docs

**Render Support:**
- support@render.com
- Community: https://community.render.com

**MongoDB Atlas Support:**
- https://docs.atlas.mongodb.com/
- support.mongodb.com

---

## 🎉 SUCCESS!

Your TrackER AI backend is now deployed on Render!

**Next Steps:**
1. ✅ Backend deployed
2. → Update frontend with backend URL
3. → Test full application integration
4. → Monitor performance
5. → Set up error tracking (Sentry)

**Your Live Backend URL:** https://your-service-name.onrender.com

**API Health Check:** https://your-service-name.onrender.com/api/health

---

**Deployment Guide Version:** 1.0  
**Last Updated:** Production Deployment  
**Platform:** Render  
**Status:** ✅ Ready
