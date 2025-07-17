const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required']
  },
  subcategory: {
    type: String,
    required: true
  },
  tags: [String],
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer is required']
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  pricingPlans: {
    basic: {
      title: String,
      description: String,
      price: { type: Number, required: true },
      deliveryTime: Number, // in days
      revisions: Number,
      features: [String]
    },
    standard: {
      title: String,
      description: String,
      price: Number,
      deliveryTime: Number,
      revisions: Number,
      features: [String]
    },
    premium: {
      title: String,
      description: String,
      price: Number,
      deliveryTime: Number,
      revisions: Number,
      features: [String]
    }
  },
  addOns: [{
    title: String,
    description: String,
    price: Number,
    deliveryTime: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'paused', 'rejected'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rejectionReason: String,
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  orders: {
    type: Number,
    default: 0
  },
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

// Indexes
serviceSchema.index({ freelancer: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ averageRating: -1 });
serviceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Service', serviceSchema);