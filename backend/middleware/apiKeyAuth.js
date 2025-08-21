import ApiKey from '../models/ApiKey.js';
import ApiUsageLog from '../models/ApiUsageLog.js';

const apiKeyAuth = async (req, res, next) => {
  const key = req.headers['x-api-key'];

  if (!key) {
    return res.status(401).json({ message: 'API Key is missing.' });
  }

  const apiKey = await ApiKey.findOne({ key: key, status: 'active' });

  if (!apiKey) {
    return res.status(403).json({ message: 'Invalid API Key.' });
  }

  // Log the API usage
  try {
    await ApiUsageLog.create({
      apiKey: apiKey._id,
      user: apiKey.user,
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode, // This will be updated after the response
      ipAddress: req.ip,
    });
  } catch (logError) {
    console.error("Failed to log API usage:", logError);
  }
  
  // Update the lastUsed timestamp for the key
  apiKey.lastUsed = new Date();
  await apiKey.save();


  // Attach the user and key to the request for use in the next function
  req.user = apiKey.user;
  req.apiKey = apiKey;

  next();
};

export default apiKeyAuth;
