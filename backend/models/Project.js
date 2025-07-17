
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: [
      'web-development',
      'mobile-development',
      'design',
      'writing',
      'marketing',
      'data-science',
      'consulting',
      'other'
    ]
  },
  subcategory: {
    type: String,
    required: [true, 'Project subcategory is required']
  },
  skills: [{
    type: String,
    required: true
  }],
  budget: {
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      required: true
    },
    amount: {
      min: Number,
      max: Number
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  duration: {
    type: String,
    enum: ['less-than-1-month', '1-3-months', '3-6-months', 'more-than-6-months'],
    required: [true, 'Project duration is required']
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    required: [true, 'Experience level is required']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'in-progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  attachments: [{
    name: String,
    url: String,
    size: Number,
    type: String
  }],
  proposals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal'
  }],
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'approved'],
      default: 'pending'
    },
    submittedAt: Date,
    approvedAt: Date
  }],
  startDate: Date,
  endDate: Date,
  completedAt: Date,
  rating: {
    clientRating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String
    },
    freelancerRating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String
    }
  }
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ client: 1 });
projectSchema.index({ freelancer: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
