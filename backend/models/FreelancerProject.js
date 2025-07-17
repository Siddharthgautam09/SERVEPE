
const mongoose = require('mongoose');

const freelancerProjectSchema = new mongoose.Schema({
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
      'Web Development',
      'Mobile Development',
      'Design & Creative',
      'Writing & Translation',
      'Marketing & SEO',
      'Video & Animation',
      'Data Science',
      'Consulting'
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
  hashtags: [{
    type: String,
    validate: {
      validator: function(tag) {
        return tag.startsWith('#');
      },
      message: 'Hashtags must start with #'
    }
  }],
  budget: {
    type: {
      type: String,
      enum: ['fixed', 'hourly']
    },
    amount: {
      min: Number,
      max: Number
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  duration: {
    type: String,
    enum: ['less-than-1-week', '1-2-weeks', '2-4-weeks', '1-3-months', 'more-than-3-months']
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    default: 'intermediate'
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Freelancer is required']
  },
  images: [{
    url: String,
    filename: String,
    originalName: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
freelancerProjectSchema.index({ freelancer: 1 });
freelancerProjectSchema.index({ status: 1 });
freelancerProjectSchema.index({ category: 1 });
freelancerProjectSchema.index({ subcategory: 1 });
freelancerProjectSchema.index({ skills: 1 });
freelancerProjectSchema.index({ hashtags: 1 });
freelancerProjectSchema.index({ createdAt: -1 });
freelancerProjectSchema.index({ views: -1 });
freelancerProjectSchema.index({ likes: -1 });

module.exports = mongoose.model('FreelancerProject', freelancerProjectSchema);
