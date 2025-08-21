import mongoose from 'mongoose';
import crypto from 'crypto';

const ApiKeySchema = new mongoose.Schema({
  // The user this key belongs to
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // A user-friendly name for the key (e.g., "Production Server")
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // An optional description
  description: {
    type: String,
    trim: true,
  },
  // The secret API key
  key: {
    type: String,
    unique: true,
    // FIX: Removed 'required: true' as the pre-save hook generates the key
  },
  // The permissions this key has (e.g., read, write)
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete'],
    required: true,
  }],
  // The key's status
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active',
  },
  // The last time the key was used
  lastUsed: {
    type: Date,
  },
}, { timestamps: true });

// Before saving a new key, generate a random, secure key string
ApiKeySchema.pre('save', function(next) {
  if (this.isNew) {
    this.key = `crm_live_${crypto.randomBytes(16).toString('hex')}`;
  }
  next();
});

export default mongoose.model('ApiKey', ApiKeySchema);