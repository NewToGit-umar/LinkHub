# LinkHub Client

React + Vite frontend for the LinkHub social media management platform.

## 📁 Project Structure

```
client/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page components
│   ├── services/    # API integration
│   ├── hooks/       # Custom React hooks
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Main app component
│   ├── main.jsx     # Entry point
│   ├── App.css      # App styles
│   └── index.css    # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── eslint.config.js
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the client directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

### Running the Application

**Development mode**
```bash
npm run dev
```

The application will open at `http://localhost:5173`

**Production build**
```bash
npm run build
```

**Preview production build**
```bash
npm run preview
```

## 🛠️ Available Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run lint` – Run ESLint
- `npm run lint:fix` – Fix ESLint issues

## 📦 Dependencies

### UI & Styling
- **react** – UI library
- **react-dom** – DOM rendering
- **react-router-dom** – Routing
- **tailwindcss** – Utility-first CSS
- **framer-motion** – Animations
- **lucide-react** – Icon library

### Data & State Management
- **axios** – HTTP client
- **react-query** – Data fetching and caching

### Charts & Visualization
- **chart.js** – Charts library
- **react-chartjs-2** – React wrapper for Chart.js

### Forms & Validation
- **react-hook-form** – Form handling
- **zod** – Schema validation

### Utilities
- **date-fns** – Date manipulation
- **clsx** – Classname utility

## 📄 Pages

### Authentication
- **Login** – User login page
- **Register** – User registration page
- **Forgot Password** – Password reset page

### Dashboard
- **Dashboard** – Main dashboard with stats
- **Profile** – User profile management

### Social Media
- **Social Accounts** – Connect/manage social accounts
- **Post Composer** – Create and schedule posts
- **Scheduled Posts** – View scheduled posts

### Analytics
- **Analytics Dashboard** – View analytics metrics
- **Export** – Export analytics reports

### Team
- **Team Members** – Manage team members
- **Invitations** – Send team invitations

## 🎨 Styling

This project uses **Tailwind CSS** for styling with dark/light mode support.

## 🔐 Authentication

Authentication is handled through JWT tokens with automatic refresh capability.

## 🌐 API Integration

API calls are made using Axios with automatic token injection.

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support

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

Example: `feat(auth): add login page`

## 📄 License

MIT

---

Part of the LinkHub Social Media Management Platform
