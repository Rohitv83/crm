import mongoose from 'mongoose';

const LoginAttemptSchema = new mongoose.Schema({
  // Kis email se login karne ki koshish ki gayi
  email: {
    type: String,
    required: true,
    trim: true,
  },
  // Login safal hua ya nahi
  success: {
    type: Boolean,
    required: true,
  },
  // User ka IP address
  ipAddress: {
    type: String,
    trim: true,
  },
  // User ne kaun sa browser/device istemal kiya
  userAgent: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model('LoginAttempt', LoginAttemptSchema);
