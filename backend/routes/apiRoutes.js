import express from 'express';
import apiKeyAuth from '../middleware/apiKeyAuth.js';
import User from '../models/User.js'; // Assuming you might want to fetch contacts

const router = express.Router();

// All routes in this file are protected by the API key middleware
router.use(apiKeyAuth);

// --- EXAMPLE PUBLIC API ENDPOINT ---

// GET /api/v1/contacts
// Fetches all contacts created by the admin whose API key is being used.
router.get('/contacts', async (req, res) => {
  // Check if the API key has 'read' permission
  if (!req.apiKey.permissions.includes('read')) {
    return res.status(403).json({ message: 'Your API key does not have permission to read data.' });
  }

  try {
    // req.user is attached by the apiKeyAuth middleware
    const contacts = await User.find({ createdBy: req.user._id }).select('name email phone companyName');
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching contacts.' });
  }
});

export default router;
