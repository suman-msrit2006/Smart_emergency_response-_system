# MongoDB Atlas Configuration Guide

Complete guide to set up MongoDB Atlas for TrackER AI.

---

## Overview

MongoDB Atlas is a fully-managed cloud database service that provides:
- Automated backups
- High availability
- Scalability
- Security features
- Monitoring and alerts
- Free tier for development

---

## Step 1: Create Account

### 1.1 Sign Up
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with:
   - Email
   - Google account
   - GitHub account (recommended)
3. Verify your email address

### 1.2 Create Organization
1. Organization Name: `TrackER AI`
2. Select use case: `Build a new application`
3. Preferred language: `JavaScript/Node.js`

---

## Step 2: Create Cluster

### 2.1 Choose Deployment Type
1. Click "Build a Database"
2. Select **Shared** (Free tier M0)
3. Cloud Provider: **AWS** (recommended)
4. Region: Select closest to your users
   - US East (N. Virginia) - `us-east-1`
   - US West (Oregon) - `us-west-2`
   - Europe (Ireland) - `eu-west-1`
   - Asia Pacific (Singapore) - `ap-southeast-1`

### 2.2 Cluster Configuration
- **Cluster Tier:** M0 Sandbox (FREE)
- **Cluster Name:** `tracker-ai-cluster`
- **Additional Settings:** Keep defaults
- Click "Create"

**Wait 3-5 minutes for cluster to deploy**

---

## Step 3: Security Setup

### 3.1 Create Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"

**Configuration:**
- **Authentication Method:** Password
- **Username:** `tracker-ai-admin`
- **Password:** Click "Autogenerate Secure Password" (SAVE THIS!)
  - Or create strong password: min 12 characters, mixed case, numbers, symbols
- **Database User Privileges:** Read and write to any database
- **Temporary User:** No
- Click "Add User"

**Example:**
```
Username: tracker-ai-admin
Password: aB3$xY9#mK2@pL5&qR8
```

### 3.2 Configure Network Access

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"

**For Development:**
- Click "Allow Access from Anywhere"
- IP Address: `0.0.0.0/0`
- Comment: `Development - Allow all`
- Click "Confirm"

**For Production (Recommended):**
1. Get your server IP address (from Render or your hosting)
2. Click "Add IP Address"
3. Enter specific IP address
4. Comment: `Production Server - Render`
5. Click "Confirm"

**For Render Deployment:**
- Use `0.0.0.0/0` (Render uses dynamic IPs)
- Or add Render IP ranges (see Render docs)

---

## Step 4: Get Connection String

### 4.1 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"

### 4.2 Configure Connection
- **Driver:** Node.js
- **Version:** 5.5 or later
- Copy the connection string

### 4.3 Update Connection String

**Original:**
```
mongodb+srv://tracker-ai-admin:<password>@tracker-ai-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Replace:**
1. `<password>` with your actual password
2. Add database name: `/tracker-ai`
3. Keep connection options

**Final:**
```
mongodb+srv://tracker-ai-admin:aB3$xY9#mK2@pL5&qR8@tracker-ai-cluster.xxxxx.mongodb.net/tracker-ai?retryWrites=true&w=majority
```

### 4.4 Add to Environment Variables

**Local (.env):**
```bash
MONGODB_URI=mongodb+srv://tracker-ai-admin:aB3$xY9#mK2@pL5&qR8@tracker-ai-cluster.xxxxx.mongodb.net/tracker-ai?retryWrites=true&w=majority
```

**Render:**
- Go to service dashboard
- Settings → Environment
- Add `MONGODB_URI` with connection string

---

## Step 5: Test Connection

### 5.1 Local Test
```bash
cd Hackathonproject/server
npm install
npm run dev
```

**Expected output:**
```
✓ MongoDB Connected: tracker-ai-cluster.xxxxx.mongodb.net
Server running in development mode on port 5000
```

### 5.2 Using MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Open Compass
3. Paste connection string
4. Click "Connect"
5. Verify connection successful

---

## Step 6: Database Setup

### 6.1 Create Database
1. In Atlas, click "Browse Collections"
2. Click "Add My Own Data"
3. Database Name: `tracker-ai`
4. Collection Name: `users`
5. Click "Create"

### 6.2 Collections Created Automatically

Your application will automatically create these collections:
- `users` - User accounts
- `hospitals` - Hospital information
- `ambulances` - Ambulance fleet
- `emergencies` - Emergency requests
- `vitals` - Patient vital signs
- `consultations` - Doctor consultations
- `feedbacks` - User feedback

---

## Step 7: Configure Indexes

### 7.1 Create Indexes for Performance

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Emergencies
db.emergencies.createIndex({ patient: 1 });
db.emergencies.createIndex({ status: 1 });
db.emergencies.createIndex({ severity: 1 });
db.emergencies.createIndex({ location: "2dsphere" });
db.emergencies.createIndex({ createdAt: -1 });

// Hospitals
db.hospitals.createIndex({ location: "2dsphere" });
db.hospitals.createIndex({ status: 1 });
db.hospitals.createIndex({ "specialties": 1 });

// Ambulances
db.ambulances.createIndex({ location: "2dsphere" });
db.ambulances.createIndex({ status: 1 });
db.ambulances.createIndex({ hospital: 1 });

// Vitals
db.vitals.createIndex({ patient: 1 });
db.vitals.createIndex({ emergency: 1 });
db.vitals.createIndex({ recordedAt: -1 });
db.vitals.createIndex({ status: 1 });

// Consultations
db.consultations.createIndex({ patient: 1 });
db.consultations.createIndex({ doctor: 1 });
db.consultations.createIndex({ status: 1 });
db.consultations.createIndex({ scheduledAt: 1 });

// Feedbacks
db.feedbacks.createIndex({ type: 1 });
db.feedbacks.createIndex({ "relatedTo.hospital": 1 });
db.feedbacks.createIndex({ "relatedTo.doctor": 1 });
db.feedbacks.createIndex({ rating: 1 });
```

**Apply via MongoDB Compass:**
1. Connect to your cluster
2. Select database `tracker-ai`
3. For each collection:
   - Click "Indexes" tab
   - Click "Create Index"
   - Enter index definition
   - Click "Create Index"

---

## Step 8: Monitoring & Alerts

### 8.1 Enable Monitoring
1. Go to "Metrics" tab in Atlas
2. View:
   - Operations per second
   - Network traffic
   - Connections
   - Query performance

### 8.2 Set Up Alerts
1. Go to "Alerts" in left sidebar
2. Click "Add Alert"
3. Configure alerts for:
   - High CPU usage (>80%)
   - High memory usage (>80%)
   - Connection spikes
   - Slow queries
4. Add email notification
5. Click "Save"

---

## Step 9: Backup Configuration

### 9.1 Enable Cloud Backup (Paid Feature)

**Free Tier:**
- No automated backups
- Manual exports only

**M10+ (Paid):**
- Continuous backups
- Point-in-time recovery
- Scheduled snapshots

### 9.2 Manual Backup
1. Go to "Collections"
2. Select database
3. Click "..." menu
4. Export Collection
5. Download JSON/CSV

---

## Step 10: Security Hardening

### 10.1 Enable Encryption
- **At Rest:** Enabled by default on Atlas
- **In Transit:** TLS/SSL enabled by default

### 10.2 Enable Audit Logs (M10+)
1. Go to "Security" → "Advanced"
2. Enable "Database Auditing"
3. Configure audit filters
4. Save configuration

### 10.3 IP Whitelist Best Practices
- Use specific IPs in production
- Remove `0.0.0.0/0` when not needed
- Document all whitelisted IPs
- Review regularly

### 10.4 Database User Best Practices
- Use strong passwords
- Create separate users per environment
- Limit privileges to minimum required
- Rotate passwords regularly
- Enable MFA on Atlas account

---

## Production Configuration

### MongoDB Atlas M10 Cluster (Recommended for Production)

**Specs:**
- 2 GB RAM
- 10 GB Storage
- Automated backups
- Point-in-time recovery
- Cost: ~$57/month

**Upgrade Steps:**
1. Go to cluster overview
2. Click "..." menu
3. Select "Edit Configuration"
4. Choose M10 tier
5. Configure auto-scaling (optional)
6. Click "Apply Changes"

---

## Connection String Formats

### Standard Connection String
```
mongodb://username:password@host:27017/database
```

### SRV Connection String (Recommended)
```
mongodb+srv://username:password@cluster.mongodb.net/database?options
```

### Connection Options
```
?retryWrites=true         # Automatically retry failed writes
&w=majority               # Write concern: majority of nodes
&appName=tracker-ai       # Application name for monitoring
&maxPoolSize=50           # Maximum connection pool size
&minPoolSize=10           # Minimum connection pool size
```

---

## Troubleshooting

### Connection Timeout
**Error:** `MongooseServerSelectionError: connection timed out`

**Solutions:**
1. Check IP whitelist (0.0.0.0/0 for development)
2. Verify username and password
3. Check cluster is running (not paused)
4. Verify network connectivity

### Authentication Failed
**Error:** `MongoServerError: bad auth : authentication failed`

**Solutions:**
1. Verify username is correct
2. Verify password has no special URL characters
3. URL-encode password if it contains special characters
4. Check user has correct permissions

### Database Not Found
**Error:** `MongoError: database does not exist`

**Solutions:**
1. Database is created automatically on first write
2. Ensure database name in connection string
3. Check write permissions

### Too Many Connections
**Error:** `MongoError: too many connections`

**Solutions:**
1. Close unused connections
2. Implement connection pooling
3. Upgrade cluster tier
4. Check for connection leaks in code

---

## Performance Optimization

### 1. Indexing Strategy
- Index frequently queried fields
- Use compound indexes for multiple field queries
- Monitor index usage in Atlas
- Remove unused indexes

### 2. Query Optimization
- Use projections to limit returned fields
- Implement pagination
- Use aggregation pipelines
- Avoid large documents

### 3. Connection Pooling
```javascript
// In database.js
mongoose.connect(uri, {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 4. Caching
- Cache frequently accessed data
- Use Redis for session storage
- Implement query result caching

---

## Monitoring Metrics

### Key Metrics to Monitor

1. **Operations**
   - Reads per second
   - Writes per second
   - Commands per second

2. **Performance**
   - Query execution time
   - Slow queries
   - Index efficiency

3. **Resources**
   - CPU utilization
   - Memory usage
   - Disk IOPS
   - Network bandwidth

4. **Connections**
   - Active connections
   - Connection pool size
   - Failed connections

---

## Cost Optimization

### Free Tier (M0)
- **Storage:** 512 MB
- **RAM:** Shared
- **Connections:** 500 max
- **Backups:** None
- **Cost:** FREE

### Development (M2)
- **Storage:** 2 GB
- **RAM:** Shared
- **Cost:** ~$9/month

### Production (M10)
- **Storage:** 10 GB
- **RAM:** 2 GB dedicated
- **Backups:** Included
- **Cost:** ~$57/month

### Tips to Reduce Costs
1. Use free tier for development
2. Clean up old data regularly
3. Implement data archiving
4. Monitor storage usage
5. Optimize queries to reduce compute

---

## Best Practices Checklist

- [ ] Strong database password set
- [ ] IP whitelist configured
- [ ] Connection string secured
- [ ] Indexes created for common queries
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Backup strategy defined
- [ ] Security hardened
- [ ] Performance optimized
- [ ] Documentation updated

---

## Useful Links

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Documentation:** https://docs.atlas.mongodb.com
- **Connection String Format:** https://docs.mongodb.com/manual/reference/connection-string/
- **Node.js Driver:** https://docs.mongodb.com/drivers/node/
- **Mongoose Docs:** https://mongoosejs.com/docs/

---

**MongoDB Atlas Setup Complete! 🎉**

Your database is ready for production use.
