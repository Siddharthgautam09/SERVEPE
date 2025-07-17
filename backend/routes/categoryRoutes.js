
const express = require('express');
const Category = require('../models/Category');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// Admin routes - protect all admin routes
router.use('/admin', protect);
router.use('/admin', restrictTo('admin'));

// Get all categories for admin (including inactive)
router.get('/admin', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// Create category
router.post('/admin', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating category'
    });
  }
});

// Update category
router.put('/admin/:id', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
});

// Delete category
router.delete('/admin/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
});

// Add subcategory to category
router.post('/admin/:id/subcategories', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if subcategory name already exists in this category
    const existingSubcategory = category.subcategories.find(sub => sub.name === name);
    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category'
      });
    }

    category.subcategories.push({ name, description });
    await category.save();

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding subcategory'
    });
  }
});

// Update subcategory
router.put('/admin/:id/subcategories/:subcategoryId', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const subcategory = category.subcategories.id(req.params.subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    subcategory.name = name;
    subcategory.description = description;
    subcategory.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subcategory'
    });
  }
});

// Delete subcategory
router.delete('/admin/:id/subcategories/:subcategoryId', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const subcategory = category.subcategories.id(req.params.subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    subcategory.deleteOne();
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting subcategory'
    });
  }
});

module.exports = router;
