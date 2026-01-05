# LinkHub 🔗

A comprehensive social media management platform that allows users to manage multiple social media accounts, schedule posts, create bio pages, and analyze engagement metrics.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://mongodb.com/)

## Features

### 🔐 Authentication & Authorization

- User registration and login with JWT
- Role-based access control (User, Moderator, Admin)
- Account suspension management

### 📱 Social Media Management

- Connect multiple social media accounts
- Token management and auto-refresh
- Platform support: Twitter, Instagram, Facebook, LinkedIn, TikTok, YouTube

### 📝 Post Scheduling

- Create and schedule posts
- Multi-platform publishing
- Draft and queue management
- Calendar view for scheduled posts

### 📊 Analytics

- Engagement metrics (likes, shares, comments)
- Platform-wise analytics
- Monthly trends and charts
- Milestone achievements

### 🔗 Bio Pages (Link in Bio)

- Create customizable bio pages
- Multiple link support
- Click tracking and analytics
- Custom themes and templates

### 👥 Team Collaboration

- Create and manage teams
- Role-based permissions (Owner, Admin, Member, Viewer)
- Team invitations via email
- Collaborative content management

### 🔔 Notifications

- Post publish/failure alerts
- Token expiry warnings
- Milestone achievements
- Team invitations

### 🛡️ Privacy & GDPR

- Data export functionality
- Account deletion (right to be forgotten)
- Privacy settings control

### 👨‍💼 Admin Dashboard

- User management
- System analytics
- Content moderation

## Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, Rate Limiting

### Frontend

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/NewToGit-umar/LinkHUB.git
cd LinkHUB
```

2. **Install server dependencies**

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. **Install client dependencies**

```bash
cd ../client
npm install
```

4. **Start development servers**

Terminal 1 (Server):

```bash
cd server
npm run dev
```

Terminal 2 (Client):

```bash
cd client
npm run dev
```

5. **Access the application**

- Frontend: http://localhost:5173
- API: http://localhost:5001
- Health check: http://localhost:5001/api/health

## Project Structure

```
linkhub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   │   ├── Admin/      # Admin dashboard
│   │   │   ├── Analytics/  # Analytics views
│   │   │   ├── Auth/       # Login/Register
│   │   │   ├── Bio/        # Bio page management
│   │   │   ├── Calendar/   # Calendar view
│   │   │   ├── Dashboard/  # Main dashboard
│   │   │   ├── Posts/      # Post management
│   │   │   ├── Settings/   # User settings
│   │   │   └── Teams/      # Team management
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── server/                 # Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Background services
│   ├── utils/              # Utility functions
│   ├── server.js           # Entry point
│   └── package.json
│
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Dashboard

- `GET /api/dashboard` - Get dashboard data

### Social Accounts

- `GET /api/social` - List connected accounts
- `GET /api/social/start/:provider` - Start OAuth flow
- `POST /api/social/disconnect/:provider` - Disconnect account

### Posts

- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/publish` - Publish post

### Analytics

- `GET /api/analytics/summary` - Get summary
- `GET /api/analytics/aggregate` - Get aggregated data

### Bio Pages

- `GET /api/bio/pages/:slug` - Get bio page
- `POST /api/bio/pages` - Create bio page
- `PATCH /api/bio/pages/:id` - Update bio page

### Teams

- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/:slug/members` - Get team members

### Notifications

- `GET /api/notifications` - List notifications
- `POST /api/notifications/:id/read` - Mark as read

### Privacy

- `GET /api/privacy/export` - Export user data
- `POST /api/privacy/delete-account` - Delete account

### Admin

- `GET /api/admin/overview` - System overview
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/role` - Update user role

## Environment Variables

See `server/.env.example` for all available options.

Required:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `CLIENT_URL` - Frontend URL for CORS

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:

- Railway
- Render
- Heroku
- VPS (DigitalOcean, AWS)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, open an issue on GitHub:
https://github.com/NewToGit-umar/LinkHUB/issues

---

Built with ❤️ for the Software Engineering course, BSCS 3rd Semester
