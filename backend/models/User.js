const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name']
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phoneNumber: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
  },
  whatsappNumber: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty/null values
        // Allow numbers with or without country code, 10-15 digits
        return /^[\+]?[1-9][\d]{9,14}$/.test(v);
      },
      message: 'Please provide a valid WhatsApp number (10-15 digits)'
    }
  },
  role: {
    type: String,
    enum: ['client', 'freelancer', 'admin'],
    default: 'client'
  },
  roleSelected: {
    type: Boolean,
    default: false
  },
  authProvider: {
    type: String,
    enum: ['otpless', 'google', 'email'],
    default: 'email'
  },
  otplessUserId: String,
  googleId: String,
  requirementsCompleted: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: '/uploads/default-profile.jpg'
  },
  
  // Enhanced freelancer fields
  title: String,
  tagline: String,
  location: {
    type: mongoose.Schema.Types.Mixed // Can be string or object
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'intermediate'
    }
  }],
  expertise: [String],
  hourlyRate: Number,
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    projectUrl: String
  }],
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  experience: String,
  totalExperienceYears: Number,
  companyBrand: String,
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: Number,
    endYear: Number
  }],
  socialLinks: {
    website: String,
    linkedin: String,
    instagram: String,
    twitter: String,
    youtube: String,
    facebook: String,
    github: String
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  
  // Legacy fields for backward compatibility
  interests: [String],
  verificationToken: String,
  verificationTokenExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  freelancerProfile: {
    jobTitle: String,
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'entry'
    },
    hourlyRate: {
      type: Number,
      default: 20
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'not_available'],
      default: 'available'
    },
    education: [{
      degree: String,
      university: String,
      graduationYear: Number
    }],
    certifications: [String],
    portfolio: [{
      title: String,
      description: String,
      imageUrl: String,
      projectUrl: String
    }],
    socialLinks: {
      linkedIn: String,
      twitter: String,
      website: String,
      github: String
    },
    paymentPreferences: {
      type: String,
      enum: ['paypal', 'bank_transfer', 'other'],
      default: 'paypal'
    },
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native'],
        default: 'conversational'
      }
    }],
    timeZone: String,
    preferredCommunication: {
      type: String,
      enum: ['chat', 'video_call', 'phone_call'],
      default: 'chat'
    },
    responseTime: {
      type: String,
      enum: ['within_1_hour', 'within_few_hours', 'within_a_day'],
      default: 'within_few_hours'
    }
  },
  
  // Rating fields
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
// Remove problematic phone field and ensure clean data
userSchema.pre('save', function(next) {
  // Remove any 'phone' field that might exist to prevent conflicts
  if (this.phone !== undefined) {
    this.phone = undefined;
  }
  // Also remove from the document if it exists
  if (this.toObject().phone !== undefined) {
    this.unset('phone');
  }
  next();
});

// Create proper sparse indexes - only for fields we actually use
userSchema.index({ email: 1 }, { sparse: true, unique: true });
userSchema.index({ phoneNumber: 1 }, { sparse: true, unique: true });
userSchema.index({ username: 1 }, { sparse: true, unique: true });
userSchema.index({ otplessUserId: 1 }, { sparse: true, unique: true });
userSchema.index({ googleId: 1 }, { sparse: true, unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ 'rating.average': -1 });

// Hash password before saving (only for email auth)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate full name virtual
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });

// Static method to clean up problematic indexes
userSchema.statics.cleanupIndexes = async function() {
  try {
    const collection = this.collection;
    const indexes = await collection.indexes();
    
    // Look for the problematic phone_1 index
    const phoneIndex = indexes.find(index => index.name === 'phone_1');
    if (phoneIndex) {
      console.log('Dropping problematic phone_1 index...');
      await collection.dropIndex('phone_1');
      console.log('Successfully dropped phone_1 index');
    }
  } catch (error) {
    console.log('Index cleanup error (this is usually safe to ignore):', error.message);
  }
};

const User = mongoose.model('User', userSchema);

// Clean up indexes when the model is first loaded
User.cleanupIndexes();

module.exports = User;