# CommUnity Backend API

Production-ready Node.js + TypeScript + Express + PostgreSQL + Prisma backend for the CommUnity mobile app.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express
- **Database**: PostgreSQL (Azure PostgreSQL Flexible Server)
- **ORM**: Prisma
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Validation**: Zod

## Project Structure

```
/src
  /config         - Database and shared config
  /middleware     - JWT auth, error handling
  /routes         - API route handlers
  /utils          - Helper functions (image upload, etc.)
  app.ts          - Express app setup
  server.ts       - Server entry point
/prisma
  schema.prisma   - Database schema
  seed.ts         - Seed script for demo data
```

## Setup Instructions

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```powershell
Copy-Item .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/community?schema=public"
JWT_SECRET="your-strong-secret-here"
PORT="3000"
```

### 3. Generate Prisma Client

```powershell
npm run prisma:generate
```

### 4. Run Database Migrations

```powershell
npm run prisma:migrate
```

This creates all tables (User, Community, Post, Reply, Membership).

### 5. Seed Demo Data

```powershell
npm run prisma:seed
```

This creates:
- 2 demo users (demo@calvin.edu, alice@calvin.edu) - password: `password123`
- 5 communities (RVD, BHT, SE, BV, KE)
- 3 sample posts
- 1 sample reply

### 6. Start Development Server

```powershell
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Auth

- `POST /auth/register` - Create new user
- `POST /auth/login` - Login (returns JWT)
- `GET /auth/me` - Get current user (requires auth)
- `PUT /auth/profile` - Update profile (requires auth)
- `PUT /auth/photo` - Upload profile photo (requires auth)

### Communities

- `GET /communities` - List all communities
- `GET /communities/:id` - Get community details
- `GET /communities/:id/posts` - Get posts in community
- `POST /communities/:id/join` - Join community (requires auth)
- `GET /communities/search/query?query=` - Search communities

### Posts

- `GET /posts` - List all posts
- `POST /posts` - Create post
- `GET /posts/:id` - Get post details with replies
- `POST /posts/:id/reply` - Add reply
- `POST /posts/:id/upvote` - Upvote post

### Search

- `GET /search?query=` - Search communities and posts

### Health

- `GET /health` - API health check

## Testing Endpoints

### Register a user:
```powershell
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### Login:
```powershell
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{\"email\":\"demo@calvin.edu\",\"password\":\"password123\"}'
```

### Get communities:
```powershell
curl http://localhost:3000/communities
```

### Get posts:
```powershell
curl http://localhost:3000/posts
```

## Deployment to Azure

### Prerequisites
- Azure PostgreSQL Flexible Server provisioned
- Azure App Service (Node.js 20 LTS runtime)

### Steps

1. Set environment variables in Azure App Service:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT=8080` (or your app service port)

2. Deploy migrations:
```powershell
npm run prisma:deploy
```

3. Run seed (optional for production):
```powershell
npm run prisma:seed
```

4. Build and deploy:
```powershell
npm run build
# Deploy dist/ folder to Azure App Service
```

## Database Schema

### Models

- **User**: id, firstName, lastName, email, passwordHash, phone, profileImage
- **Community**: id, communityName, description, bannerImage
- **Post**: id, title, content, type (question/advice), authorId, communityId, upvotes
- **Reply**: id, content, authorId, postId
- **Membership**: userId, communityId, role (member/admin)

## Scripts

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run migrations (dev)
- `npm run prisma:deploy` - Deploy migrations (production)
- `npm run prisma:seed` - Seed demo data

## Notes

- All routes use Zod validation for request bodies
- Auth routes use bcrypt for password hashing
- Protected routes require `Authorization: Bearer <token>` header
- Image uploads use placeholder Azure Blob integration (implement `src/utils/imageUpload.ts` for production)
- Error handling middleware catches all async errors

## Frontend Contract

This backend is designed to match the exact data shapes expected by the CommUnity React Native frontend:

- `timePosted` field returned for all posts (maps to `createdAt`)
- Community names match HomeScreen tag expectations
- Post types: `"question"` | `"advice"`
- Search returns both `communities` and `posts` arrays
- Profile editing supports `firstName`, `lastName`, `email`, `phone`, `profileImage`

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
