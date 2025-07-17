
const Project = require('../models/Project');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const { 
      category, 
      skills, 
      experienceLevel, 
      budget,
      duration,
      search,
      page = 1, 
      limit = 12 
    } = req.query;

    const filter = { status: 'open' };
    
    if (category) filter.category = category;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (duration) filter.duration = duration;
    
    if (skills) {
      filter.skills = { $in: skills.split(',') };
    }
    
    if (budget) {
      const [min, max] = budget.split('-').map(Number);
      filter['budget.amount.min'] = { $gte: min };
      if (max) filter['budget.amount.max'] = { $lte: max };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const projects = await Project.find(filter)
      .populate('client', 'firstName lastName location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Project.countDocuments(filter);

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
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'firstName lastName location rating')
      .populate('freelancer', 'firstName lastName profilePicture rating')
      .populate({
        path: 'proposals',
        populate: {
          path: 'freelancer',
          select: 'firstName lastName profilePicture rating skills'
        }
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

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

// Create project
exports.createProject = async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      client: req.user.id,
      status: 'open'
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

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

// Get user's projects
exports.getMyProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { client: req.user.id };
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate('freelancer', 'firstName lastName profilePicture rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Project.countDocuments(filter);

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
