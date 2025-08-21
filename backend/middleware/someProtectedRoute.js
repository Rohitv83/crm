import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Import the middleware

const router = express.Router();

// This route is now protected. Only logged-in users can access it.
router.get('/my-profile', protect, (req, res) => {
  // Because of the middleware, we can access req.user here
  res.json({
    id: req.user.id,
    name: req.user.name
  });
});

export default router;