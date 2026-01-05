# LinkHub Deployment Guide

This guide covers deploying LinkHub to various platforms including Heroku, Railway, Render, and VPS.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Local Development](#local-development)
4. [Production Build](#production-build)
5. [Deployment Options](#deployment-options)
6. [Database Setup](#database-setup)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- Git installed
- Account on your chosen hosting platform

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# Server
NODE_ENV=production
PORT=5001

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/linkhub

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info
```

### Required Variables

| Variable      | Description               | Example               |
| ------------- | ------------------------- | --------------------- |
| `NODE_ENV`    | Environment mode          | `production`          |
| `PORT`        | Server port               | `5001`                |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...`   |
| `JWT_SECRET`  | Secret key for JWT tokens | Min 32 characters     |
| `CLIENT_URL`  | Frontend URL for CORS     | `https://linkhub.com` |

### Optional Variables

| Variable         | Description       | Default |
| ---------------- | ----------------- | ------- |
| `JWT_EXPIRES_IN` | Token expiration  | `7d`    |
| `LOG_LEVEL`      | Logging verbosity | `info`  |

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/NewToGit-umar/LinkHUB.git
cd LinkHUB
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Set up environment

```bash
# In server directory
cp .env.example .env
# Edit .env with your values
```

### 4. Start development servers

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

Access:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

---

## Production Build

### Build the client

```bash
cd client
npm run build
```

This creates a `dist/` folder with optimized static files.

### Build configuration

The server is configured to serve static files from the client build in production.

---

## Deployment Options

### Option 1: Railway (Recommended)

Railway provides easy Node.js deployment with MongoDB add-on.

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Connect repository**

   - New Project → Deploy from GitHub Repo
   - Select your LinkHUB repository

3. **Add MongoDB**

   - Add Service → Database → MongoDB
   - Copy the connection string

4. **Configure environment variables**

   - Go to Variables tab
   - Add all required variables from `.env`
   - Use the MongoDB connection string from step 3

5. **Deploy**
   - Railway auto-deploys on push to main branch

### Option 2: Render

1. **Create Render account** at [render.com](https://render.com)

2. **Create Web Service**

   - New → Web Service
   - Connect GitHub repository
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

3. **Add MongoDB**

   - Create MongoDB Atlas account
   - Create a cluster and get connection string
   - Add `MONGODB_URI` to Render environment variables

4. **Configure environment variables** in Render dashboard

### Option 3: Heroku

1. **Install Heroku CLI**

```bash
npm install -g heroku
heroku login
```

2. **Create Heroku app**

```bash
heroku create linkhub-app
```

3. **Add MongoDB add-on**

```bash
heroku addons:create mongolab:sandbox
```

4. **Set environment variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CLIENT_URL=https://linkhub-app.herokuapp.com
```

5. **Deploy**

```bash
git push heroku main
```

### Option 4: VPS (DigitalOcean, AWS, etc.)

1. **Set up server**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
sudo apt install -y mongodb

# Install PM2
sudo npm install -g pm2
```

2. **Clone and configure**

```bash
git clone https://github.com/NewToGit-umar/LinkHUB.git
cd LinkHUB/server
npm install
cp .env.example .env
nano .env  # Edit environment variables
```

3. **Build client**

```bash
cd ../client
npm install
npm run build
```

4. **Start with PM2**

```bash
cd ../server
pm2 start server.js --name linkhub
pm2 save
pm2 startup
```

5. **Set up Nginx reverse proxy**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Enable HTTPS with Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Add to `MONGODB_URI` environment variable

### Database Indexes

The application automatically creates indexes, but for optimal performance:

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });

// Posts
db.posts.createIndex({ userId: 1, createdAt: -1 });
db.posts.createIndex({ status: 1, scheduledAt: 1 });

// Social Accounts
db.socialaccounts.createIndex({ userId: 1, platform: 1 });

// Bio Pages
db.biopages.createIndex({ userId: 1 });
db.biopages.createIndex({ slug: 1 }, { unique: true });
```

---

## Post-Deployment

### Health Check

Visit `/api/health` to verify the server is running:

```bash
curl https://your-domain.com/api/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "LinkHub API is running!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Create Admin User

1. Register a normal user account
2. Connect to MongoDB and update role:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

### Monitor Logs

```bash
# Railway
railway logs

# Render
# View in dashboard

# Heroku
heroku logs --tail

# PM2 (VPS)
pm2 logs linkhub
```

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed

- Check `MONGODB_URI` format
- Verify IP whitelist in MongoDB Atlas
- Ensure database user credentials are correct

#### CORS Errors

- Verify `CLIENT_URL` matches your frontend domain
- Check for trailing slashes

#### JWT Errors

- Ensure `JWT_SECRET` is set and at least 32 characters
- Clear browser localStorage and try again

#### Build Failures

- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Check for missing dependencies

### Logs Location

- Railway/Render/Heroku: Dashboard logs
- VPS: `server/logs/` directory
  - `error-YYYY-MM-DD.log` - Error logs
  - `combined-YYYY-MM-DD.log` - All logs
  - `http-YYYY-MM-DD.log` - HTTP request logs

### Support

For issues, open a GitHub issue at:
https://github.com/NewToGit-umar/LinkHUB/issues

---

## Security Checklist

- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Use MongoDB Atlas with authentication
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Regular database backups

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   React Client  │────▶│  Express API    │────▶│    MongoDB      │
│   (Vite)        │     │  (Node.js)      │     │    Database     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Static Host   │     │  Background     │
│   (CDN)         │     │  Services       │
│                 │     │  - Scheduler    │
│                 │     │  - Publisher    │
└─────────────────┘     └─────────────────┘
```

---

_Last updated: January 2025_
