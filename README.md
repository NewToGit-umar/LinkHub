# LinkHub – Social Media Management Platform

A comprehensive, production-ready MERN (MongoDB, Express, React, Node.js) application for managing multiple social media accounts, scheduling posts, tracking analytics, and collaborating with teams.

## 🎯 Features

### Authentication & Security

- Email/password registration with bcrypt hashing
- OAuth 2.0 integration (Google, Facebook)
- JWT token-based authentication
- Two-factor authentication (OTP)
- Password reset with secure tokens
- Role-based access control (RBAC)

### Social Media Integration

- Connect multiple social media accounts
- Automatic API token refresh
- Support for major platforms (Facebook, Twitter, Instagram, LinkedIn)
- Disconnect and token revocation

### Post Management

- Create, edit, delete posts
- Schedule posts for future publishing
- Multi-platform post distribution
- Auto-publishing with retry handling
- Calendar/timeline view of scheduled posts

### Analytics

- Real-time engagement metrics
- Cross-platform analytics aggregation
- Custom dashboards and reports
- Export data as CSV and PDF
- Analytics milestones and alerts

### Link Management

- Create and manage bio pages
- Customizable templates
- Track link clicks and engagement
- Shareable public links
- Click analytics

### Team Collaboration

- Invite team members
- Role-based permissions (Admin, Editor, Viewer)
- Post commenting and discussions
- Team activity logs

### Notifications

- In-app notifications
- Email alerts for important events
- Scheduled post notifications
- Token expiry alerts
- Analytics milestone notifications

## 🏗️ Project Structure

```
linkhub/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
│
└── server/                 # Node.js + Express backend
    ├── controllers/        # Request handlers
    ├── models/             # MongoDB schemas
    ├── routes/             # API endpoints
    ├── middleware/         # Custom middleware
    ├── utils/              # Helper functions
    ├── config/             # Configuration files
    ├── server.js           # Entry point
    ├── package.json
    └── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB instance
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/NewToGit-umar/LinkHUB.git
   cd linkhub
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Configuration

1. **Create `.env` file in `server/` directory**

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/linkhub
   JWT_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   ```

2. **Create `.env.local` file in `client/` directory**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_FACEBOOK_APP_ID=your-facebook-app-id
   ```

### Running the Application

**Terminal 1 – Start the server**

```bash
cd server
npm start
```

**Terminal 2 – Start the client**

```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Tech Stack

### Frontend

- **React 18** – UI library
- **Vite** – Build tool
- **React Router** – Client-side routing
- **Tailwind CSS** – Styling
- **Framer Motion** – Animations
- **Chart.js** – Analytics visualization
- **Axios** – HTTP client

### Backend

- **Node.js** – Runtime environment
- **Express.js** – Web framework
- **MongoDB** – Database
- **Mongoose** – ODM
- **JWT** – Authentication
- **Bcrypt** – Password hashing
- **Node-cron** – Scheduling
- **Nodemailer** – Email sending

### Development Tools

- **ESLint** – Code linting
- **Prettier** – Code formatting
- **Jest** – Testing framework
- **Docker** – Containerization

## 📋 Compliance

- ✅ **GDPR** – Data privacy and user control
- ✅ **WCAG 2.1 AA** – Accessibility standards
- ✅ **Security** – Encrypted passwords, JWT tokens, CORS
- ✅ **Performance** – Optimized queries and caching
- ✅ **Reliability** – Error handling and logging

## 📚 Development Workflow

This project follows a strict task-based workflow:

1. One task per branch
2. One commit per task
3. Pull request review before merging
4. Push to main after approval

See `copilot_instructions.md` for the complete 50-task development plan.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'feat: your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- Project maintained by: NewToGit-umar
- University: BSCS 3rd Semester, Software Engineering

## 📞 Support

For issues and questions, please create an issue on the GitHub repository.

---

**Status**: Under active development (Phase 1 of 9)
