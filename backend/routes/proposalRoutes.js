
const express = require('express');
const {
  getProposalsForProject,
  submitProposal,
  updateProposalStatus,
  getFreelancerProposals
} = require('../controllers/proposalController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get freelancer's proposals
router.get('/my-proposals', restrictTo('freelancer'), getFreelancerProposals);

// Project-specific proposal routes
router.get('/project/:projectId', getProposalsForProject);
router.post('/project/:projectId', restrictTo('freelancer'), submitProposal);

// Individual proposal routes
router.put('/:id/status', restrictTo('client', 'admin'), updateProposalStatus);

module.exports = router;
