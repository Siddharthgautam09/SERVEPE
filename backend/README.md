
# FreelanceHub Backend API

A comprehensive Node.js backend API for the FreelanceHub freelancing platform.

## Features

- **User Authentication & Authorization** (JWT-based)
- **Role-based Access Control** (Client, Freelancer, Admin)
- **Project Management** (CRUD operations)
- **Proposal System** (Submit and manage proposals)
- **User Profiles** (Skills, portfolio, ratings)
- **Admin Dashboard** (Platform management)
- **File Upload Support** (Profile pictures, attachments)
- **Search & Filtering** (Projects, freelancers)
- **Email Notifications** (Account verification, project updates)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   # Using local MongoDB
   mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Seed Database** (Optional)
   ```bash
   npm run seed
   ```

5. **Start Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Projects
- `GET /api/projects` - Get all projects (with filters)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Client only)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/my/projects` - Get user's projects

### Proposals
- `GET /api/proposals/project/:projectId` - Get project proposals
- `POST /api/proposals/project/:projectId` - Submit proposal (Freelancer only)
- `PUT /api/proposals/:id` - Update proposal
- `DELETE /api/proposals/:id` - Delete proposal

### Users
- `GET /api/users/freelancers` - Get freelancers
- `GET /api/users/profile/:id` - Get user profile

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/projects` - Get all projects

## Database Schema

### User Model
- Personal information (name, email, phone)
- Role-based fields (client/freelancer/admin)
- Freelancer-specific (skills, hourly rate, portfolio)
- Authentication (password, tokens)
- Profile data (bio, experience, education)
- Ratings and reviews

### Project Model
- Project details (title, description, category)
- Budget and timeline information
- Required skills and experience level
- Client and freelancer references
- Project status and milestones
- Attachments and proposals

### Proposal Model
- Freelancer proposal details
- Proposed budget and timeline
- Cover letter and attachments
- Status tracking (pending/accepted/rejected)

## Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Role-based Authorization** middleware
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet** for security headers

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Seed database with sample data
npm run seed
```

## Production Deployment

1. Set environment variables
2. Ensure MongoDB is accessible
3. Configure HTTPS and security headers
4. Set up process management (PM2)
5. Configure reverse proxy (Nginx)
6. Set up monitoring and logging

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/freelancehub
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.
