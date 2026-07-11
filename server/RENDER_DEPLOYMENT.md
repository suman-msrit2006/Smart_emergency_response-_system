# Render Deployment Guide

Complete guide to deploy TrackER AI Backend API to Render.

---

## Prerequisites

- GitHub account
- Render account (free tier available)
- MongoDB Atlas account (free tier available)
- Code pushed to GitHub repository

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Start Free"
3. Create account or sign in
4. Create a new organization (if needed)

### 1.2 Create Database Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select cloud provider: **AWS**
4. Select region: Choose closest to your users (e.g., us-east-1)
5. Cluster Name: `tracker-ai-cluster`
6. Click "Create"

### 1.3 Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `tracker-ai-admin`
5. Password: Generate secure password (save it!)
6. Database User Privileges: **Atlas admin**
7. Click "Add User"

### 1.4 Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Note: For production, restrict to Render's IP ranges
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy connection string
7. Replace `<password>` with your database user password
8. Replace `myFirstDatabase` with `tracker-ai`

**Example Connection String:**
```
mongodb+srv://tracker-ai-admin:YOUR_PASSWORD@tracker-ai-cluster.xxxxx.mongodb.net/tracker-ai?retryWrites=true&w=majority
```

---

## Step 2: Prepare GitHub Repository

### 2.1 Ensure All Files Are Committed
```bash
cd Hackathonproject/server
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2.2 Verify File Structure
Ensure your repository has:
```
server/
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   └── utils/
├── package.json
├── .gitignore
└── .env.example
```

### 2.3 Update .gitignore
Ensure `.env` is in `.gitignore`:
```
node_modules/
.env
.env.local
.env.production
*.log
.DS_Store
```

---

## Step 3: Deploy to Render

### 3.1 Create Render Account
1. Go to [Render](https://render.com)
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render to access your repositories

### 3.2 Create New Web Service
1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub repository
4. Select your repository from the list

### 3.3 Configure Web Service

#### Basic Settings
- **Name:** `tracker-ai-backend`
- **Region:** Same as MongoDB Atlas (e.g., Oregon - US West)
- **Branch:** `main`
- **Root Directory:** `Hackathonproject/server` (or leave blank if server is at root)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### Instance Type
- **Free** (for development/testing)
- **Starter** or higher (for production)

### 3.4 Add Environment Variables
Click "Advanced" and add these environment variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | Server port (Render will override) |
| `MONGODB_URI` | Your MongoDB Atlas connection string | Database connection |
| `JWT_SECRET` | Generate 32+ character random string | JWT signing key |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `CLIENT_URL` | Your frontend URL | CORS allowed origin |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Logging level |

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.5 Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your application
   - Start the server
3. Wait for deployment to complete (5-10 minutes)

---

## Step 4: Verify Deployment

### 4.1 Check Deployment Status
1. Go to your service dashboard
2. Check "Events" tab for deployment logs
3. Wait for "Deploy succeeded" message

### 4.2 Test API
```bash
# Health check
curl https://tracker-ai-backend.onrender.com/

# API health
curl https://tracker-ai-backend.onrender.com/api/health

# Expected response:
{
  "status": "success",
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### 4.3 Test Authentication
```bash
# Register user
curl -X POST https://tracker-ai-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "+1234567890",
    "role": "Patient"
  }'
```

---

## Step 5: Configure Custom Domain (Optional)

### 5.1 Add Custom Domain in Render
1. Go to your service dashboard
2. Click "Settings"
3. Scroll to "Custom Domain"
4. Click "Add Custom Domain"
5. Enter your domain (e.g., `api.yourdomain.com`)

### 5.2 Update DNS Records
Add CNAME record in your DNS provider:
- **Type:** CNAME
- **Name:** api (or your subdomain)
- **Value:** Your Render URL (e.g., `tracker-ai-backend.onrender.com`)
- **TTL:** 3600

### 5.3 Update Environment Variables
Update `CLIENT_URL` to use your custom domain:
```
CLIENT_URL=https://yourdomain.com
```

---

## Step 6: Enable Auto-Deploy

### 6.1 Configure Auto-Deploy
1. Go to your service dashboard
2. Click "Settings"
3. Scroll to "Build & Deploy"
4. Enable "Auto-Deploy"
5. Select branch: `main`

Now every push to `main` branch will trigger automatic deployment!

---

## Step 7: Monitor Your Application

### 7.1 View Logs
1. Go to your service dashboard
2. Click "Logs" tab
3. Monitor real-time logs

### 7.2 Set Up Alerts
1. Go to "Settings"
2. Scroll to "Notifications"
3. Add email or Slack webhook
4. Select events: Deploy Failed, Service Unhealthy

### 7.3 Monitor Performance
1. Go to "Metrics" tab
2. View:
   - CPU usage
   - Memory usage
   - Request latency
   - Error rates

---

## Troubleshooting

### Deployment Failed

**Issue: Build failed**
```
Error: Cannot find module 'xyz'
```
**Solution:**
- Check `package.json` has all dependencies
- Run `npm install` locally to verify
- Push updated `package.json`

**Issue: Environment variable not found**
```
Error: Missing required environment variables: MONGODB_URI
```
**Solution:**
- Check environment variables in Render dashboard
- Ensure no typos
- Redeploy after adding variables

### Database Connection Failed

**Issue: Can't connect to MongoDB**
```
Error: MongooseServerSelectionError
```
**Solution:**
- Verify MongoDB connection string
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Ensure database user has correct permissions
- Check MongoDB cluster is running

### CORS Errors

**Issue: CORS policy blocked**
```
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution:**
- Update `CLIENT_URL` environment variable
- Add frontend URL to allowed origins
- Redeploy service

### Port Already in Use

**Issue: Port binding failed**
```
Error: Port 5000 is already in use
```
**Solution:**
- Render automatically assigns port via `process.env.PORT`
- Ensure your code uses `process.env.PORT || 5000`
- Check `src/config/env.js` uses correct port

### High Memory Usage

**Issue: Service keeps restarting**
```
Error: Process killed due to memory limit
```
**Solution:**
- Upgrade to paid tier with more memory
- Optimize database queries
- Add pagination to large responses
- Implement caching

---

## Render Free Tier Limitations

- **Automatic spin-down:** Service sleeps after 15 minutes of inactivity
- **Cold starts:** First request after sleep takes 30-60 seconds
- **Bandwidth:** 100 GB/month
- **Build minutes:** 400 minutes/month
- **Storage:** Ephemeral (resets on deploy)

**For production, consider:**
- **Starter tier:** $7/month - No spin-down
- **Standard tier:** $25/month - More resources
- **Pro tier:** $85/month - Autoscaling

---

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with secure password
- [ ] Network access configured
- [ ] GitHub repository updated
- [ ] Render web service created
- [ ] All environment variables set
- [ ] Deployment succeeded
- [ ] Health check endpoint working
- [ ] Authentication endpoint working
- [ ] Custom domain configured (optional)
- [ ] Auto-deploy enabled
- [ ] Monitoring set up
- [ ] Alerts configured

---

## Useful Commands

### View Render Logs
```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# View logs
render logs -f
```

### Update Environment Variables
```bash
render env set NODE_ENV=production
render env set JWT_SECRET=new-secret-key
```

### Manual Deploy
```bash
render deploy
```

---

## Security Best Practices

1. **Use Strong Secrets**
   - Generate cryptographically secure JWT_SECRET
   - Use different secrets for each environment

2. **Restrict CORS**
   - Only allow your frontend domain
   - Don't use wildcards in production

3. **Enable HTTPS**
   - Render provides free SSL/TLS
   - Redirect HTTP to HTTPS

4. **Monitor Logs**
   - Check for suspicious activity
   - Set up alerts for errors

5. **Rate Limiting**
   - Keep rate limits enabled
   - Adjust based on usage patterns

6. **Database Security**
   - Use strong database password
   - Restrict IP access in production
   - Enable audit logs in MongoDB Atlas

---

## Support

- **Render Docs:** https://render.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Render Community:** https://community.render.com
- **MongoDB Community:** https://community.mongodb.com

---

## Next Steps

After deployment:
1. Deploy frontend to Vercel/Netlify
2. Update frontend API URL
3. Test complete application flow
4. Set up monitoring and analytics
5. Configure CI/CD pipeline
6. Plan for scaling

---

**Deployment Complete! 🎉**

Your TrackER AI Backend is now live in production!
