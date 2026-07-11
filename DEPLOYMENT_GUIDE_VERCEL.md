# Frontend Deployment Guide - Vercel

**Platform:** Vercel  
**Application:** TrackER AI Frontend (React + Vite)  
**Estimated Time:** 10-15 minutes

---

## 📋 PREREQUISITES

- [ ] Vercel account created (https://vercel.com/signup)
- [ ] Git repository with your code
- [ ] Backend deployed and URL available
- [ ] MongoDB Atlas configured

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Prepare Your Repository

1. **Ensure your code is pushed to GitHub/GitLab/Bitbucket:**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Verify client directory structure:**
   ```
   client/
   ├── dist/           (generated after build)
   ├── node_modules/
   ├── public/
   ├── src/
   ├── .env
   ├── .env.example
   ├── .gitignore
   ├── index.html
   ├── package.json
   └── vite.config.js
   ```

---

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository:**
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Vercel to access your repositories
   - Select the "Hackathonproject" repository

3. **Configure Import Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `client` ← **IMPORTANT!**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

---

### Step 3: Configure Environment Variables

1. **In Project Settings, add these Environment Variables:**

   ```
   VITE_API_URL=https://your-backend-api.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-api.onrender.com
   ```

   **How to add:**
   - Click "Environment Variables" tab
   - Add each variable:
     - Name: `VITE_API_URL`
     - Value: Your backend URL + `/api`
     - Environments: Production, Preview, Development

2. **IMPORTANT:** Replace `your-backend-api.onrender.com` with your actual Render backend URL

---

### Step 4: Deploy

1. **Click "Deploy" button**
   - Vercel will automatically:
     - Install dependencies (`npm install`)
     - Build your project (`npm run build`)
     - Deploy the `dist` folder

2. **Wait for deployment to complete** (usually 1-3 minutes)

3. **Deployment Status:**
   ```
   ✓ Building
   ✓ Completed in 30s
   
   Your project is live at:
   https://your-project-name.vercel.app
   ```

---

### Step 5: Configure Custom Domain (Optional)

1. **Go to Project Settings → Domains**

2. **Add Custom Domain:**
   - Enter your domain (e.g., `tracker-ai.com`)
   - Follow DNS configuration instructions
   - Wait for DNS propagation (5-60 minutes)

3. **Configure DNS Records:**
   - **Type:** A Record
   - **Name:** @ (or your subdomain)
   - **Value:** 76.76.21.21 (Vercel's IP)
   
   Or use CNAME:
   - **Type:** CNAME
   - **Name:** www (or your subdomain)
   - **Value:** cname.vercel-dns.com

---

### Step 6: Verify Deployment

1. **Visit your deployed URL:**
   - https://your-project-name.vercel.app

2. **Check these items:**
   - [ ] Application loads without errors
   - [ ] Login page accessible
   - [ ] Register page accessible
   - [ ] API calls to backend work
   - [ ] No console errors in browser DevTools

3. **Test Critical Functionality:**
   - [ ] User registration
   - [ ] User login
   - [ ] Navigation between pages
   - [ ] Emergency workflow
   - [ ] Real-time features (if backend deployed)

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### Update Backend CORS

After deployment, update your backend's CLIENT_URL:

1. **In Render Dashboard (Backend):**
   - Go to your backend service
   - Environment Variables
   - Update `CLIENT_URL`:
     ```
     CLIENT_URL=https://your-project-name.vercel.app
     ```
   - Save and redeploy backend

---

## 🔍 TROUBLESHOOTING

### Issue: "Failed to fetch" errors

**Cause:** Backend URL not configured or CORS issue

**Solution:**
1. Check `VITE_API_URL` environment variable is set correctly
2. Verify backend is running
3. Check backend CORS allows your Vercel URL

---

### Issue: White screen after deployment

**Cause:** Build errors or routing issues

**Solution:**
1. Check Vercel build logs for errors
2. Verify all dependencies are in `package.json`
3. Check for missing environment variables
4. Verify `vite.config.js` is correct

---

### Issue: WebSocket connection failed

**Cause:** SOCKET_URL not configured correctly

**Solution:**
1. Verify `VITE_SOCKET_URL` points to backend URL (without /api)
2. Check backend Socket.IO CORS configuration
3. Ensure backend allows WebSocket connections

---

### Issue: API calls return 404

**Cause:** API URL misconfigured

**Solution:**
1. Verify `VITE_API_URL` includes `/api` at the end
2. Check backend is deployed and accessible
3. Test backend health endpoint directly

---

## 📊 MONITORING & LOGS

### View Deployment Logs

1. **Go to Vercel Dashboard**
2. **Click on your project**
3. **Select "Deployments" tab**
4. **Click on latest deployment**
5. **View "Building" and "Function" logs**

### Real-time Logs

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **View logs:**
   ```bash
   vercel logs
   ```

---

## 🔄 CONTINUOUS DEPLOYMENT

### Automatic Deployments

Vercel automatically deploys when you push to your repository:

1. **Production Deployments:**
   - Triggered by: Push to `main` branch
   - URL: your-project-name.vercel.app

2. **Preview Deployments:**
   - Triggered by: Pull requests
   - URL: unique preview URL for each PR

### Manual Deployments

Using Vercel CLI:
```bash
cd client
vercel --prod
```

---

## 🎛️ ADVANCED CONFIGURATION

### Vercel.json Configuration (Optional)

Create `client/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Performance Optimizations

1. **Enable Vercel Analytics:**
   - Go to Project Settings
   - Analytics tab
   - Enable Web Analytics

2. **Enable Speed Insights:**
   - Install package: `npm install @vercel/speed-insights`
   - Add to your app

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Repository pushed to Git
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Root directory set to `client`
- [ ] Environment variables configured:
  - [ ] VITE_API_URL
  - [ ] VITE_SOCKET_URL
- [ ] Build successful
- [ ] Deployment live
- [ ] Application tested and working
- [ ] Backend CORS updated with Vercel URL
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring enabled

---

## 📞 SUPPORT

**Vercel Documentation:**
- https://vercel.com/docs

**Vercel Support:**
- https://vercel.com/support

**Vite Documentation:**
- https://vitejs.dev/guide/

**Project Repository:**
- Your GitHub/GitLab repository

---

## 🎉 SUCCESS!

Your TrackER AI frontend is now deployed on Vercel!

**Next Steps:**
1. ✅ Frontend deployed
2. → Deploy backend to Render
3. → Test full application integration
4. → Monitor performance
5. → Share your live URL!

**Your Live URL:** https://your-project-name.vercel.app

---

**Deployment Guide Version:** 1.0  
**Last Updated:** Production Deployment  
**Platform:** Vercel  
**Status:** ✅ Ready
