# TrackER AI Backend - Deployment Guide

## 🚀 Deployment Options

This guide covers deployment to popular hosting platforms.

---

## 1. Railway Deployment (Recommended)

### Why Railway?
- Free tier available
- Automatic deployments from Git
- Built-in MongoDB support
- Easy environment variables management
- Free SSL certificates

### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the `Hackathonproject/server` directory

3. **Add MongoDB**
   - Click "New"
   - Select "Database" → "MongoDB"
   - Railway will provision a MongoDB instance

4. **Set Environment Variables**
   - Go to your backend service
   - Click "Variables"
   - Add:
     ```
     NODE_ENV=production
     PORT=5000
     MONGODB_URI=${{MongoDB.DATABASE_URL}}
     JWT_SECRET=your-generated-secret
     JWT_EXPIRES_IN=7d
     CLIENT_URL=https://your-frontend-url.com
     ```

5. **Deploy**
   - Railway automatically deploys
   - Get your URL: `https://your-app.railway.app`

6. **Configure Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain

---

## 2. Render Deployment

### Steps:

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up

2. **Create Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your repository

3. **Configure Service**
   ```
   Name: tracker-ai-backend
   Region: Choose closest to users
   Branch: main
   Root Directory: Hackathonproject/server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secret
   CLIENT_URL=https://your-frontend.com
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render builds and deploys

---

## 3. Heroku Deployment

### Steps:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd Hackathonproject/server
   heroku create tracker-ai-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-secret
   heroku config:set CLIENT_URL=https://your-frontend.com
   ```

5. **Create Procfile**
   ```bash
   echo "web: npm start" > Procfile
   ```

6. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

7. **Open App**
   ```bash
   heroku open
   ```

---

## 4. AWS EC2 Deployment

### Steps:

1. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Configure security group (ports 22, 80, 443, 5000)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone Repository**
   ```bash
   git clone your-repository-url
   cd Hackathonproject/server
   ```

6. **Install Dependencies**
   ```bash
   npm install
   ```

7. **Create .env File**
   ```bash
   nano .env
   ```
   Add your environment variables

8. **Start with PM2**
   ```bash
   pm2 start src/server.js --name tracker-ai
   pm2 startup
   pm2 save
   ```

9. **Configure Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/tracker-ai
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Enable Site**
    ```bash
    sudo ln -s /etc/nginx/sites-available/tracker-ai /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

## 5. DigitalOcean App Platform

### Steps:

1. **Create DigitalOcean Account**
   - Go to [digitalocean.com](https://digitalocean.com)

2. **Create New App**
   - Click "Create" → "Apps"
   - Connect GitHub repository
   - Select `Hackathonproject/server`

3. **Configure App**
   ```
   Type: Web Service
   Build Command: npm install
   Run Command: npm start
   HTTP Port: 5000
   ```

4. **Add Environment Variables**
   - Add all required env vars

5. **Deploy**
   - Review and create
   - DigitalOcean handles deployment

---

## 🔒 Production Environment Variables

Required environment variables for production:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tracker-ai

# JWT
JWT_SECRET=very-strong-secret-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generate Strong JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📊 MongoDB Atlas Setup for Production

1. **Create Cluster**
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Create M0 (free) or paid cluster

2. **Configure Network Access**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
   - Or add your server's specific IP

3. **Create Database User**
   - Username: `tracker_admin`
   - Password: Strong auto-generated password
   - Roles: Atlas Admin

4. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with actual password

---

## 🔍 Health Check Endpoints

After deployment, test these endpoints:

```bash
# Health check
curl https://your-api.com/api/health

# Expected response:
{
  "status": "success",
  "message": "TrackER AI API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 📝 Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection successful
- [ ] Health check endpoint working
- [ ] CORS configured for frontend
- [ ] SSL certificate installed
- [ ] Custom domain configured (if applicable)
- [ ] Rate limiting active
- [ ] Error logging working
- [ ] JWT authentication working
- [ ] All API endpoints tested
- [ ] Frontend connected successfully
- [ ] Documentation updated with new URLs

---

## 🔧 Monitoring & Maintenance

### Logging
Monitor application logs:

**Railway:**
```bash
# View logs in Railway dashboard
```

**Heroku:**
```bash
heroku logs --tail
```

**AWS EC2:**
```bash
pm2 logs tracker-ai
```

### Restart Server

**Railway/Render:**
- Redeploy from dashboard

**Heroku:**
```bash
heroku restart
```

**AWS EC2:**
```bash
pm2 restart tracker-ai
```

---

## 🚨 Troubleshooting

### MongoDB Connection Failed
- Check connection string format
- Verify IP whitelist in Atlas
- Check database user credentials
- Ensure network access configured

### CORS Errors
- Verify CLIENT_URL in environment variables
- Check CORS configuration in `src/middleware/security.js`
- Ensure frontend URL is correct

### 502 Bad Gateway
- Check if application is running
- Verify PORT configuration
- Check logs for errors

### Authentication Not Working
- Verify JWT_SECRET is set
- Check token format in requests
- Ensure token hasn't expired

---

## 📊 Performance Optimization

### For Production:

1. **Enable Compression**
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Use Connection Pooling**
   Already configured in MongoDB connection

3. **Enable Caching**
   Consider Redis for session/cache management

4. **Use CDN**
   For static assets (if any)

5. **Monitor Performance**
   - Use New Relic, DataDog, or similar
   - Monitor MongoDB Atlas metrics
   - Set up alerts

---

## 🔐 Security Hardening

1. **Use Environment Variables**
   - Never commit secrets to Git
   - Use platform-specific secret management

2. **Update Dependencies**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Enable HTTPS**
   - Most platforms provide free SSL
   - Configure SSL certificates

4. **Rate Limiting**
   - Already configured
   - Adjust limits based on traffic

5. **Helmet Security Headers**
   - Already configured
   - Review CSP policies if needed

---

## 📞 Support

For deployment issues:
- Check platform documentation
- Review application logs
- Test locally first
- Verify environment variables
- Check database connectivity

---

## 🎉 Deployment Complete!

Once deployed, your API will be available at:
```
https://your-domain.com/api
```

Test with:
```bash
curl https://your-domain.com/api/health
```

Update your frontend to use the new API URL!

---

**Happy Deploying! 🚀**
