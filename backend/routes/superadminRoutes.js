import express from 'express';
import User from '../models/User.js';
import Role from '../models/Role.js';
import ActivityLog from '../models/ActivityLog.js';
import Plan from '../models/Plan.js';
import EmailTemplate from '../models/EmailTemplate.js';
import Notification from '../models/Notification.js';
import Invoice from '../models/Invoice.js';
import MenuItem from '../models/MenuItem.js';
import Setting from '../models/Setting.js';
import ApiKey from '../models/ApiKey.js';
import Webhook from '../models/Webhook.js';
import LoginAttempt from '../models/LoginAttempt.js';
import ApiUsageLog from '../models/ApiUsageLog.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// All routes in this file are protected and only accessible by a superadmin.
router.use(protect, restrictTo('superadmin'));

// --- User Management Routes ---

// Get a list of all users and count how many users each admin has created.
router.get('/users', async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'createdUsers'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          companyName: 1,
          plan: 1,
          isVerified: 1,
          createdAt: 1,
          phone: 1,
          status: {
            $cond: { if: { $eq: ["$isVerified", true] }, then: "active", else: "pending" }
          },
          createdUsersCount: { $size: '$createdUsers' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: err.message || 'Server error while fetching users.' });
  }
});

// Update a specific user's role (with logging).
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    const oldRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    try {
      await ActivityLog.create({
        actor: req.user?._id || null,
        action: 'user_role_updated',
        targetUser: targetUser._id,
        details: `Changed role from '${oldRole}' to '${role}' for user ${targetUser.email}.`,
      });
    } catch (logErr) {
      console.error("Activity log save failed:", logErr);
    }

    res.json({ message: 'User role updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error while updating role.' });
  }
});

// Delete a specific user (with logging).
router.delete('/users/:id', async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'User not found.' });

    await userToDelete.deleteOne();

    try {
      await ActivityLog.create({
        actor: req.user?._id || null,
        action: 'user_deleted',
        targetUser: userToDelete._id,
        details: `Deleted user ${userToDelete.email}.`,
      });
    } catch (logErr) {
      console.error("Activity log save failed:", logErr);
    }

    res.json({ message: 'User removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error while deleting user.' });
  }
});

// --- Role Management Routes ---
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find({ name: { $in: ['admin', 'user'] } });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching roles.' });
  }
});

// Update an existing role's permissions.
router.put('/roles/:id', async (req, res) => {
    try {
        const { permissions } = req.body;
        const role = await Role.findByIdAndUpdate(
            req.params.id, 
            { permissions }, // Only update the permissions field.
            { new: true }
        );
        if (!role) return res.status(404).json({ message: 'Role not found.' });
        res.json(role);
    } catch (err) {
        res.status(400).json({ message: 'Error updating role.' });
    }
});

// --- Dynamic Permissions Route ---
router.get('/permissions', async (req, res) => {
    try {
        const menuItems = await MenuItem.find({});
        const permissions = [...new Set(menuItems.map(item => item.permission))];
        res.json(permissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching permissions.' });
    }
});

// --- Activity Logs Route ---
router.get('/activity-logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('actor', 'name email')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error while fetching activity logs.' });
  }
});

// --- PLAN MANAGEMENT ROUTES (UPDATED) ---

// Get a list of all plans
router.get('/plans', async (req, res) => {
    try {
        const plans = await Plan.find({}).sort({ 'prices.usd': 1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching plans.' });
    }
});

// Update an existing plan (SABSE ZAROORI)
router.put('/plans/:id', async (req, res) => {
    try {
        // Yeh permissions ko update karega
        const { name, identifier, prices, features, isPublic, permissions } = req.body;
        const plan = await Plan.findByIdAndUpdate(
            req.params.id, 
            { name, identifier, prices, features, isPublic, permissions }, 
            { new: true }
        );
        if (!plan) return res.status(404).json({ message: 'Plan not found.' });
        res.json(plan);
    } catch (err) {
        res.status(400).json({ message: 'Error updating plan.' });
    }
});

// --- Client Subscription Routes ---
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('name email companyName plan createdAt')
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error while fetching admins.' });
  }
});

router.put('/users/:id/plan', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan) {
      return res.status(400).json({ message: 'Plan is required.' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const oldPlan = targetUser.plan;
    targetUser.plan = plan;
    await targetUser.save();
    try {
      await ActivityLog.create({
        actor: req.user?._id || null,
        action: 'plan_updated',
        targetUser: targetUser._id,
        details: `Changed plan from '${oldPlan}' to '${plan}' for user ${targetUser.email}.`,
      });
    } catch (logErr) {
      console.error("Activity log save failed:", logErr);
    }
    res.json({ message: 'User plan updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error while updating plan.' });
  }
});

// --- Email Template Management Routes ---
router.get('/email-templates', async (req, res) => {
    try {
        const templates = await EmailTemplate.find({}).sort({ createdAt: -1 });
        res.json(templates);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching email templates.' });
    }
});

router.post('/email-templates', async (req, res) => {
    try {
        const { name, subject, body } = req.body;
        const newTemplate = new EmailTemplate({ name, subject, body });
        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (err) {
        res.status(400).json({ message: 'Error creating template. Name might already exist.' });
    }
});

router.put('/email-templates/:id', async (req, res) => {
    try {
        const { name, subject, body } = req.body;
        const template = await EmailTemplate.findByIdAndUpdate(req.params.id, { name, subject, body }, { new: true });
        if (!template) return res.status(404).json({ message: 'Template not found.' });
        res.json(template);
    } catch (err) {
        res.status(400).json({ message: 'Error updating template.' });
    }
});

router.delete('/email-templates/:id', async (req, res) => {
    try {
        const template = await EmailTemplate.findByIdAndDelete(req.params.id);
        if (!template) return res.status(404).json({ message: 'Template not found.' });
        res.json({ message: 'Template deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting template.' });
    }
});

// --- Broadcast Email Route ---
router.post('/broadcast-email', async (req, res) => {
    const { templateId, filter } = req.body;
    try {
        const template = await EmailTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Email template not found.' });
        }
        let query = {};
        if (filter.type === 'plan') {
            query.plan = filter.value;
        } else if (filter.type === 'role') {
            query.role = filter.value;
        }
        const users = await User.find(query).select('email name');
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for the selected filter.' });
        }
        res.json({ message: `Email broadcast has been queued for ${users.length} users.` });
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        for (const user of users) {
            const personalizedBody = template.body.replace(/{{name}}/g, user.name);
            await transporter.sendMail({
                from: `MyCRM <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: template.subject,
                html: personalizedBody,
            });
        }
        console.log(`Broadcast sent successfully to ${users.length} users.`);
    } catch (err) {
        console.error("Broadcast Error:", err);
    }
});

// --- Notification Route ---
router.post('/notifications', async (req, res) => {
    try {
        const { title, message, link, filter } = req.body;
        let query = {};
        if (filter.type === 'plan' && filter.value) {
            query.plan = filter.value;
        } else if (filter.type === 'role' && filter.value) {
            query.role = filter.value;
        }
        const users = await User.find(query).select('_id');
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for the selected filter.' });
        }
        const notifications = users.map(user => ({
            recipient: user._id,
            title,
            message,
            link,
        }));
        await Notification.insertMany(notifications);
        res.status(201).json({ message: `Notification sent to ${users.length} users.` });
    } catch (err) {
        console.error("Notification Error:", err);
        res.status(500).json({ message: 'Server error while sending notification.' });
    }
});

// --- Invoice Management Routes ---
router.get('/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find({})
            .populate('client', 'name email companyName')
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching invoices.' });
    }
});

router.post('/invoices', async (req, res) => {
    try {
        const { client, items, dueDate, status } = req.body;
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
        const newInvoiceNumber = lastInvoice ? `INV-${parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1}` : 'INV-1001';
        const newInvoice = new Invoice({
            invoiceNumber: newInvoiceNumber,
            client,
            items,
            totalAmount,
            dueDate,
            status,
            createdBy: req.user._id,
        });
        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Error creating invoice.' });
    }
});

router.put('/invoices/:id', async (req, res) => {
    try {
        const { client, items, dueDate, status } = req.body;
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const updatedInvoice = {
            client,
            items,
            totalAmount,
            dueDate,
            status,
        };
        const invoice = await Invoice.findByIdAndUpdate(req.params.id, updatedInvoice, { new: true });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
        res.json(invoice);
    } catch(err) {
        console.error(err);
        res.status(400).json({ message: 'Error updating invoice.' });
    }
});

router.delete('/invoices/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
        res.json({ message: 'Invoice deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting invoice.' });
    }
});

// --- Menu Configuration Routes ---
router.get('/menu-items', async (req, res) => {
    try {
        const menuItems = await MenuItem.find({}).sort({ order: 1 });
        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching menu items.' });
    }
});

router.post('/menu-items', async (req, res) => {
    try {
        const { title, path, icon, permission, order, parent } = req.body;
        const newMenuItem = new MenuItem({
            title,
            path: path || undefined,
            icon,
            permission,
            order,
            parent: parent || null,
        });
        await newMenuItem.save();
        res.status(201).json(newMenuItem);
    } catch (err) {
        res.status(400).json({ message: 'Error creating menu item. Permission must be unique.' });
    }
});

router.put('/menu-items/:id', async (req, res) => {
    try {
        const { title, path, icon, permission, order, parent } = req.body;
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id, 
            { title, path: path || undefined, icon, permission, order, parent: parent || null }, 
            { new: true }
        );
        if (!menuItem) return res.status(404).json({ message: 'Menu item not found.' });
        res.json(menuItem);
    } catch (err) {
        res.status(400).json({ message: 'Error updating menu item.' });
    }
});

router.delete('/menu-items/:id', async (req, res) => {
    try {
        const childExists = await MenuItem.findOne({ parent: req.params.id });
        if (childExists) {
            return res.status(400).json({ message: 'Cannot delete. This is a parent menu. Please delete its children first.' });
        }
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!menuItem) return res.status(404).json({ message: 'Menu item not found.' });
        res.json({ message: 'Menu item deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting menu item.' });
    }
});

// --- NEW SYSTEM CONFIGURATION ROUTES ---

// Saari system settings get karna
router.get('/settings', async (req, res) => {
    try {
        const settings = await Setting.find({});
        // Frontend par aasaani se istemal karne ke liye array ko object mein badlein
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching settings.' });
    }
});

// System settings ko update karna (ek saath kai)
router.put('/settings', async (req, res) => {
    try {
        const settingsToUpdate = req.body; // Frontend se ek array aayega

        for (const setting of settingsToUpdate) {
            await Setting.findOneAndUpdate(
                { key: setting.key },
                { value: setting.value },
                { upsert: true, new: true } // Agar setting nahi hai, to nayi bana dega
            );
        }

        res.json({ message: 'Settings updated successfully.' });
    } catch (err) {
        res.status(400).json({ message: 'Error updating settings.' });
    }
});

// --- API KEY MANAGEMENT ROUTES ---
router.get('/api-keys', async (req, res) => {
    try {
        const apiKeys = await ApiKey.find({})
            .populate('user', 'name email companyName')
            .sort({ createdAt: -1 });
        res.json(apiKeys);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching API keys.' });
    }
});

router.post('/api-keys', async (req, res) => {
    try {
        const { user, name, description, permissions } = req.body;
        const newApiKey = new ApiKey({ user, name, description, permissions });
        await newApiKey.save();
        
        const populatedKey = await ApiKey.findById(newApiKey._id).populate('user', 'name email companyName');
        res.status(201).json(populatedKey);
    } catch (err) {
        console.error("DETAILED API KEY CREATION ERROR:", err);
        res.status(400).json({ message: 'Error creating API key. Ensure all fields are correct.' });
    }
});

router.put('/api-keys/:id/revoke', async (req, res) => {
    try {
        const apiKey = await ApiKey.findByIdAndUpdate(
            req.params.id,
            { status: 'revoked' },
            { new: true }
        );
        if (!apiKey) {
            return res.status(404).json({ message: 'API Key not found.' });
        }
        res.json({ message: 'API Key has been revoked successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error revoking API key.' });
    }
});

// --- WEBHOOK MANAGEMENT ROUTES (WITH DEBUGGING) ---

// Saare webhooks ki list get karna
router.get('/webhooks', async (req, res) => {
    try {
        const webhooks = await Webhook.find({})
            .populate('user', 'name email companyName')
            .sort({ createdAt: -1 });
        res.json(webhooks);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching webhooks.' });
    }
});

// Naya webhook create karna
router.post('/webhooks', async (req, res) => {
    try {
        const { user, url, events } = req.body;
        const newWebhook = new Webhook({ user, url, events });
        await newWebhook.save();
        
        const populatedWebhook = await Webhook.findById(newWebhook._id).populate('user', 'name email companyName');
        res.status(201).json(populatedWebhook);
    } catch (err) {
        // --- YEH NAYA JAASOOS HAI ---
        console.error("DETAILED WEBHOOK CREATION ERROR:", err);
        res.status(400).json({ message: 'Error creating webhook. Check server logs for details.' });
    }
});

// Kisi webhook ko delete karna
router.delete('/webhooks/:id', async (req, res) => {
    try {
        const webhook = await Webhook.findByIdAndDelete(req.params.id);
        if (!webhook) {
            return res.status(404).json({ message: 'Webhook not found.' });
        }
        res.json({ message: 'Webhook deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting webhook.' });
    }
});

// --- NAYI LOGIN ATTEMPTS ROUTE ---

router.get('/login-attempts', async (req, res) => {
    try {
        const logs = await LoginAttempt.find({})
            .sort({ createdAt: -1 }) // Sabse naye logs upar
            .limit(100); // Sirf pichhle 100 logs dikhayein
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Server error while fetching login attempts.' });
    }
});

// --- NEW API USAGE LOGS ROUTE ---
router.get('/api-usage-logs', async (req, res) => {
    try {
        const logs = await ApiUsageLog.find({})
            .populate('user', 'name email companyName')
            .populate('apiKey', 'name')
            .sort({ createdAt: -1 })
            .limit(200); // Limit to the last 200 logs for performance
        res.json(logs);
    } catch (err) {
        console.error("Error fetching API usage logs:", err);
        res.status(500).json({ message: 'Server error while fetching API usage logs.' });
    }
});

export default router;