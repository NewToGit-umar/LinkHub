# LinkHub Server

Node.js + Express backend for the LinkHub social media management platform.

## 📁 Project Structure

```
server/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # MongoDB/Mongoose schemas
├── routes/          # API route definitions
├── utils/           # Utility functions
├── server.js        # Entry point
└── package.json
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/linkhub
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# API URLs
CLIENT_URL=http://localhost:5173
```

### Running the Server

**Development mode (with hot reload)**

```bash
npm run dev
```

**Production mode**

```bash
npm start
```

## 📚 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

- `POST /auth/register` – Register new user
- `POST /auth/login` – Login user
- `POST /auth/oauth` – OAuth login
- `POST /auth/refresh` – Refresh JWT token
- `POST /auth/logout` – Logout user
- `POST /auth/forgot-password` – Request password reset
- `POST /auth/reset-password` – Reset password

### User Endpoints

- `GET /users/me` – Get current user profile
- `PUT /users/me` – Update user profile
- `DELETE /users/me` – Delete user account

### Social Account Endpoints

- `GET /social-accounts` – List connected accounts
- `POST /social-accounts` – Connect new account
- `DELETE /social-accounts/:id` – Disconnect account

### Post Endpoints

- `POST /posts` – Create new post
- `GET /posts` – Get user's posts
- `PUT /posts/:id` – Update post
- `DELETE /posts/:id` – Delete post
- `POST /posts/:id/publish` – Publish scheduled post

### Analytics Endpoints

- `GET /analytics` – Get analytics data
- `GET /analytics/export` – Export analytics

### Team Endpoints

- `POST /teams` – Create team
- `GET /teams` – List user's teams
- `POST /teams/:id/invite` – Invite team member
- `DELETE /teams/:id/members/:userId` – Remove team member

## 🔐 Middleware

- **Authentication** – JWT token validation
- **Authorization** – Role-based access control
- **Error Handling** – Centralized error management
- **Validation** – Request data validation
- **CORS** – Cross-origin request handling
- **Rate Limiting** – API rate limiting

## 🧪 Testing

```bash
npm test
```

## 📦 Dependencies

- **express** – Web framework
- **mongoose** – MongoDB ODM
- **jsonwebtoken** – JWT authentication
- **bcryptjs** – Password hashing
- **dotenv** – Environment variables
- **axios** – HTTP client
- **nodemailer** – Email sending
- **node-cron** – Task scheduling
- **cors** – CORS middleware
- **express-validator** – Request validation

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify database name is correct

### JWT Token Invalid

- Check token expiration
- Verify `JWT_SECRET` matches between server and client
- Ensure token is sent in Authorization header

### CORS Errors

- Verify `CLIENT_URL` is set correctly
- Check CORS middleware configuration
- Ensure credentials are being sent in client requests

## 📝 Commit Convention

```
feat(scope): description        # New feature
fix(scope): description         # Bug fix
refactor(scope): description    # Code refactoring
perf(scope): description        # Performance improvement
docs(scope): description        # Documentation update
chore(scope): description       # Maintenance/tooling
style(scope): description       # Code style changes
test(scope): description        # Test additions/updates
```

Example: `feat(auth): implement jwt authentication`

## 📄 License

MIT

---

Part of the LinkHub Social Media Management Platform
