import mongoose from 'mongoose';
import crypto from 'crypto';

const WebhookSchema = new mongoose.Schema({
  // The user who owns this webhook
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The URL to send the notification to
  url: {
    type: String,
    required: true,
  },
  // The events this webhook listens for (e.g., "contact.created")
  events: [{
    type: String,
    required: true,
  }],
  // A secret key to verify the webhook's authenticity
  secret: {
    type: String,
    // FIX: Removed 'required: true' as the pre-save hook generates the secret
  },
  // The status of the webhook
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, { timestamps: true });

// Before saving a new webhook, generate a random secret
WebhookSchema.pre('save', function(next) {
  if (this.isNew) {
    this.secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
  }
  next();
});

export default mongoose.model('Webhook', WebhookSchema);
