# SERVPE - Freelance Platform Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [Admin Panel Documentation](#admin-panel-documentation)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Authentication & Authorization](#authentication--authorization)
9. [File Upload System](#file-upload-system)
10. [Real-time Features](#real-time-features)
11. [Deployment](#deployment)

## Project Overview

**SERVPE** is a comprehensive freelance marketplace platform that connects clients with skilled freelancers. The platform supports service-based work, project-based work, messaging, reviews, and analytics.

### Key Features
- **Multi-role System**: Client, Freelancer, Admin
- **Service Marketplace**: Freelancers can create and sell services
- **Project System**: Clients can post projects, freelancers can submit proposals
- **Real-time Messaging**: Socket.IO based chat system
- **Review & Rating System**: Comprehensive feedback mechanism
- **Analytics Dashboard**: Performance tracking for freelancers
- **Admin Panel**: Complete platform management
- **File Upload System**: Support for images and documents
- **Payment Integration**: Order and checkout system

## Architecture

### Tech Stack

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Google OAuth, OTPless
- **File Upload**: Multer + Cloudinary
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Validation**: Express-validator

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form + Zod validation

#### Admin Panel
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Port**: 5000 (separate from main frontend)

### Project Structure
```
work-hub-arena-57-main/
├── backend/           # Node.js/Express API server
├── frontend/          # React TypeScript application
├── admin/            # React TypeScript admin panel
└── README.md
```

## Backend Documentation

### Project Structure
```
backend/
├── controllers/          # Business logic
├── models/              # MongoDB schemas
├── routes/              # API route definitions
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── socket/              # Socket.IO handlers
├── uploads/             # File storage
├── scripts/             # Database scripts
└── server.js            # Main server file
```

### Core Models

#### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  username: String (unique),
  email: String (unique, required),
  phoneNumber: String,
  whatsappNumber: String,
  role: ['client', 'freelancer', 'admin'],
  authProvider: ['otpless', 'google', 'email'],
  profilePicture: String,
  
  // Freelancer specific fields
  title: String,
  tagline: String,
  location: Mixed,
  skills: [{ name: String, level: String }],
  expertise: [String],
  hourlyRate: Number,
  portfolio: [{ title: String, description: String, imageUrl: String }],
  bio: String,
  experience: String,
  socialLinks: { website, linkedin, instagram, etc. },
  rating: { average: Number, count: Number },
  
  // System fields
  isActive: Boolean,
  isVerified: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

#### Service Model
```javascript
{
  title: String (required, max 100 chars),
  description: String (required, max 2000 chars),
  category: String (required),
  subcategory: String (required),
  tags: [String],
  freelancer: ObjectId (ref: User),
  
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  
  pricingPlans: {
    basic: {
      title: String,
      description: String,
      price: Number (required),
      deliveryTime: Number,
      revisions: Number,
      features: [String]
    },
    standard: { /* same structure */ },
    premium: { /* same structure */ }
  },
  
  addOns: [{
    title: String,
    description: String,
    price: Number,
    deliveryTime: Number
  }],
  
  status: ['draft', 'pending', 'active', 'paused', 'rejected'],
  isActive: Boolean,
  averageRating: Number,
  totalReviews: Number,
  impressions: Number,
  clicks: Number,
  orders: Number,
  timestamps: true
}
```

#### Order Model
```javascript
{
  service: ObjectId (ref: Service),
  client: ObjectId (ref: User),
  freelancer: ObjectId (ref: User),
  pricingPlan: String, // 'basic', 'standard', 'premium'
  amount: Number,
  status: ['pending', 'in_progress', 'completed', 'cancelled'],
  requirements: String,
  deliverables: [{
    title: String,
    description: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  messages: [ObjectId (ref: Message)],
  reviews: [ObjectId (ref: Review)],
  timestamps: true
}
```

### API Routes Structure

#### Authentication Routes (`/api/auth`)
- `POST /send-email-otp` - Send email OTP
- `POST /verify-email-otp` - Verify email OTP
- `POST /send-otp` - Send phone OTP
- `POST /verify-otp` - Verify phone OTP
- `POST /google-login` - Google OAuth login
- `POST /register` - Traditional registration
- `POST /login` - Traditional login
- `POST /admin-login` - Admin login
- `GET /logout` - Logout
- `GET /me` - Get current user
- `POST /select-role` - Select user role
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password

#### Service Routes (`/api/services`)
- `GET /` - Get all services (public)
- `GET /:id` - Get single service (public)
- `GET /my/services` - Get freelancer's services (protected)
- `POST /` - Create service (freelancer only)
- `PUT /:id` - Update service (freelancer only)
- `DELETE /:id` - Delete service (freelancer only)
- `POST /:id/images` - Upload service images (freelancer only)
- `GET /:id/analytics` - Get service analytics (freelancer only)

#### User Routes (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (admin only)
- `GET /search` - Search users
- `GET /freelancers` - Get all freelancers
- `GET /clients` - Get all clients

#### Order Routes (`/api/orders`)
- `GET /` - Get orders (role-based)
- `GET /:id` - Get order details
- `POST /` - Create order
- `PUT /:id` - Update order status
- `GET /my/orders` - Get user's orders

#### Message Routes (`/api/messages`)
- `GET /` - Get conversations
- `GET /:conversationId` - Get conversation messages
- `POST /` - Send message
- `PUT /:id/read` - Mark message as read

#### Project Routes (`/api/projects`)
- `GET /` - Get all projects
- `GET /:id` - Get project details
- `POST /` - Create project (client only)
- `PUT /:id` - Update project
- `DELETE /:id` - Delete project

#### Proposal Routes (`/api/proposals`)
- `GET /` - Get proposals (role-based)
- `GET /:id` - Get proposal details
- `POST /` - Submit proposal (freelancer only)
- `PUT /:id` - Update proposal
- `PUT /:id/accept` - Accept proposal (client only)
- `PUT /:id/reject` - Reject proposal (client only)

#### Admin Routes (`/api/admin`)
- `GET /dashboard` - Admin dashboard stats
- `GET /users` - Get all users
- `GET /services` - Get all services
- `GET /orders` - Get all orders
- `PUT /users/:id/status` - Update user status
- `PUT /services/:id/status` - Update service status

#### Category Routes (`/api/categories`)
- `GET /` - Get all categories
- `POST /` - Create category (admin only)
- `PUT /:id` - Update category (admin only)
- `DELETE /:id` - Delete category (admin only)

#### Review Routes (`/api/reviews`)
- `GET /` - Get reviews
- `GET /:id` - Get review details
- `POST /` - Create review
- `PUT /:id` - Update review
- `DELETE /:id` - Delete review

## Frontend Documentation

### Project Structure
```
frontend/
├── src/
│   ├── api/              # API service functions
│   ├── components/       # Reusable components
│   │   ├── ui/          # shadcn/ui components
│   │   └── ...          # Custom components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── App.tsx          # Main app component
├── public/              # Static assets
└── package.json
```

### Key Components

#### Authentication Context
```typescript
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}
```

#### API Service Structure
Each API module follows this pattern:
```typescript
export const serviceAPI = {
  async getAllServices(params?: any): Promise<ApiResponse<Service[]>>,
  async getService(id: string): Promise<ApiResponse<Service>>,
  async createService(serviceData: any): Promise<ApiResponse<Service>>,
  async updateService(id: string, data: any): Promise<ApiResponse<Service>>,
  async deleteService(id: string): Promise<ApiResponse<void>>
};
```

### Routing Structure

#### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/otp-login` - OTP login
- `/email-otp-login` - Email OTP login
- `/sign-up` - Registration
- `/services` - Services marketplace
- `/services/:id` - Service details
- `/:username` - User profile

#### Protected Routes
- `/dashboard` - Role-based dashboard redirect
- `/role-selection` - Role selection
- `/onboarding` - User onboarding
- `/profile` - User profile

#### Freelancer Routes
- `/freelancer/dashboard` - Freelancer dashboard
- `/freelancer/orders` - Order management
- `/create-service` - Service creation
- `/my-services` - Service management
- `/post-project` - Project posting
- `/freelancer-projects` - Project management

#### Client Routes
- `/client/dashboard` - Client dashboard
- `/client/orders` - Order history

#### Sidebar Menu Routes
- `/testimonials` - Testimonials
- `/analytics` - Analytics dashboard
- `/payout` - Payout management
- `/account` - Account settings
- `/whats-new` - Platform updates

## Admin Panel Documentation

### Project Structure
```
admin/
├── src/
│   ├── pages/           # Admin pages
│   │   ├── Dashboard.tsx
│   │   ├── Categories.tsx
│   │   ├── Users.tsx
│   │   ├── Services.tsx
│   │   └── Orders.tsx
│   ├── components/      # Admin components
│   └── App.tsx
└── package.json
```

### Admin Features
- **Dashboard**: Platform statistics and analytics
- **User Management**: View, edit, and manage users
- **Service Management**: Approve, reject, and manage services
- **Order Management**: Track and manage orders
- **Category Management**: Manage service categories

## API Reference

### Authentication Endpoints

#### Send Email OTP
```http
POST /api/auth/send-email-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify Email OTP
```http
POST /api/auth/verify-email-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Service Endpoints

#### Get All Services
```http
GET /api/services?category=web-development&minPrice=100&maxPrice=1000&page=1&limit=12
```

#### Create Service
```http
POST /api/services
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Web Development Service",
  "description": "Professional web development",
  "category": "web-development",
  "subcategory": "frontend",
  "tags": ["react", "typescript"],
  "pricingPlans": {
    "basic": {
      "title": "Basic",
      "description": "Basic package",
      "price": 100,
      "deliveryTime": 3,
      "revisions": 2,
      "features": ["Responsive design", "Basic SEO"]
    }
  },
  "images": [File1, File2]
}
```

#### Get My Services
```http
GET /api/services/my/services?status=active&page=1&limit=10
Authorization: Bearer <token>
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": "service_id",
  "pricingPlan": "basic",
  "requirements": "Project requirements"
}
```

#### Get My Orders
```http
GET /api/orders/my/orders?status=completed&page=1&limit=10
Authorization: Bearer <token>
```

### Message Endpoints

#### Get Conversations
```http
GET /api/messages
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_id",
  "content": "Hello!",
  "orderId": "order_id" // optional
}
```

## Database Schema

### Indexes
```javascript
// User indexes
{ email: 1 } // unique, sparse
{ phoneNumber: 1 } // unique, sparse
{ username: 1 } // unique, sparse
{ role: 1 }
{ 'skills.name': 1 }
{ 'rating.average': -1 }

// Service indexes
{ freelancer: 1 }
{ category: 1 }
{ status: 1 }
{ isActive: 1 }
{ averageRating: -1 }
{ createdAt: -1 }

// Order indexes
{ client: 1 }
{ freelancer: 1 }
{ service: 1 }
{ status: 1 }
{ createdAt: -1 }
```

## Authentication & Authorization

### JWT Token Structure
```javascript
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "freelancer",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Middleware
- `protect` - Verify JWT token
- `restrictTo(role)` - Role-based access control
- `validateRegistration` - Registration validation
- `validateLogin` - Login validation

### Auth Providers
1. **Email/Password**: Traditional authentication
2. **Google OAuth**: Google sign-in integration
3. **OTPless**: Phone number OTP authentication
4. **Email OTP**: Email-based OTP authentication

## File Upload System

### Configuration
- **Local Storage**: Files stored in `uploads/` directory
- **Cloud Storage**: Cloudinary integration for production
- **File Limits**: 5MB per file, 5 files per upload
- **Supported Types**: Images only (jpg, png, gif, webp)

### Upload Endpoints
- `/api/services/:id/images` - Service images
- `/api/users/profile-picture` - Profile pictures
- `/api/orders/:id/deliverables` - Order deliverables

### File Structure
```
uploads/
├── profiles/           # User profile pictures
├── services/          # Service images
├── portfolio/         # Portfolio images
├── deliverables/      # Order deliverables
├── general/          # General uploads
└── freelancer-projects/ # Project files
```

## Real-time Features

### Socket.IO Implementation
```javascript
// Server setup
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:8081", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Authentication middleware
io.use(socketAuth);

// Connection handling
io.on('connection', (socket) => handleConnection(io, socket));
```

### Real-time Events
- **Message Events**: Send/receive messages
- **Order Updates**: Order status changes
- **Notification Events**: System notifications
- **Presence Events**: Online/offline status

### Client Implementation
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080', {
  auth: {
    token: localStorage.getItem('token')
  }
});

socket.on('message', (data) => {
  // Handle incoming message
});

socket.emit('send_message', {
  recipientId: 'user_id',
  content: 'Hello!'
});
```

## Deployment

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/servpe

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (for production)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Server
PORT=8080
NODE_ENV=development
```

### Build Commands
```bash
# Backend
cd backend
npm install
npm run dev  # Development
npm start    # Production

# Frontend
cd frontend
npm install
npm run dev  # Development
npm run build # Production

# Admin Panel
cd admin
npm install
npm run dev  # Development
npm run build # Production
```

### Port Configuration
- **Backend API**: 8080
- **Frontend**: 8081 (Vite default)
- **Admin Panel**: 5000

### CORS Configuration
```javascript
app.use(cors({
  origin: ["http://localhost:8081", "http://localhost:5000"],
  credentials: true
}));
```

## Development Guidelines

### Code Style
- **Backend**: ES6+ with async/await
- **Frontend**: TypeScript with React hooks
- **Database**: Mongoose schemas with validation
- **API**: RESTful design with consistent response format

### Error Handling
```javascript
// Standard API response format
{
  success: boolean,
  data?: any,
  message?: string,
  error?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

### Validation
- **Backend**: Express-validator middleware
- **Frontend**: React Hook Form + Zod
- **Database**: Mongoose schema validation

### Security
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Rate limiting (recommended for production)

---

This documentation provides a comprehensive overview of the SERVPE platform architecture, APIs, and implementation details. For specific implementation questions, refer to the source code in the respective directories. 