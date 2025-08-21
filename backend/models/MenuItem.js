import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  // Menu ka naam (e.g., "Dashboard", "Contacts & Leads")
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // Menu ka URL path (e.g., "/dashboard", "/admin/contacts")
  path: {
    type: String,
    trim: true,
  },
  // Menu ka icon (Lucide React icon ka naam)
  icon: {
    type: String,
    required: true,
  },
  // Is menu ko dekhne ke liye zaroori permission
  permission: {
    type: String,
    required: true,
    unique: true,
  },
  // Menu ka order set karne ke liye
  order: {
    type: Number,
    default: 0,
  },
  // Parent menu set karne ke liye (collapsible menu banane ke liye)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    default: null, // Agar yeh parent hai, to null hoga
  },
}, { timestamps: true });

export default mongoose.model('MenuItem', MenuItemSchema);
