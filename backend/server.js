const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { socketAuth, handleConnection } = require('./socket/socketHandler');

// Debug environment variables
console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_WEB_CLIENT_ID available:', !!process.env.GOOGLE_WEB_CLIENT_ID);
console.log('GOOGLE_CLIENT_ID available:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET available:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
console.log('MONGODB_URI available:', !!process.env.MONGODB_URI);
console.log('Total env vars count:', Object.keys(process.env).length);
console.log('Google-related env vars:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
console.log('===================================');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const freelancerProjectRoutes = require('./routes/freelancerProjectRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviews=require('./routes/reviewRoutes');
const app = express();
const server = http.createServer(app);

// Socket.IO setup with enhanced configuration
const io = socketIo(server, {
  cors: {
    origin: [ "http://localhost:8081","http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

console.log('Socket.IO server configured');

// Socket authentication and connection handling
io.use(socketAuth);
io.on('connection', (socket) => handleConnection(io, socket));

// Middleware
app.use(cors({
  origin: [ "http://localhost:8081","http://localhost:5000"],
  credentials: true
}));
app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ extended: true, limit: '2gb' }));

// Serve static files (local file storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.set('io', io);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/servpe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Create upload directories if they don't exist
const fs = require('fs');
const uploadDirs = [
  'uploads', 
  'uploads/profiles', 
  'uploads/services', 
  'uploads/portfolio', 
  'uploads/deliverables',
  'uploads/order-requirements',
  'uploads/general',
  'uploads/freelancer-projects'
];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created upload directory: ${dir}`);
    } catch (error) {
      console.error(`❌ Failed to create upload directory ${dir}:`, error);
    }
  } else {
    console.log(`✅ Upload directory exists: ${dir}`);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/freelancer-projects', freelancerProjectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviews);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Servpe API is running', 
    timestamp: new Date(),
    version: '1.0.0',
    environment: {
      googleClientIdConfigured: !!process.env.GOOGLE_WEB_CLIENT_ID || !!process.env.GOOGLE_CLIENT_ID,
      jwtSecretConfigured: !!process.env.JWT_SECRET,
      mongoUriConfigured: !!process.env.MONGODB_URI
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Servpe server is running on port ${PORT}`);
  console.log(`Socket.IO server is ready`);
  console.log(`File uploads stored locally in ./uploads/`);
  console.log(`CORS configured for: http://localhost:8081`);
});

module.exports = app;