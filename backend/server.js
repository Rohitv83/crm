import dotenv from 'dotenv';
// Load environment variables FIRST
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Role from './models/Role.js';

// Now, import your routes
import authRoutes from './routes/authRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use your routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1', apiRoutes);

// --- DATABASE CONNECTION ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected Successfully!');

  // This function will create default roles if they don't exist
  const seedRoles = async () => {
    try {
      const adminRoleExists = await Role.findOne({ name: 'admin' });
      if (!adminRoleExists) {
        await Role.create({ 
          name: 'admin', 
          permissions: ['view_dashboard', 'manage_users', 'view_reports'] 
        });
        console.log('Default "admin" role created.');
      }

      const userRoleExists = await Role.findOne({ name: 'user' });
      if (!userRoleExists) {
        await Role.create({ 
          name: 'user', 
          permissions: ['view_dashboard'] 
        });
        console.log('Default "user" role created.');
      }
    } catch (error) {
      console.error('Error seeding roles:', error);
    }
  };
  
  // Run the function to create default roles
  seedRoles();

  app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
})
.catch((error) => {
  console.error('MongoDB Connection Failed:', error.message);
});
