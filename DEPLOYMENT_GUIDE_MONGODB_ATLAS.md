# MongoDB Atlas Setup Guide

**Platform:** MongoDB Atlas (Cloud Database)  
**Application:** TrackER AI Database  
**Estimated Time:** 10-15 minutes

---

## 📋 PREREQUISITES

- [ ] Email address for MongoDB account
- [ ] Credit card (optional, free tier available)

---

## 🚀 SETUP STEPS

### Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas:**
   - Visit: https://www.mongodb.com/cloud/atlas/register

2. **Sign Up:**
   - Use Google/GitHub account OR
   - Register with email
   - Verify your email address

3. **Complete Profile:**
   - Answer setup questions (optional)
   - Skip credit card for free tier

---

### Step 2: Create a New Cluster

1. **Click "Build a Database"**

2. **Choose Deployment Option:**
   - Select **"Shared"** (Free tier - M0)
   - Click **"Create"**

3. **Configure Cluster:**

   **Cloud Provider & Region:**
   - **Provider:** AWS (recommended)
   - **Region:** Choose closest to your users
     - US East (N. Virginia) - `us-east-1`
     - Europe (Ireland) - `eu-west-1`
     - Asia Pacific (Singapore) - `ap-southeast-1`

   **Cluster Tier:**
   - **M0 Sandbox:** FREE
     - 512 MB storage
     - Shared RAM
     - Good for development and small apps

   **Cluster Name:**
   - Name: `Cluster0` (default) or `TrackerAI-Production`

4. **Click "Create Cluster"** (takes 3-5 minutes)

---

### Step 3: Create Database User

1. **Security Quick Start appears:**

2. **Create Database User:**
   - **Authentication Method:** Password
   - **Username:** `trackerAdmin` (or your choice)
   - **Password:** Click "Autogenerate Secure Password" OR create strong password
   - **⚠️ IMPORTANT:** Copy and save the password securely!

3. **User Privileges:**
   - Select: **"Read and write to any database"**

4. **Click "Create User"**

---

### Step 4: Configure Network Access

1. **Add IP Address:**
   - **Option 1 - Allow from Anywhere (Recommended for Cloud):**
     - Click "Add My Current IP Address"
     - Then click "Allow Access from Anywhere"
     - IP Address: `0.0.0.0/0`
     - Description: `Allow all IPs for cloud hosting`
     - ⚠️ **Note:** This is safe because you still need username/password

   - **Option 2 - Specific IPs:**
     - Add your Render backend IPs
     - Add your local development IP
     - Get Render IPs from: https://render.com/docs/static-outbound-ip-addresses

2. **Click "Add Entry"**

3. **Click "Finish and Close"**

---

### Step 5: Get Connection String

1. **Click "Connect" on your cluster**

2. **Choose Connection Method:**
   - Select **"Connect your application"**

3. **Select Driver:**
   - **Driver:** Node.js
   - **Version:** 5.5 or later

4. **Copy Connection String:**
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Replace Placeholders:**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - **Do NOT** include the `<>` brackets

   **Example:**
   ```
   mongodb+srv://trackerAdmin:MySecureP@ssw0rd@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Add Database Name:**
   - Add `/trackerai` before the `?`
   - Final connection string:
   ```
   mongodb+srv://trackerAdmin:MySecureP@ssw0rd@cluster0.xxxxx.mongodb.net/trackerai?retryWrites=true&w=majority
   ```

---

### Step 6: Test Connection

**Option 1: Using MongoDB Compass (GUI)**

1. **Download MongoDB Compass:**
   - https://www.mongodb.com/try/download/compass

2. **Open Compass and paste connection string**

3. **Click "Connect"**

4. **Verify:** You should see the database and collections

**Option 2: Using Node.js**

1. **Create test file `test-connection.js`:**
   ```javascript
   const mongoose = require('mongoose');
   
   const MONGODB_URI = 'your_connection_string_here';
   
   mongoose.connect(MONGODB_URI)
     .then(() => {
       console.log('✅ MongoDB Connected Successfully!');
       process.exit(0);
     })
     .catch((err) => {
       console.error('❌ MongoDB Connection Failed:', err.message);
       process.exit(1);
     });
   ```

2. **Run test:**
   ```bash
   node test-connection.js
   ```

3. **Expected output:**
   ```
   ✅ MongoDB Connected Successfully!
   ```

---

### Step 7: Create Collections and Indexes

The application will auto-create collections, but you can create them manually:

1. **Go to Atlas Dashboard**

2. **Click "Browse Collections"**

3. **Click "Create Database":**
   - **Database Name:** `trackerai`
   - **Collection Name:** `users`

4. **Create Additional Collections:**
   - `emergencies`
   - `ambulances`
   - `hospitals`
   - `vitals`
   - `consultations`
   - `doctors`
   - `feedback`

5. **Create Indexes (Optional but Recommended):**

   **For `users` collection:**
   ```json
   { "email": 1 }  // Unique index
   ```

   **For `ambulances` collection:**
   ```json
   { "currentLocation": "2dsphere" }  // Geospatial index
   ```

   **For `hospitals` collection:**
   ```json
   { "location": "2dsphere" }  // Geospatial index
   ```

   **For `emergencies` collection:**
   ```json
   { "status": 1 }
   { "createdAt": -1 }
   ```

---

## 🔧 CONFIGURATION

### Database Name

The default database name in connection string is `trackerai`. You can change it to:
- `tracker-ai-production`
- `tracker-ai-dev`
- Any name you prefer

Just update in connection string: `...mongodb.net/YOUR_DB_NAME?retry...`

---

### Connection String Format

**Standard Format:**
```
mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
```

**With Additional Options:**
```
mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority&appName=TrackerAI
```

**Breakdown:**
- `mongodb+srv://` - Protocol
- `username:password@` - Credentials
- `cluster.xxxxx.mongodb.net` - Cluster address
- `/trackerai` - Database name
- `?retryWrites=true&w=majority` - Options

---

## 🔒 SECURITY BEST PRACTICES

### User Management

✅ **DO:**
- Use strong passwords (20+ characters)
- Create separate users for different environments
- Use principle of least privilege
- Rotate passwords regularly

❌ **DON'T:**
- Use simple passwords
- Share credentials
- Commit connection strings to Git
- Use same user for dev and production

### Network Security

✅ **Recommended Settings:**
- IP Whitelist: `0.0.0.0/0` for cloud hosting
- Always use connection string with `retryWrites=true`
- Enable audit logs (paid tiers)

### Connection String Security

✅ **DO:**
- Store in environment variables
- Use .env files (never commit to Git)
- Encrypt in production
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)

❌ **DON'T:**
- Hardcode in source code
- Share in chat/email
- Include in documentation
- Log connection strings

---

## 📊 MONITORING

### Database Monitoring

1. **Atlas Dashboard:**
   - Real-time metrics
   - CPU usage
   - Memory usage
   - Network traffic
   - Operations per second

2. **Set Up Alerts:**
   - Go to "Alerts" tab
   - Configure email notifications for:
     - High CPU usage (>80%)
     - Low storage (<10% free)
     - Connection issues
     - High query execution time

3. **Performance Advisor:**
   - Automatic index suggestions
   - Slow query detection
   - Query optimization recommendations

---

## 💰 PRICING

### Free Tier (M0)
- **Cost:** $0/month
- **Storage:** 512 MB
- **RAM:** Shared
- **Connections:** Unlimited
- **Backup:** Not included
- ✅ **Good for:** Development, testing, small apps

### Shared Tier (M2)
- **Cost:** ~$9/month
- **Storage:** 2 GB
- **RAM:** Shared
- **Backup:** Available
- ✅ **Good for:** Small production apps

### Dedicated (M10+)
- **Cost:** $57+/month
- **Storage:** 10+ GB
- **RAM:** Dedicated
- **Backup:** Included
- **Auto-scaling:** Available
- ✅ **Good for:** Production apps with traffic

---

## 🔄 BACKUP & RESTORE

### Automated Backups (Paid Tiers)

1. **Go to "Backup" tab**
2. **Enable Cloud Backup**
3. **Configure:**
   - Retention: 7 days
   - Frequency: Continuous
   - Point-in-time restore available

### Manual Backup (Free Tier)

**Using mongoexport:**
```bash
mongoexport --uri="your_connection_string" \
  --collection=users \
  --out=users.json
```

**Using mongodump:**
```bash
mongodump --uri="your_connection_string" \
  --out=./backup
```

---

## 🔍 TROUBLESHOOTING

### Issue: "Authentication failed"

**Cause:** Wrong username or password

**Solution:**
1. Verify username in Database Access
2. Reset password if needed
3. Check connection string format
4. Ensure no special characters need URL encoding

---

### Issue: "Connection timeout"

**Cause:** IP not whitelisted or network issue

**Solution:**
1. Check Network Access settings
2. Add `0.0.0.0/0` to IP whitelist
3. Verify cluster is running
4. Check firewall settings

---

### Issue: "Database not found"

**Cause:** Database name not in connection string

**Solution:**
1. Add database name: `mongodb+srv://.../DBNAME?retry...`
2. Check spelling of database name
3. Database will be auto-created on first write

---

### Issue: "Too many connections"

**Cause:** Connection pool exhausted

**Solution:**
1. Upgrade to larger tier
2. Implement connection pooling
3. Close unused connections
4. Monitor connection usage in Atlas

---

## ✅ SETUP CHECKLIST

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created with password saved
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] Connection string tested
- [ ] Database name added to connection string
- [ ] Connection string added to backend .env
- [ ] Backend successfully connects to database
- [ ] Collections auto-created or manually created
- [ ] Indexes created (optional)
- [ ] Monitoring alerts configured
- [ ] Backup strategy documented

---

## 📞 SUPPORT

**MongoDB Atlas Documentation:**
- https://docs.atlas.mongodb.com/

**MongoDB University (Free Courses):**
- https://university.mongodb.com/

**MongoDB Support:**
- https://support.mongodb.com/
- Community Forums: https://community.mongodb.com/

**Connection String Help:**
- https://docs.mongodb.com/manual/reference/connection-string/

---

## 🎉 SUCCESS!

Your MongoDB Atlas database is now configured!

**What You Have:**
- ✅ Cloud database cluster
- ✅ Database user with credentials
- ✅ Network access configured
- ✅ Connection string ready
- ✅ Ready for production use

**Your Connection String:**
```
mongodb+srv://username:password@cluster.mongodb.net/trackerai?retryWrites=true&w=majority
```

**Next Steps:**
1. ✅ MongoDB Atlas configured
2. → Add connection string to backend .env
3. → Deploy backend to Render
4. → Test full application

---

**Setup Guide Version:** 1.0  
**Last Updated:** Production Setup  
**Platform:** MongoDB Atlas  
**Status:** ✅ Ready
