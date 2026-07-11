# 📁 TrackER AI - Complete Folder Structure

Comprehensive guide to understanding the project folder structure.

---

## 📊 Project Root Structure

```
Hackathonproject/
├── .git/                          # Git repository
├── .github/                       # GitHub configuration
│   └── workflows/
│       └── ci-cd.yml             # CI/CD pipeline configuration
├── client/                        # Frontend application (React + Vite)
├── server/                        # Backend application (Node.js + Express)
├── hackathon/                     # Original hackathon HTML files
├── COMPLETE_PROJECT_SUMMARY.md   # Complete project overview
├── FOLDER_STRUCTURE.md           # This file
├── INSTALLATION_GUIDE.md         # Installation instructions
├── PROJECT_CHECKLIST.md          # Project checklist
├── PROJECT_EXECUTION_GUIDE.md    # Execution guide
└── README.md                      # Main project README
```

---

## 🖥️ Backend Structure (`server/`)

```
server/
├── src/                           # Source code directory
│   ├── config/                   # Configuration files
│   ├── controllers/              # Request handlers
│   ├── middleware/               # Express middleware
│   ├── models/                   # Database models (Mongoose)
│   ├── routes/                   # API route definitions
│   ├── services/                 # Business logic layer
│   ├── socket/                   # Socket.IO implementation
│   ├── utils/                    # Utility functions
│   ├── validations/              # Request validation schemas
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Entry point + Socket.IO setup
├── .env.example                  # Environment variables template
├── .env.production               # Production environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
└── [Documentation files]         # Various .md documentation files
```

### `src/config/` - Configuration

**Purpose:** Central configuration management for database, environment, and sockets.

```
config/
├── database.js         # MongoDB connection configuration
├── env.js             # Environment variable management
└── socket.js          # Socket.IO configuration (legacy)
```

**Files:**
- **database.js** - MongoDB connection with Mongoose, connection pooling, error handling
- **env.js** - Loads and validates environment variables, provides typed config object
- **socket.js** - Socket.IO configuration (deprecated, now in socket/ folder)

---

### `src/controllers/` - Request Handlers

**Purpose:** Handle HTTP requests, call services, return responses.

```
controllers/
├── ambulanceController.js      # Ambulance CRUD and tracking
├── authController.js          # Authentication (register, login, profile)
├── consultationController.js  # Consultation management
├── emergencyController.js     # Emergency request handling
├── feedbackController.js      # Feedback system
├── hospitalController.js      # Hospital management
└── vitalController.js         # Vital signs management
```

**Responsibilities:**
- Extract data from request (body, params, query)
- Validate request (using validation middleware)
- Call appropriate service methods
- Return formatted response
- Handle errors (caught by error middleware)

**Pattern:**
```javascript
export const createResource = asyncHandler(async (req, res) => {
  const data = req.body;
  const result = await resourceService.create(data);
  res.status(201).json({
    status: 'success',
    data: result
  });
});
```

---

### `src/middleware/` - Express Middleware

**Purpose:** Process requests before they reach controllers.

```
middleware/
├── auth.js             # JWT authentication & authorization
├── errorHandler.js     # Global error handling
├── notFound.js         # 404 handler
├── security.js         # Security middleware (Helmet, CORS, Rate limiting)
└── validate.js         # Request validation (Zod schemas)
```

**Files:**
- **auth.js** - `protect` (verify JWT), `restrictTo` (role-based access)
- **errorHandler.js** - Catches all errors, formats response, logs errors
- **notFound.js** - Returns 404 for unknown routes
- **security.js** - Helmet headers, CORS config, rate limiting, MongoDB sanitization
- **validate.js** - Validates request data against Zod schemas

---

### `src/models/` - Database Models

**Purpose:** Define MongoDB schema and models using Mongoose.

```
models/
├── Ambulance.js       # Ambulance schema (vehicle, location, status)
├── Consultation.js    # Consultation schema (patient, doctor, diagnosis)
├── Emergency.js       # Emergency schema (patient, location, status)
├── Feedback.js        # Feedback schema (rating, comments, votes)
├── Hospital.js        # Hospital schema (name, location, capacity)
├── User.js           # User schema (auth, roles)
└── Vital.js          # Vital signs schema (BP, HR, O2, temp)
```

**Common Features:**
- Schema definition with validation
- Indexes for performance (especially geospatial)
- Pre-save hooks (e.g., password hashing)
- Instance methods (e.g., comparePassword)
- Virtuals (computed properties)
- Timestamps (createdAt, updatedAt)

**Example Structure:**
```javascript
const schema = new mongoose.Schema({
  // fields
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
schema.index({ field: 1 });

// Hooks
schema.pre('save', async function(next) { ... });

// Methods
schema.methods.customMethod = function() { ... };

export default mongoose.model('Model', schema);
```

---

### `src/routes/` - API Routes

**Purpose:** Define API endpoints and map to controllers.

```
routes/
├── index.js                  # Main router (aggregates all routes)
├── ambulanceRoutes.js       # /api/ambulances/*
├── authRoutes.js            # /api/auth/*
├── consultationRoutes.js    # /api/consultations/*
├── emergencyRoutes.js       # /api/emergencies/*
├── feedbackRoutes.js        # /api/feedbacks/*
├── hospitalRoutes.js        # /api/hospitals/*
└── vitalRoutes.js           # /api/vitals/*
```

**Pattern:**
```javascript
import express from 'express';
import controller from '../controllers/controller.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { schema } from '../validations/schema.js';

const router = express.Router();

router.route('/')
  .get(protect, controller.getAll)
  .post(protect, validate(schema.create), controller.create);

router.route('/:id')
  .get(protect, controller.getOne)
  .patch(protect, validate(schema.update), controller.update)
  .delete(protect, restrictTo('Admin'), controller.delete);

export default router;
```

---

### `src/services/` - Business Logic

**Purpose:** Implement business logic, database operations, complex calculations.

```
services/
├── ambulanceService.js      # Ambulance business logic
├── consultationService.js   # Consultation business logic
├── emergencyService.js      # Emergency business logic
├── feedbackService.js       # Feedback business logic
├── hospitalService.js       # Hospital business logic
└── vitalService.js         # Vital signs business logic
```

**Responsibilities:**
- Database queries (CRUD operations)
- Complex business logic
- Data validation and transformation
- Geospatial calculations
- Aggregations and analytics
- Socket.IO event emission
- Integration with external services

**Why Services?**
- Separation of concerns (controllers handle HTTP, services handle logic)
- Reusability (services can be called from controllers, sockets, cron jobs)
- Testability (easier to unit test)
- Maintainability (centralized business logic)

**Pattern:**
```javascript
export const create = async (data) => {
  const resource = await Model.create(data);
  
  // Emit socket event
  io.emit('resource:created', resource);
  
  return resource;
};

export const findNearby = async (coordinates, maxDistance) => {
  return await Model.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: maxDistance
      }
    }
  });
};
```

---

### `src/socket/` - Socket.IO Implementation

**Purpose:** Real-time WebSocket communication using Socket.IO.

```
socket/
├── index.js               # Main socket configuration & initialization
├── ambulance.socket.js    # Ambulance-related socket events
├── emergency.socket.js    # Emergency-related socket events
└── vitals.socket.js       # Vitals-related socket events
```

**Files:**
- **index.js** - Socket.IO server setup, authentication, connection handling
- **ambulance.socket.js** - Location updates, status changes, assignments
- **emergency.socket.js** - Emergency creation, status changes, assignments
- **vitals.socket.js** - Vital sign streaming, critical alerts

**Features:**
- JWT authentication for socket connections
- Room-based messaging (join/leave rooms)
- Event handlers (client to server)
- Event emitters (server to clients)
- Error handling and logging

**Pattern:**
```javascript
export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    
    // Join room
    socket.on('resource:join', (id) => {
      socket.join(`resource-${id}`);
    });
    
    // Handle event
    socket.on('resource:update', async (data) => {
      // Update database
      // Broadcast to room
      io.to(`resource-${data.id}`).emit('resource:updated', data);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
```

---

### `src/utils/` - Utility Functions

**Purpose:** Reusable helper functions and classes.

```
utils/
├── AppError.js         # Custom error class
├── asyncHandler.js     # Async error wrapper
├── jwt.js             # JWT utilities (sign, verify)
└── logger.js          # Logging configuration (Morgan, Winston)
```

**Files:**
- **AppError.js** - Custom error class with statusCode and isOperational
- **asyncHandler.js** - Wraps async functions to catch errors
- **jwt.js** - Sign and verify JWT tokens
- **logger.js** - Configure Morgan (HTTP requests) and Winston (application logs)

---

### `src/validations/` - Request Validation

**Purpose:** Zod schemas for request validation.

```
validations/
├── ambulanceValidation.js      # Ambulance validation schemas
├── authValidation.js          # Authentication validation
├── consultationValidation.js  # Consultation validation
├── emergencyValidation.js     # Emergency validation
├── feedbackValidation.js      # Feedback validation
├── hospitalValidation.js      # Hospital validation
└── vitalValidation.js         # Vital signs validation
```

**Pattern:**
```javascript
import { z } from 'zod';

export const createSchema = z.object({
  body: z.object({
    field1: z.string().min(3).max(100),
    field2: z.number().positive(),
    field3: z.enum(['option1', 'option2']),
    field4: z.string().email().optional()
  })
});

export const updateSchema = z.object({
  body: z.object({
    field1: z.string().min(3).max(100).optional(),
    field2: z.number().positive().optional()
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/)
  })
});
```

---

### Backend Root Files

**app.js** - Express application configuration
```javascript
// Middleware setup
// Security (Helmet, CORS, Rate limiting)
// Body parsing
// Logging
// Routes
// Error handling
export default app;
```

**server.js** - Server entry point
```javascript
// Load environment variables
// Connect to database
// Initialize Socket.IO
// Start HTTP server
// Graceful shutdown handlers
```

**package.json** - Dependencies and scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest"
  },
  "dependencies": { ... },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**.env.example** - Environment variables template
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
...
```

---

## 🎨 Frontend Structure (`client/`)

```
client/
├── public/                        # Static assets
│   ├── favicon.svg               # Favicon
│   └── icons.svg                 # SVG icon sprites
├── src/                          # Source code
│   ├── assets/                   # Images, icons
│   ├── components/               # Reusable React components
│   ├── config/                   # Configuration files
│   ├── constants/                # Constants and enums
│   ├── context/                  # React Context providers
│   ├── hooks/                    # Custom React hooks
│   ├── layouts/                  # Layout components
│   ├── pages/                    # Page components
│   ├── routes/                   # Routing configuration
│   ├── services/                 # API service layer
│   ├── styles/                   # Global styles and theme
│   ├── utils/                    # Utility functions
│   ├── App.jsx                   # Main app component
│   ├── index.css                 # Global CSS
│   └── main.jsx                  # Entry point
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── eslint.config.js              # ESLint configuration
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration
└── [Documentation files]         # .md files
```

---

### `src/components/` - React Components

**Purpose:** Reusable UI components.

```
components/
├── Button.jsx              # Custom button component
├── FeatureCard.jsx        # Feature card component
├── Footer.jsx             # Footer component
├── Hero.jsx               # Hero section
├── Logo.jsx               # Logo component
├── Navbar.jsx             # Navigation bar
├── ProtectedRoute.jsx     # Route guard component
├── SectionTitle.jsx       # Section title component
└── StatCard.jsx           # Statistics card
```

**ProtectedRoute Pattern:**
```jsx
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};
```

---

### `src/config/` - Configuration

**Purpose:** Frontend configuration and constants.

```
config/
└── api.js                 # API endpoints configuration
```

**api.js:**
```javascript
const API_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_URL}/auth/register`,
    LOGIN: `${API_URL}/auth/login`,
    PROFILE: `${API_URL}/auth/profile`
  },
  HOSPITALS: `${API_URL}/hospitals`,
  EMERGENCIES: `${API_URL}/emergencies`,
  // ... more endpoints
};
```

---

### `src/context/` - React Context

**Purpose:** Global state management using React Context.

```
context/
└── AuthContext.jsx         # Authentication context
```

**AuthContext Pattern:**
```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (credentials) => { ... };
  const logout = () => { ... };
  const register = async (userData) => { ... };
  
  useEffect(() => {
    // Check for stored token on mount
    checkAuth();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

### `src/pages/` - Page Components

**Purpose:** Main page/view components.

```
pages/
├── Discharge.jsx          # Discharge page
├── Doctor.jsx            # Doctor consultations page
├── Emergency.jsx         # Emergency management page
├── Feedback.jsx          # Feedback page
├── Home.jsx              # Home/landing page
├── Hospital.jsx          # Hospital search page
├── Login.jsx             # Login page
├── NotFound.jsx          # 404 page
├── Register.jsx          # Registration page
└── Vitals.jsx            # Vital signs page
```

**Page Pattern:**
```jsx
export default function PageName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await service.getAll();
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return <div>...</div>;
}
```

---

### `src/services/` - API Services

**Purpose:** API communication layer using Axios.

```
services/
├── ambulanceService.js       # Ambulance API calls
├── authService.js           # Authentication API calls
├── axiosInstance.js         # Axios configuration
├── consultationService.js   # Consultation API calls
├── doctorService.js         # Doctor API calls
├── emergencyService.js      # Emergency API calls
├── feedbackService.js       # Feedback API calls
├── hospitalService.js       # Hospital API calls
├── socketService.js         # Socket.IO client
└── vitalService.js          # Vitals API calls
```

**axiosInstance.js:**
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor (add JWT)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Service Pattern:**
```javascript
export const getAll = () => api.get('/resources');
export const getOne = (id) => api.get(`/resources/${id}`);
export const create = (data) => api.post('/resources', data);
export const update = (id, data) => api.patch(`/resources/${id}`, data);
export const remove = (id) => api.delete(`/resources/${id}`);
```

---

### `src/layouts/` - Layout Components

**Purpose:** Page layout wrappers.

```
layouts/
└── MainLayout.jsx          # Main app layout (Navbar + content + Footer)
```

**Pattern:**
```jsx
export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
```

---

### `src/routes/` - Routing

**Purpose:** Application routing configuration.

```
routes/
└── AppRoutes.jsx           # Route definitions
```

**Pattern:**
```jsx
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/emergency" element={
        <ProtectedRoute><Emergency /></ProtectedRoute>
      } />
      {/* ... more routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

---

### Frontend Root Files

**main.jsx** - Entry point
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**App.jsx** - Main app component
```jsx
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return <AppRoutes />;
}
```

**vite.config.js** - Vite configuration
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
```

---

## 🔄 Data Flow

### Request Flow (Backend):
```
Client Request
    ↓
Express App (app.js)
    ↓
Security Middleware (security.js)
    ↓
Body Parser
    ↓
Route (routes/*.js)
    ↓
Authentication (auth.js)
    ↓
Validation (validate.js)
    ↓
Controller (controllers/*.js)
    ↓
Service (services/*.js)
    ↓
Model (models/*.js)
    ↓
MongoDB
    ↓
Response back through chain
    ↓
Client Response
```

### Socket.IO Flow:
```
Client Event
    ↓
Socket.IO Server (socket/index.js)
    ↓
Authentication
    ↓
Event Handler (socket/*.socket.js)
    ↓
Service (services/*.js)
    ↓
Model (models/*.js)
    ↓
MongoDB
    ↓
Emit to Room/Client
    ↓
Client Receives Event
```

### Frontend Request Flow:
```
User Action (Page Component)
    ↓
API Service (services/*.js)
    ↓
Axios Instance (axiosInstance.js)
    ↓
Request Interceptor (add JWT)
    ↓
Backend API
    ↓
Response Interceptor (handle errors)
    ↓
Service returns data
    ↓
Component updates state
    ↓
UI re-renders
```

---

## 📦 Key Directories Explained

### Backend:
- **config/** - All configuration (DB, env, socket)
- **controllers/** - HTTP request handlers
- **middleware/** - Request processing pipeline
- **models/** - Database schema definitions
- **routes/** - API endpoint definitions
- **services/** - Business logic and DB operations
- **socket/** - Real-time WebSocket handlers
- **utils/** - Helper functions and utilities
- **validations/** - Input validation schemas

### Frontend:
- **components/** - Reusable UI components
- **config/** - Frontend configuration
- **context/** - Global state management
- **pages/** - Full page components
- **routes/** - Routing configuration
- **services/** - API communication layer
- **layouts/** - Page layout templates

---

## 🎯 File Naming Conventions

### Backend:
- **Models:** PascalCase (User.js, Hospital.js)
- **Controllers:** camelCase + Controller (authController.js)
- **Services:** camelCase + Service (authService.js)
- **Routes:** camelCase + Routes (authRoutes.js)
- **Validations:** camelCase + Validation (authValidation.js)
- **Utilities:** camelCase (asyncHandler.js)

### Frontend:
- **Components:** PascalCase (Navbar.jsx)
- **Pages:** PascalCase (Emergency.jsx)
- **Services:** camelCase + Service (authService.js)
- **Utilities:** camelCase (helpers.js)

---

## 🔍 Finding Files

### Need to add a new feature?

1. **Database Schema:** `server/src/models/`
2. **Business Logic:** `server/src/services/`
3. **API Endpoint:** `server/src/routes/`
4. **Request Handler:** `server/src/controllers/`
5. **Validation:** `server/src/validations/`
6. **Frontend UI:** `client/src/pages/` or `client/src/components/`
7. **API Call:** `client/src/services/`

### Need to modify configuration?

1. **Environment:** `.env` files
2. **Database:** `server/src/config/database.js`
3. **Security:** `server/src/middleware/security.js`
4. **API URLs:** `client/src/config/api.js`

### Need to fix a bug?

1. **Backend error:** Check `server/src/middleware/errorHandler.js`
2. **Frontend error:** Check browser console and React components
3. **Socket error:** Check `server/src/socket/` and `client/src/services/socketService.js`
4. **Auth error:** Check `server/src/middleware/auth.js` and `client/src/context/AuthContext.jsx`

---

## 📚 Related Documentation

- **Installation:** `/INSTALLATION_GUIDE.md`
- **API Reference:** `/server/API_DOCUMENTATION.md`
- **Socket.IO:** `/server/SOCKET_IMPLEMENTATION.md`
- **Deployment:** `/server/RENDER_DEPLOYMENT.md`
- **Complete Summary:** `/COMPLETE_PROJECT_SUMMARY.md`

---

**This structure follows best practices for scalable, maintainable full-stack applications.** 🏗️
