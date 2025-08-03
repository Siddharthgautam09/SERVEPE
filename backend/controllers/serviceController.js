const Service = require('../models/Service');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      minPrice, 
      maxPrice, 
      rating, 
      deliveryTime,
      search,
      talentLevel,
      page = 1, 
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('Service filter params:', req.query);

    // Build filter object
    const filter = { status: 'active', isActive: true };
    
    if (category && category.trim()) filter.category = category.trim();
    if (subcategory && subcategory.trim()) filter.subcategory = subcategory.trim();
    
    // Rating filter
    if (rating && !isNaN(parseFloat(rating))) {
      filter.averageRating = { $gte: parseFloat(rating) };
    }
    
    // Price filter with validation
    if (minPrice || maxPrice) {
      filter['pricingPlans.basic.price'] = {};
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        filter['pricingPlans.basic.price'].$gte = parseFloat(minPrice);
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        filter['pricingPlans.basic.price'].$lte = parseFloat(maxPrice);
      }
    }
    
    // Delivery time filter with validation
    if (deliveryTime && !isNaN(parseInt(deliveryTime))) {
      filter['pricingPlans.basic.deliveryTime'] = { $lte: parseInt(deliveryTime) };
    }
    
    // Talent level filter
    if (talentLevel && Array.isArray(talentLevel) && talentLevel.length > 0) {
      // Map talent levels to freelancer rating ranges
      const talentLevelFilters = talentLevel.map(level => {
        switch (level) {
          case 'Fresher Freelancer':
            return { 'freelancer.rating.average': { $lt: 3.0 } };
          case 'Verified Freelancer':
            return { 'freelancer.rating.average': { $gte: 3.0, $lt: 4.0 } };
          case 'Top Rated Freelancer':
            return { 'freelancer.rating.average': { $gte: 4.0, $lt: 4.5 } };
          case 'Pro Talent':
            return { 'freelancer.rating.average': { $gte: 4.5 } };
          default:
            return {};
        }
      });
      
      if (talentLevelFilters.length > 0) {
        filter.$or = talentLevelFilters;
      }
    }
    
    // Search filter
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchFilter = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      };
      
      // If we already have $or for talent level, combine them
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          searchFilter
        ];
        delete filter.$or;
      } else {
        Object.assign(filter, searchFilter);
      }
    }

    console.log('Final filter:', JSON.stringify(filter, null, 2));

    // Pagination validation
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;
    
    // Sort validation
    const validSortFields = ['createdAt', 'title', 'averageRating', 'pricingPlans.basic.price'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortField] = sortDirection;

    const services = await Service.find(filter)
      .populate('freelancer', 'firstName lastName profilePicture rating')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Service.countDocuments(filter);

    console.log(`Found ${services.length} services out of ${total} total`);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single service
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('freelancer', 'firstName lastName profilePicture rating bio experience skills');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Increment impressions safely
    try {
      await Service.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
    } catch (updateError) {
      console.error('Error updating impressions:', updateError);
      // Don't fail the request if impression update fails
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create service - Enhanced with better validation and error handling
exports.createService = async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      freelancer: req.user.id,
      status: 'active',
      isActive: true
    };

    // Parse and validate pricing plans
    if (typeof serviceData.pricingPlans === 'string') {
      try {
        serviceData.pricingPlans = JSON.parse(serviceData.pricingPlans);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pricing plans format'
        });
      }
    }

    // Validate pricing plans structure
    if (serviceData.pricingPlans && typeof serviceData.pricingPlans === 'object') {
      const plans = ['basic', 'standard', 'premium'];
      for (const plan of plans) {
        if (serviceData.pricingPlans[plan]) {
          const planData = serviceData.pricingPlans[plan];
          if (planData.price && (isNaN(planData.price) || planData.price < 0)) {
            return res.status(400).json({
              success: false,
              message: `Invalid price for ${plan} plan`
            });
          }
          if (planData.deliveryTime && (isNaN(planData.deliveryTime) || planData.deliveryTime < 1)) {
            return res.status(400).json({
              success: false,
              message: `Invalid delivery time for ${plan} plan`
            });
          }
        }
      }
    }

    // Parse and validate tags
    if (typeof serviceData.tags === 'string') {
      try {
        serviceData.tags = JSON.parse(serviceData.tags);
      } catch (parseError) {
        serviceData.tags = serviceData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    // Ensure tags is an array
    if (!Array.isArray(serviceData.tags)) {
      serviceData.tags = [];
    }

    // Validate tags
    serviceData.tags = serviceData.tags.slice(0, 10); // Limit to 10 tags
    serviceData.tags = serviceData.tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);

    // Create the service first
    const service = await Service.create(serviceData);

    // Handle image uploads if files are present
    if (req.files && req.files.length > 0) {
      const images = [];
      
      // Configure cloudinary if not already configured
      if (!cloudinary.config().cloud_name) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
          api_key: process.env.CLOUDINARY_API_KEY || 'demo',
          api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
        });
      }

      for (const file of req.files) {
        try {
          // Get file extension from original name
          const fileExtension = path.extname(file.originalname) || '.jpg';
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          
          // Create new filename with proper extension
          const newFilename = `${path.basename(file.filename)}${fileExtension}`;
          const newFilePath = path.join(path.dirname(file.path), newFilename);
          
          // Rename file to include extension
          if (fs.existsSync(file.path)) {
            fs.renameSync(file.path, newFilePath);
            
            // Store the URL with proper extension
            const localUrl = `/uploads/services/${newFilename}`;
            images.push({
              url: `${baseUrl}${localUrl}`,
              alt: `${service.title} image`,
              isPrimary: images.length === 0
            });
          }
        } catch (uploadError) {
          console.error('Error processing file:', uploadError);
          // Try cloudinary upload as fallback
          try {
            if (fs.existsSync(file.path)) {
              const result = await cloudinary.uploader.upload(file.path, {
                folder: 'servpe/services',
                transformation: [
                  { width: 800, height: 600, crop: 'limit' },
                  { quality: 'auto' }
                ]
              });

              images.push({
                url: result.secure_url,
                alt: `${service.title} image`,
                isPrimary: images.length === 0
              });

              // Delete temp file safely
              try {
                fs.unlinkSync(file.path);
              } catch (deleteError) {
                console.error('Error deleting temp file:', deleteError);
              }
            }
          } catch (cloudinaryError) {
            console.error('Error uploading to cloudinary:', cloudinaryError);
          }
        }
      }

      // Update service with images
      if (images.length > 0) {
        service.images = images;
        await service.save();
      }
    }

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.freelancer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate update data
    const allowedUpdates = ['title', 'description', 'category', 'subcategory', 'tags', 'pricingPlans', 'status', 'isActive'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.freelancer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get freelancer's services
exports.getMyServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = { freelancer: req.user.id };
    if (status && ['active', 'paused', 'draft'].includes(status)) {
      filter.status = status;
    }

    const services = await Service.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Service.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Upload service images - Enhanced error handling
exports.uploadServiceImages = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.freelancer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const images = [];
    
    // Configure cloudinary if not already configured
    if (!cloudinary.config().cloud_name) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
        api_key: process.env.CLOUDINARY_API_KEY || 'demo',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
      });
    }

    for (const file of req.files) {
      try {
        // Get file extension from original name
        const fileExtension = path.extname(file.originalname) || '.jpg';
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Create new filename with proper extension
        const newFilename = `${path.basename(file.filename)}${fileExtension}`;
        const newFilePath = path.join(path.dirname(file.path), newFilename);
        
        // Rename file to include extension
        if (fs.existsSync(file.path)) {
          fs.renameSync(file.path, newFilePath);
          
          // Store the URL with proper extension
          const localUrl = `/uploads/services/${newFilename}`;
          images.push({
            url: `${baseUrl}${localUrl}`,
            alt: `${service.title} image`,
            isPrimary: service.images.length === 0 && images.length === 0
          });
        }
      } catch (uploadError) {
        console.error('Error processing file:', uploadError);
        // Try cloudinary upload as fallback
        try {
          if (fs.existsSync(file.path)) {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'servpe/services',
              transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' }
              ]
            });

            images.push({
              url: result.secure_url,
              alt: `${service.title} image`,
              isPrimary: service.images.length === 0 && images.length === 0
            });

            // Delete temp file safely
            try {
              fs.unlinkSync(file.path);
            } catch (deleteError) {
              console.error('Error deleting temp file:', deleteError);
            }
          }
        } catch (cloudinaryError) {
          console.error('Error uploading to cloudinary:', cloudinaryError);
        }
      }
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images were successfully uploaded'
      });
    }

    service.images = [...service.images, ...images];
    await service.save();

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get service analytics
exports.getServiceAnalytics = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.freelancer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const analytics = {
      impressions: service.impressions || 0,
      clicks: service.clicks || 0,
      orders: service.orders || 0,
      conversionRate: service.clicks > 0 ? parseFloat((service.orders / service.clicks * 100).toFixed(2)) : 0,
      averageRating: service.averageRating || 0,
      totalReviews: service.totalReviews || 0
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get service analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};