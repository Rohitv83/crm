import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is protected and can only be accessed by logged-in users.
// It fetches the entire menu structure from the database.
router.get('/', protect, async (req, res) => {
    try {
        const menuItems = await MenuItem.find({}).sort({ order: 1 });
        res.json(menuItems);
    } catch (err) {
        console.error("Error fetching menu items:", err);
        res.status(500).json({ message: 'Server error while fetching menu.' });
    }
});

export default router;
