# SERVPE Deployment Guide

## Prerequisites

- Node.js 18+ 
- MongoDB 6+
- Git
- PM2 (for production)

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd work-hub-arena-57-main
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Variables
Create `.env` file in the backend directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/servpe

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary (for production file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OTPless Configuration
OTPLESS_CLIENT_ID=your_otpless_client_id
OTPLESS_CLIENT_SECRET=your_otpless_client_secret

# CORS Origins
FRONTEND_URL=http://localhost:8081
ADMIN_URL=http://localhost:5000
```

#### Start Backend Server
```bash
# Development
npm run dev

# Production
npm start
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Variables
Create `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### Start Frontend Server
```bash
# Development
npm run dev

# Production Build
npm run build
```

### 4. Admin Panel Setup

#### Install Dependencies
```bash
cd admin
npm install
```

#### Environment Variables
Create `.env` file in the admin directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

#### Start Admin Panel
```bash
# Development
npm run dev

# Production Build
npm run build
```

## Database Setup

### 1. MongoDB Installation

#### Local Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS
brew install mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community
```

#### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

### 2. Database Initialization
```bash
cd backend
node scripts/seedDatabase.js
```

## Google OAuth Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API

### 2. Create OAuth Credentials
1. Go to "Credentials" section
2. Create OAuth 2.0 Client ID
3. Add authorized origins:
   - `http://localhost:8081`
   - `http://localhost:5000`
4. Add authorized redirect URIs:
   - `http://localhost:8081`
   - `http://localhost:5000`

### 3. Update Environment Variables
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_WEB_CLIENT_ID=your_web_client_id
```

## Email Setup (Gmail)

### 1. Enable 2-Factor Authentication
1. Go to Google Account settings
2. Enable 2-Factor Authentication

### 2. Generate App Password
1. Go to Security settings
2. Generate App Password for "Mail"
3. Use this password in `SMTP_PASS`

### 3. Update Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Production Deployment

### 1. Backend Deployment

#### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name "servpe-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t servpe-backend .
docker run -p 8080:8080 servpe-backend
```

### 2. Frontend Deployment

#### Using Nginx
```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/servpe-frontend;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Using Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

### 3. Admin Panel Deployment

#### Using Nginx
```nginx
server {
    listen 80;
    server_name admin.your-domain.com;

    location / {
        root /var/www/servpe-admin;
        try_files $uri $uri/ /index.html;
    }
}
```

## SSL/HTTPS Setup

### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d admin.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring & Logs

### PM2 Monitoring
```bash
# View logs
pm2 logs servpe-backend

# Monitor processes
pm2 monit

# Restart application
pm2 restart servpe-backend
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## Backup Strategy

### Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://localhost:27017/servpe" --out="/backups/servpe_$DATE"

# Add to crontab for daily backups
0 2 * * * /path/to/backup-script.sh
```

### File Uploads Backup
```bash
# Backup uploads directory
rsync -av /path/to/uploads/ /backup/uploads/
```

## Security Checklist

### Backend Security
- [ ] Use strong JWT secret
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Use HTTPS in production
- [ ] Set secure headers
- [ ] Enable CORS properly
- [ ] Use environment variables

### Database Security
- [ ] Enable authentication
- [ ] Use strong passwords
- [ ] Restrict network access
- [ ] Regular backups
- [ ] Monitor connections

### Frontend Security
- [ ] Use HTTPS
- [ ] Validate forms
- [ ] Sanitize user inputs
- [ ] Secure API calls
- [ ] Handle errors gracefully

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if port is in use
lsof -i :8080

# Check MongoDB connection
mongo servpe --eval "db.stats()"

# Check environment variables
node -e "console.log(process.env.MONGODB_URI)"
```

#### Frontend Build Issues
```bash
# Clear cache
npm run build -- --force

# Check dependencies
npm audit fix

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Check connection string
mongo "mongodb://localhost:27017/servpe"

# Check network connectivity
telnet localhost 27017
```

### Performance Optimization

#### Backend
- Enable compression
- Use Redis for caching
- Optimize database queries
- Enable gzip compression

#### Frontend
- Enable code splitting
- Optimize images
- Use CDN for static assets
- Enable caching

## Support

For issues and support:
1. Check the logs
2. Review environment variables
3. Verify database connection
4. Check network connectivity
5. Review security settings

## Updates & Maintenance

### Regular Maintenance
- Update dependencies monthly
- Monitor disk space
- Check error logs
- Backup database weekly
- Update SSL certificates
- Monitor performance metrics 