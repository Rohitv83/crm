import express from 'express';
import ApiKey from '../models/ApiKey.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this file are protected and only accessible by a logged-in admin
router.use(protect, restrictTo('admin'));

// --- API KEY MANAGEMENT FOR ADMINS ---

// Generate a new API key for the currently logged-in admin
router.post('/api-keys/generate', async (req, res) => {
    try {
        // Check if the user already has an active key
        const existingKey = await ApiKey.findOne({ user: req.user._id, status: 'active' });
        if (existingKey) {
            return res.status(400).json({ message: 'You already have an active API key. Revoke the old one first.' });
        }

        const newApiKey = new ApiKey({
            user: req.user._id,
        });

        await newApiKey.save();

        // Important: Only send the key once upon creation. It won't be retrievable again.
        res.status(201).json({ 
            message: 'API Key generated successfully! Please save it securely.',
            apiKey: newApiKey.key 
        });

    } catch (err) {
        console.error("API Key Generation Error:", err);
        res.status(500).json({ message: 'Server error while generating API key.' });
    }
});

export default router;
