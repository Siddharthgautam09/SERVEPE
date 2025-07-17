
const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  servicesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  servicesCount: {
    type: Number,
    default: 0
  },
  subcategories: [subcategorySchema]
}, {
  timestamps: true
});

// Index for search
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ 'subcategories.name': 1 });

module.exports = mongoose.model('Category', categorySchema);
