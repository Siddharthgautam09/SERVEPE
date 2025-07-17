
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freelancehub');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@freelancehub.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    // Create sample client
    const clientUser = await User.create({
      firstName: 'John',
      lastName: 'Client',
      email: 'client@example.com',
      password: 'client123',
      role: 'client',
      isVerified: true,
      location: {
        country: 'USA',
        city: 'New York'
      }
    });

    // Create sample freelancers
    const freelancer1 = await User.create({
      firstName: 'Sarah',
      lastName: 'Developer',
      email: 'sarah@example.com',
      password: 'freelancer123',
      role: 'freelancer',
      isVerified: true,
      skills: [
        { name: 'React', level: 'expert' },
        { name: 'Node.js', level: 'intermediate' },
        { name: 'JavaScript', level: 'expert' }
      ],
      hourlyRate: 75,
      bio: 'Full-stack developer with 5+ years of experience',
      rating: { average: 4.8, count: 25 },
      location: {
        country: 'Canada',
        city: 'Toronto'
      }
    });

    const freelancer2 = await User.create({
      firstName: 'Mike',
      lastName: 'Designer',
      email: 'mike@example.com',
      password: 'freelancer123',
      role: 'freelancer',
      isVerified: true,
      skills: [
        { name: 'UI/UX Design', level: 'expert' },
        { name: 'Figma', level: 'expert' },
        { name: 'Adobe Creative Suite', level: 'intermediate' }
      ],
      hourlyRate: 60,
      bio: 'Creative designer specializing in user interfaces',
      rating: { average: 4.9, count: 18 },
      location: {
        country: 'UK',
        city: 'London'
      }
    });

    // Create sample projects
    const project1 = await Project.create({
      title: 'E-commerce Website Development',
      description: 'Need a modern e-commerce website built with React and Node.js. The site should have user authentication, product catalog, shopping cart, and payment integration.',
      category: 'web-development',
      subcategory: 'Full Stack Development',
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      budget: {
        type: 'fixed',
        amount: { min: 2000, max: 3500 },
        currency: 'USD'
      },
      duration: '1-3-months',
      experienceLevel: 'intermediate',
      client: clientUser._id,
      status: 'open'
    });

    const project2 = await Project.create({
      title: 'Mobile App UI/UX Design',
      description: 'Looking for a talented designer to create UI/UX designs for a fitness tracking mobile app. Need wireframes, mockups, and interactive prototypes.',
      category: 'design',
      subcategory: 'Mobile App Design',
      skills: ['UI/UX Design', 'Figma', 'Mobile Design', 'Prototyping'],
      budget: {
        type: 'fixed',
        amount: { min: 1500, max: 2500 },
        currency: 'USD'
      },
      duration: 'less-than-1-month',
      experienceLevel: 'expert',
      client: clientUser._id,
      status: 'open'
    });

    console.log('✅ Database seeded successfully!');
    console.log('\nSample Users Created:');
    console.log('Admin: admin@freelancehub.com / admin123');
    console.log('Client: client@example.com / client123');
    console.log('Freelancer 1: sarah@example.com / freelancer123');
    console.log('Freelancer 2: mike@example.com / freelancer123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
