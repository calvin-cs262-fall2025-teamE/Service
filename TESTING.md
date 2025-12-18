# API Testing Guide for Thunder Client / Postman

## Base URL
- Local: `http://localhost:3000`
- Azure: `https://your-app.azurewebsites.net`

---

## 1. Health Check
**GET** `/health`

Expected Response:
```json
{
  "status": "ok"
}
```

---

## 2. Users Endpoints

### Get All Users
**GET** `/users`

Expected Response:
```json
[
  {
    "id": 1,
    "firstName": "Demo",
    "lastName": "User",
    "email": "demo@calvin.edu",
    "phone": "+1 (555) 123-4567",
    "profileImage": null,
    "createdAt": "2024-12-07T..."
  }
]
```

### Get User by ID
**GET** `/users/1`

Expected Response: Single user object

---

## 3. Communities Endpoints

### Get All Communities
**GET** `/communities`

Expected Response:
```json
[
  {
    "id": 1,
    "communityName": "RVD",
    "description": "Rodenhouse–Van Dellen community hall",
    "bannerImage": null,
    "createdAt": "2024-12-07T..."
  }
]
```

### Get Community by ID
**GET** `/communities/1`

Expected Response:
```json
{
  "id": 1,
  "communityName": "RVD",
  "description": "Rodenhouse–Van Dellen community hall",
  "bannerImage": null,
  "createdAt": "2024-12-07T...",
  "memberCount": 1
}
```

### Get Posts in Community
**GET** `/communities/1/posts`

Expected Response: Array of posts

---

## 4. Posts Endpoints

### Get All Posts
**GET** `/posts`

Expected Response:
```json
[
  {
    "id": 1,
    "title": "Where is the lounge located?",
    "content": "I am new to RVD...",
    "authorId": 1,
    "timePosted": "2024-12-07T...",
    "upvotes": 0,
    "communityId": 1,
    "type": "question"
  }
]
```

### Get Post by ID
**GET** `/posts/1`

Expected Response:
```json
{
  "id": 1,
  "title": "Where is the lounge located?",
  "content": "...",
  "authorId": 1,
  "timePosted": "2024-12-07T...",
  "upvotes": 0,
  "communityId": 1,
  "type": "question",
  "replies": [
    {
      "id": 1,
      "content": "The lounge is on the second floor...",
      "createdAt": "...",
      "authorId": 2,
      "postId": 1,
      "author": {
        "id": 2,
        "firstName": "Alice",
        "lastName": "Smith"
      }
    }
  ]
}
```

### Create Post
**POST** `/posts`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "type": "question",
  "title": "New test question",
  "content": "Testing the API",
  "authorId": 1,
  "communityId": 1
}
```

Expected Response: 201 Created with post object

### Upvote Post
**POST** `/posts/1/upvote`

Expected Response:
```json
{
  "upvotes": 1
}
```

### Reply to Post
**POST** `/posts/1/reply`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "content": "Great question!",
  "authorId": 1
}
```

Expected Response: 201 Created

---

## 5. Comments (Replies) Endpoints

### Get All Comments
**GET** `/comments`

Expected Response:
```json
[
  {
    "id": 1,
    "content": "The lounge is on the second floor...",
    "createdAt": "2024-12-07T...",
    "authorId": 2,
    "postId": 1,
    "author": {
      "id": 2,
      "firstName": "Alice",
      "lastName": "Smith"
    },
    "post": {
      "id": 1,
      "title": "Where is the lounge located?"
    }
  }
]
```

### Get Comment by ID
**GET** `/comments/1`

Expected Response: Single comment object

---

## 6. Authentication Endpoints

### Register User
**POST** `/auth/register`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+1 555 0000"
}
```

Expected Response: 201 Created with user and JWT token

### Login
**POST** `/auth/login`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "email": "demo@calvin.edu",
  "password": "password123"
}
```

Expected Response:
```json
{
  "user": {
    "id": 1,
    "firstName": "Demo",
    "lastName": "User",
    "email": "demo@calvin.edu",
    "phone": "+1 (555) 123-4567",
    "profileImage": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User (Protected)
**GET** `/auth/me`

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

Expected Response: User object

---

## 7. Search Endpoint

### Search Communities and Posts
**GET** `/search?query=rvd`

Expected Response:
```json
{
  "communities": [...],
  "posts": [...]
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid post ID"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized: No token provided"
}
```

### 404 Not Found
```json
{
  "error": "Post not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message here"
}
```

---

## Testing Checklist

- [ ] GET /health returns 200
- [ ] GET /users returns array
- [ ] GET /users/1 returns single user
- [ ] GET /communities returns array
- [ ] GET /communities/1 returns single community
- [ ] GET /posts returns array
- [ ] GET /posts/1 returns post with replies
- [ ] POST /posts creates new post
- [ ] POST /posts/1/upvote increments upvotes
- [ ] POST /posts/1/reply adds reply
- [ ] GET /comments returns array
- [ ] POST /auth/login returns JWT
- [ ] GET /auth/me with JWT returns user
- [ ] GET /search?query=test returns results
