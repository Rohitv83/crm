import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  // For display on the frontend (e.g., "Basic Plan")
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // For internal use and linking to the User model
  identifier: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  prices: {
    usd: { type: Number, required: true },
    inr: { type: Number, required: true },
  },
  features: [{
    type: String,
    trim: true,
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  permissions: [{
    type: String,
    trim: true,
  }],
}, { timestamps: true });

export default mongoose.model('Plan', PlanSchema);