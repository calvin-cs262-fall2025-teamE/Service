# Quick Start Guide

## Prerequisites
- Node.js 20+ installed
- PostgreSQL database (local or Azure)
- Git

## Local Development Setup

### 1. Clone and Install
```powershell
git clone <repo-url>
cd Service
npm install
```

### 2. Database Setup

Update `.env` with your PostgreSQL connection:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/community?schema=public"
```

For local PostgreSQL on Windows, install from https://www.postgresql.org/download/windows/

### 3. Initialize Database

```powershell
# Generate Prisma Client
npm run prisma:generate

# Create tables
npm run prisma:migrate

# Seed demo data
npm run prisma:seed
```

### 4. Start Server

```powershell
npm run dev
```

Server runs on http://localhost:3000

## Test the API

### Health Check
```powershell
curl http://localhost:3000/health
```

### Login with Demo User
```powershell
curl -X POST http://localhost:3000/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"demo@calvin.edu","password":"password123"}'
```

### Get Communities
```powershell
curl http://localhost:3000/communities
```

### Get Posts
```powershell
curl http://localhost:3000/posts
```

### Create a Post (requires JWT from login)
```powershell
$token = "<JWT_TOKEN_FROM_LOGIN>"
curl -X POST http://localhost:3000/posts `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"type":"question","title":"Test Question","content":"Testing API","authorId":1,"communityId":1}'
```

## Common Issues

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database exists: `CREATE DATABASE community;`

### Port Already in Use
- Change PORT in `.env` to another value (e.g., 3001)

### Prisma Client Not Found
- Run `npm run prisma:generate` again

## Production Deployment (Azure)

### 1. Create Azure Resources
- Azure PostgreSQL Flexible Server
- Azure App Service (Node.js 20 runtime)

### 2. Set Environment Variables in Azure App Service
```
DATABASE_URL=<your-azure-postgres-url>
JWT_SECRET=<strong-random-secret>
PORT=8080
```

### 3. Deploy Code
```powershell
# Build
npm run build

# Deploy dist/ to Azure App Service
# (Use Azure CLI, GitHub Actions, or VS Code Azure extension)
```

### 4. Run Migrations in Production
```powershell
# After deployment, SSH to App Service or use kudu console:
npm run prisma:deploy
npm run prisma:seed  # Optional, for demo data
```

## API Documentation

See full API docs in `README.md`

## Demo Users (after seed)

| Email | Password |
|-------|----------|
| demo@calvin.edu | password123 |
| alice@calvin.edu | password123 |

## Communities (after seed)

- RVD (id: 1)
- BHT (id: 2)
- SE (id: 3)
- BV (id: 4)
- KE (id: 5)
