# Quick Reference - CommUnity API

## 🚀 Start Server
```powershell
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Run production build
```

## 🗄️ Database Commands
```powershell
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:deploy    # Deploy migrations (prod)
npm run prisma:seed      # Seed demo data
```

## 📡 API Endpoints

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user by ID |
| GET | `/communities` | List communities |
| GET | `/communities/:id` | Get community details |
| GET | `/posts` | List all posts |
| GET | `/posts/:id` | Get post with replies |
| POST | `/posts` | Create new post |
| POST | `/posts/:id/upvote` | Upvote post |
| POST | `/posts/:id/reply` | Add reply |
| GET | `/comments` | List all comments |
| GET | `/comments/:id` | Get comment by ID |
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login (get JWT) |
| GET | `/search?query=` | Search |

### Protected Routes (Require JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update profile |
| PUT | `/auth/photo` | Upload photo |
| POST | `/communities/:id/join` | Join community |

## 🔑 Authentication
```http
POST /auth/login
Content-Type: application/json

{
  "email": "demo@calvin.edu",
  "password": "password123"
}
```

Response:
```json
{
  "user": {...},
  "token": "eyJhbGc..."
}
```

Use token in protected routes:
```http
GET /auth/me
Authorization: Bearer eyJhbGc...
```

## 📊 Demo Data
After running `npm run prisma:seed`:

**Users**:
- demo@calvin.edu / password123
- alice@calvin.edu / password123

**Communities**: RVD, BHT, SE, BV, KE

## ⚠️ Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Invalid ID | Check ID is numeric |
| 401 | Unauthorized | Add JWT token |
| 404 | Not found | Check ID exists |
| 500 | Internal error | Check logs |

## 🔧 Troubleshooting

**"Cannot GET /route"**
- Route not mounted → Check `src/app.ts`

**"Table does not exist"**
- Migrations not run → Run `npm run prisma:deploy`

**"Prisma Client not found"**
- Client not generated → Run `npm run prisma:generate`

## 📁 Key Files
```
/src
  /routes       - API endpoints
  /middleware   - Auth, errors
  /config       - Prisma client
  app.ts        - Express setup
  server.ts     - Entry point
/prisma
  schema.prisma - Database schema
  seed.ts       - Demo data
```

## 🌐 URLs
- Local: http://localhost:3000
- Azure: https://your-app.azurewebsites.net

## ✅ Health Check
```bash
curl http://localhost:3000/health
# {"status":"ok"}
```
