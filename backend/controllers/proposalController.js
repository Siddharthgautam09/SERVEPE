
const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// Get proposals for a project
exports.getProposalsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the project owner
    if (project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const proposals = await Proposal.find({ project: projectId })
      .populate('freelancer', 'firstName lastName profilePicture rating skills hourlyRate')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Proposal.countDocuments({ project: projectId });

    res.status(200).json({
      success: true,
      data: proposals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching proposals',
      error: error.message
    });
  }
};

// Submit a proposal
exports.submitProposal = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      coverLetter,
      proposedBudget,
      estimatedDuration,
      milestones,
      attachments
    } = req.body;

    const project = await Project.findById(projectId).populate('client', 'firstName lastName email');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Project is not accepting proposals'
      });
    }

    // Check if freelancer already submitted a proposal
    const existingProposal = await Proposal.findOne({
      project: projectId,
      freelancer: req.user.id
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this project'
      });
    }

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user.id,
      coverLetter,
      proposedBudget,
      estimatedDuration,
      milestones: milestones || [],
      attachments: attachments || []
    });

    // Add proposal to project
    await Project.findByIdAndUpdate(projectId, {
      $push: { proposals: proposal._id }
    });

    const populatedProposal = await Proposal.findById(proposal._id)
      .populate('freelancer', 'firstName lastName profilePicture rating skills');

    // Send email notification to client
    try {
      const freelancerName = `${req.user.firstName} ${req.user.lastName}`;
      const clientName = `${project.client.firstName} ${project.client.lastName}`;
      
      await emailService.sendProposalNotificationToClient(
        project.client.email,
        clientName,
        freelancerName,
        project.title,
        proposedBudget.amount
      );
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the proposal submission if email fails
    }

    res.status(201).json({
      success: true,
      data: populatedProposal
    });
  } catch (error) {
    console.error('Submit proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting proposal',
      error: error.message
    });
  }
};

// Update proposal status (accept/reject)
exports.updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, clientMessage } = req.body;

    const proposal = await Proposal.findById(id)
      .populate('project')
      .populate('freelancer', 'firstName lastName email');
      
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Check if user is the project owner
    if (proposal.project.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    proposal.status = status;
    proposal.respondedAt = new Date();
    if (clientMessage) {
      proposal.clientMessage = clientMessage;
    }

    await proposal.save();

    // If accepted, update project status and assign freelancer
    if (status === 'accepted') {
      await Project.findByIdAndUpdate(proposal.project._id, {
        status: 'in-progress',
        freelancer: proposal.freelancer,
        assignedAt: new Date()
      });

      // Reject all other proposals for this project
      await Proposal.updateMany(
        { 
          project: proposal.project._id, 
          _id: { $ne: proposal._id },
          status: 'pending'
        },
        { 
          status: 'rejected',
          respondedAt: new Date(),
          clientMessage: 'Project assigned to another freelancer'
        }
      );
    }

    // Send email notification to freelancer
    try {
      const freelancerName = `${proposal.freelancer.firstName} ${proposal.freelancer.lastName}`;
      
      await emailService.sendProposalStatusToFreelancer(
        proposal.freelancer.email,
        freelancerName,
        proposal.project.title,
        status,
        clientMessage
      );
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the status update if email fails
    }

    const updatedProposal = await Proposal.findById(id)
      .populate('freelancer', 'firstName lastName profilePicture rating skills')
      .populate('project');

    res.status(200).json({
      success: true,
      data: updatedProposal
    });
  } catch (error) {
    console.error('Update proposal status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating proposal status',
      error: error.message
    });
  }
};

// Get freelancer's proposals
exports.getFreelancerProposals = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { freelancer: req.user.id };
    if (status) {
      filter.status = status;
    }

    const proposals = await Proposal.find(filter)
      .populate('project', 'title description budget status client')
      .populate('project.client', 'firstName lastName')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Proposal.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: proposals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get freelancer proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching proposals',
      error: error.message
    });
  }
};
