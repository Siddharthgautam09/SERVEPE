const FreelancerProject = require('../models/FreelancerProject');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, '../uploads/freelancer-projects');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// Get all freelancer projects
exports.getAllFreelancerProjects = async (req, res) => {
  try {
    const { 
      category, 
      subcategory,
      skills, 
      hashtags,
      search,
      sort = 'newest',
      page = 1, 
      limit = 12 
    } = req.query;

    const filter = { status: 'active' };
    
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    
    if (skills) {
      filter.skills = { $in: skills.split(',') };
    }
    
    if (hashtags) {
      filter.hashtags = { $in: hashtags.split(',') };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { hashtags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    let sortQuery = {};
    switch (sort) {
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'popular':
        sortQuery = { views: -1, likes: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const projects = await FreelancerProject.find(filter)
      .populate('freelancer', 'firstName lastName profilePicture rating location')
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    const total = await FreelancerProject.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get freelancer projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching freelancer projects'
    });
  }
};

// Get single freelancer project
exports.getFreelancerProject = async (req, res) => {
  try {
    const project = await FreelancerProject.findById(req.params.id)
      .populate('freelancer', 'firstName lastName profilePicture rating location bio skills');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Increment view count
    project.views = (project.views || 0) + 1;
    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    });
  }
};

// Create freelancer project
exports.createFreelancerProject = async (req, res) => {
  try {
    // Ensure upload directory exists
    ensureUploadDir();

    const projectData = {
      ...req.body,
      freelancer: req.user.id,
      status: 'active'
    };

    // Parse JSON strings
    if (req.body.skills) {
      projectData.skills = JSON.parse(req.body.skills);
    }
    if (req.body.hashtags) {
      projectData.hashtags = JSON.parse(req.body.hashtags);
    }
    if (req.body.budget) {
      projectData.budget = JSON.parse(req.body.budget);
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      projectData.images = req.files.map(file => ({
        url: `/uploads/freelancer-projects/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
    }

    const project = await FreelancerProject.create(projectData);

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project posted successfully'
    });
  } catch (error) {
    console.error('Create freelancer project error:', error);
    
    // Clean up uploaded files if project creation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads/freelancer-projects/', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// Update freelancer project
exports.updateFreelancerProject = async (req, res) => {
  try {
    const project = await FreelancerProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.freelancer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = { ...req.body };

    // Parse JSON strings
    if (req.body.skills) {
      updateData.skills = JSON.parse(req.body.skills);
    }
    if (req.body.hashtags) {
      updateData.hashtags = JSON.parse(req.body.hashtags);
    }
    if (req.body.budget) {
      updateData.budget = JSON.parse(req.body.budget);
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/freelancer-projects/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
      
      // Keep existing images and add new ones
      updateData.images = [...(project.images || []), ...newImages];
    }

    const updatedProject = await FreelancerProject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error('Update freelancer project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Delete freelancer project
exports.deleteFreelancerProject = async (req, res) => {
  try {
    const project = await FreelancerProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.freelancer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete associated images
    if (project.images && project.images.length > 0) {
      project.images.forEach(image => {
        const filePath = path.join(__dirname, '../uploads/freelancer-projects/', image.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await FreelancerProject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project'
    });
  }
};

// Get user's freelancer projects
exports.getMyFreelancerProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { freelancer: req.user.id };
    if (status) filter.status = status;

    const projects = await FreelancerProject.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await FreelancerProject.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
};
