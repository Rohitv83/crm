import mongoose from 'mongoose';

const ApiUsageLogSchema = new mongoose.Schema({
  // The API key that was used for the request
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey',
    required: true,
  },
  // The user who owns the API key
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The API endpoint that was accessed (e.g., /api/v1/contacts)
  endpoint: {
    type: String,
    required: true,
    trim: true,
  },
  // The HTTP method used (GET, POST, PUT, DELETE)
  method: {
    type: String,
    required: true,
  },
  // The status code of the response (e.g., 200 for success, 404 for not found)
  statusCode: {
    type: Number,
    required: true,
  },
  // The IP address the request came from
  ipAddress: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model('ApiUsageLog', ApiUsageLogSchema);
