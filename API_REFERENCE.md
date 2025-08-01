# SERVPE API Reference

## Base URL
```
http://localhost:8080/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

## Authentication Endpoints

### Send Email OTP
```http
POST /auth/send-email-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify Email OTP
```http
POST /auth/verify-email-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Send Phone OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

### Verify Phone OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

### Google OAuth Login
```http
POST /auth/google-login
Content-Type: application/json

{
  "credential": "google_oauth_credential"
}
```

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Admin Login
```http
POST /auth/admin-login
Content-Type: application/json

{
  "email": "admin@servpe.com",
  "password": "admin_password"
}
```

### Logout
```http
GET /auth/logout
Authorization: Bearer <token>
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Select Role
```http
POST /auth/select-role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "freelancer"
}
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Professional freelancer"
}
```

### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## Service Endpoints

### Get All Services (Public)
```http
GET /services?category=web-development&minPrice=100&maxPrice=1000&page=1&limit=12
```

Query Parameters:
- `category`: Filter by category
- `subcategory`: Filter by subcategory
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `rating`: Minimum rating filter
- `deliveryTime`: Maximum delivery time
- `search`: Search in title, description, tags
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `sortBy`: Sort field (createdAt, title, averageRating, pricingPlans.basic.price)
- `sortOrder`: Sort direction (asc, desc)

### Get Single Service (Public)
```http
GET /services/:id
```

### Get My Services (Freelancer Only)
```http
GET /services/my/services?status=active&page=1&limit=10
Authorization: Bearer <token>
```

Query Parameters:
- `status`: Filter by status (active, paused, draft)
- `page`: Page number
- `limit`: Items per page

### Create Service (Freelancer Only)
```http
POST /services
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
    },
    "standard": {
      "title": "Standard",
      "description": "Standard package",
      "price": 250,
      "deliveryTime": 5,
      "revisions": 3,
      "features": ["Responsive design", "SEO optimization", "CMS integration"]
    },
    "premium": {
      "title": "Premium",
      "description": "Premium package",
      "price": 500,
      "deliveryTime": 7,
      "revisions": 5,
      "features": ["Responsive design", "SEO optimization", "CMS integration", "Analytics setup", "Performance optimization"]
    }
  },
  "images": [File1, File2, File3]
}
```

### Update Service (Freelancer Only)
```http
PUT /services/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Service Title",
  "description": "Updated description",
  "pricingPlans": {
    "basic": {
      "price": 150
    }
  }
}
```

### Delete Service (Freelancer Only)
```http
DELETE /services/:id
Authorization: Bearer <token>
```

### Upload Service Images (Freelancer Only)
```http
POST /services/:id/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "images": [File1, File2]
}
```

### Get Service Analytics (Freelancer Only)
```http
GET /services/:id/analytics
Authorization: Bearer <token>
```

## User Endpoints

### Get All Users (Admin Only)
```http
GET /users?role=freelancer&page=1&limit=10
Authorization: Bearer <token>
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio"
}
```

### Delete User (Admin Only)
```http
DELETE /users/:id
Authorization: Bearer <token>
```

### Search Users
```http
GET /users/search?q=john&role=freelancer
Authorization: Bearer <token>
```

### Get All Freelancers
```http
GET /users/freelancers?skills=react&page=1&limit=10
Authorization: Bearer <token>
```

### Get All Clients
```http
GET /users/clients?page=1&limit=10
Authorization: Bearer <token>
```

## Order Endpoints

### Get Orders (Role-based)
```http
GET /orders?status=completed&page=1&limit=10
Authorization: Bearer <token>
```

### Get Order Details
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": "service_id",
  "pricingPlan": "basic",
  "requirements": "Project requirements"
}
```

### Update Order Status
```http
PUT /orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Get My Orders
```http
GET /orders/my/orders?status=completed&page=1&limit=10
Authorization: Bearer <token>
```

## Message Endpoints

### Get Conversations
```http
GET /messages
Authorization: Bearer <token>
```

### Get Conversation Messages
```http
GET /messages/:conversationId
Authorization: Bearer <token>
```

### Send Message
```http
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user_id",
  "content": "Hello!",
  "orderId": "order_id" // optional
}
```

### Mark Message as Read
```http
PUT /messages/:id/read
Authorization: Bearer <token>
```

## Project Endpoints

### Get All Projects
```http
GET /projects?category=web-development&budget=1000&page=1&limit=10
```

### Get Project Details
```http
GET /projects/:id
```

### Create Project (Client Only)
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Website Development Project",
  "description": "Need a professional website",
  "category": "web-development",
  "budget": 1000,
  "deadline": "2024-12-31",
  "requirements": "Detailed requirements"
}
```

### Update Project
```http
PUT /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Project Title",
  "budget": 1500
}
```

### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer <token>
```

## Proposal Endpoints

### Get Proposals (Role-based)
```http
GET /proposals?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

### Get Proposal Details
```http
GET /proposals/:id
Authorization: Bearer <token>
```

### Submit Proposal (Freelancer Only)
```http
POST /proposals
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project_id",
  "proposal": "Detailed proposal",
  "budget": 800,
  "timeline": "2 weeks"
}
```

### Update Proposal
```http
PUT /proposals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "proposal": "Updated proposal",
  "budget": 900
}
```

### Accept Proposal (Client Only)
```http
PUT /proposals/:id/accept
Authorization: Bearer <token>
```

### Reject Proposal (Client Only)
```http
PUT /proposals/:id/reject
Authorization: Bearer <token>
```

## Admin Endpoints

### Get Dashboard Stats
```http
GET /admin/dashboard
Authorization: Bearer <token>
```

### Get All Users (Admin)
```http
GET /admin/users?role=freelancer&page=1&limit=10
Authorization: Bearer <token>
```

### Get All Services (Admin)
```http
GET /admin/services?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

### Get All Orders (Admin)
```http
GET /admin/orders?status=completed&page=1&limit=10
Authorization: Bearer <token>
```

### Update User Status (Admin)
```http
PUT /admin/users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "isActive": false
}
```

### Update Service Status (Admin)
```http
PUT /admin/services/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "active",
  "rejectionReason": null
}
```

## Category Endpoints

### Get All Categories
```http
GET /categories
```

### Create Category (Admin Only)
```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Web Development",
  "description": "Web development services",
  "icon": "code"
}
```

### Update Category (Admin Only)
```http
PUT /categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

### Delete Category (Admin Only)
```http
DELETE /categories/:id
Authorization: Bearer <token>
```

## Review Endpoints

### Get Reviews
```http
GET /reviews?serviceId=service_id&page=1&limit=10
```

### Get Review Details
```http
GET /reviews/:id
```

### Create Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id",
  "rating": 5,
  "comment": "Excellent work!"
}
```

### Update Review
```http
PUT /reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review"
}
```

### Delete Review
```http
DELETE /reviews/:id
Authorization: Bearer <token>
```

## Dashboard Endpoints

### Get Dashboard Stats
```http
GET /dashboard/stats
Authorization: Bearer <token>
```

### Get Analytics Data
```http
GET /dashboard/analytics?period=month
Authorization: Bearer <token>
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP
- File uploads: 10 requests per hour per user

## File Upload Limits
- Maximum file size: 5MB
- Maximum files per upload: 5
- Supported formats: jpg, jpeg, png, gif, webp
- Storage: Local filesystem + Cloudinary (production) 