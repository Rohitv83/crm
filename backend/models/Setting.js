import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  // The unique name for the setting (e.g., "stripe_key", "aws_bucket_name")
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // The value of the setting (can be a string, number, or even an object)
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  // A user-friendly name for the setting
  displayName: {
    type: String,
    required: true,
  },
  // The category this setting belongs to (e.g., "payment", "storage")
  category: {
    type: String,
    required: true,
    enum: ['payment', 'storage', 'localization'],
  },
  // Whether the value should be hidden in the UI (for secrets)
  isSecret: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model('Setting', SettingSchema);
