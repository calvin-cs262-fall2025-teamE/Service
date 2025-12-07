# Azure Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Ensure Database is Ready
- [ ] Azure PostgreSQL Flexible Server is provisioned
- [ ] Database named `community` exists
- [ ] Connection string is available

### 2. Environment Variables Set in Azure App Service
Go to Azure Portal → App Service → Configuration → Application settings

Required variables:
```
DATABASE_URL=postgresql://username:password@server.postgres.database.azure.com:5432/community?schema=public&sslmode=require
JWT_SECRET=your-production-secret-here
PORT=8080
NODE_ENV=production
```

### 3. Build the Application Locally
```powershell
npm run build
```

This compiles TypeScript to `/dist` folder.

---

## 🚀 Deployment Steps

### Option 1: Deploy via VS Code Azure Extension
1. Install "Azure App Service" extension
2. Right-click on `/dist` folder
3. Select "Deploy to Web App"
4. Choose your App Service

### Option 2: Deploy via Azure CLI
```powershell
# Login to Azure
az login

# Deploy (from project root)
az webapp up --name your-app-name --resource-group your-rg --runtime "NODE:20-lts"
```

### Option 3: Deploy via Git
```powershell
# Add Azure remote
git remote add azure https://your-app.scm.azurewebsites.net:443/your-app.git

# Push to Azure
git push azure main:master
```

---

## 🗄️ Database Migration on Azure

After deployment, run migrations on Azure:

### Option 1: Via SSH Console (Recommended)
1. Go to Azure Portal → App Service → SSH
2. Run:
```bash
cd /home/site/wwwroot
npm run prisma:generate
npm run prisma:deploy
```

### Option 2: Via Kudu Console
1. Navigate to `https://your-app.scm.azurewebsites.net/DebugConsole`
2. Run same commands as above

### Option 3: Run Seed (Optional)
```bash
npm run prisma:seed
```

---

## ✅ Post-Deployment Verification

### 1. Test Health Endpoint
```powershell
curl https://your-app.azurewebsites.net/health
```

Expected:
```json
{"status":"ok"}
```

### 2. Test Key Endpoints
```powershell
# Communities
curl https://your-app.azurewebsites.net/communities

# Posts
curl https://your-app.azurewebsites.net/posts

# Users
curl https://your-app.azurewebsites.net/users
```

### 3. Check Logs
Azure Portal → App Service → Log stream

Look for:
```
Community API running on port 8080
```

---

## 🔧 Troubleshooting

### Issue: "Cannot GET /"
**Solution**: Routes are mounted correctly, but no root route exists by design. Test `/health` instead.

### Issue: "The table public.User does not exist"
**Solution**: Run migrations on Azure:
```bash
npm run prisma:deploy
```

### Issue: "Failed to connect to database"
**Solution**: 
- Check DATABASE_URL has `?sslmode=require`
- Verify PostgreSQL firewall allows Azure services

### Issue: App crashes on startup
**Solution**:
1. Check logs in Azure Portal
2. Verify all environment variables are set
3. Ensure `dist/` folder was deployed, not `src/`

### Issue: Routes return HTML error pages
**Solution**: All routes now return JSON errors. If you see HTML, the error is from Azure itself (wrong path, not from your app).

---

## 📊 Monitoring

### Check Application Insights (if enabled)
- Response times
- Failed requests
- Exceptions

### Enable Detailed Logging
Azure Portal → App Service → App Service logs:
- Application Logging: File System (Level: Information)
- Detailed error messages: On

---

## 🔄 Update Workflow

When you make changes:

1. Test locally:
```powershell
npm run dev
```

2. Build:
```powershell
npm run build
```

3. Deploy to Azure (repeat deployment method above)

4. If schema changed, run migrations on Azure:
```bash
npm run prisma:deploy
```

---

## ✅ Success Indicators

All these should work:
- ✅ `GET /health` returns `{"status":"ok"}`
- ✅ `GET /users` returns array
- ✅ `GET /posts` returns array
- ✅ `GET /communities` returns array
- ✅ `POST /auth/login` with valid credentials returns JWT
- ✅ All routes return JSON (not HTML errors)
- ✅ No Prisma "table does not exist" errors
- ✅ No 404 errors on valid routes
