import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SAFER ICON HANDLING ---
// This creates a mapping of all available icon names to their components.
const IconMap = { ...LucideIcons };
const FallbackIcon = LucideIcons.Menu; // A default icon to show if the name is invalid.

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = IconMap[name];
  if (!IconComponent) {
    return <FallbackIcon {...props} />; // Prevents crashing by showing a default icon.
  }
  return <IconComponent {...props} />;
};
// --- END OF ICON HANDLING ---


const MenuConfiguration = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedParents, setExpandedParents] = useState({});

  // Form state
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('');
  const [permission, setPermission] = useState('');
  const [order, setOrder] = useState(0);
  const [parent, setParent] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/superadmin/menu-items');
      setMenuItems(data);
      const parents = data.filter(item => !item.parent);
      const expandedState = {};
      parents.forEach(parent => {
        expandedState[parent._id] = true;
      });
      setExpandedParents(expandedState);
    } catch (error) {
      console.error("Failed to fetch menu items", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleParent = (parentId) => {
    setExpandedParents(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  const openModal = (item = null) => {
    setSelectedItem(item);
    if (item) {
      setTitle(item.title);
      setPath(item.path || '');
      setIcon(item.icon);
      setPermission(item.permission);
      setOrder(item.order);
      setParent(item.parent || '');
    } else {
      setTitle('');
      setPath('');
      setIcon('');
      setPermission('');
      setOrder(menuItems.length * 10);
      setParent('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    if (!title.trim() || !icon.trim() || !permission.trim()) {
      alert('Title, Icon, and Permission are required fields.');
      return;
    }

    const payload = { title, path, icon, permission, order, parent };
    try {
      if (selectedItem) {
        await api.put(`/superadmin/menu-items/${selectedItem._id}`, payload);
      } else {
        await api.post('/superadmin/menu-items', payload);
      }
      fetchData();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving menu item.');
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await api.delete(`/superadmin/menu-items/${itemId}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete menu item.');
      }
    }
  };

  const parentMenus = menuItems.filter(item => !item.parent);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Menu Configuration</h1>
          <button onClick={() => openModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
            <LucideIcons.PlusCircle className="w-5 h-5 mr-2" />
            Add Menu Item
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b font-semibold text-gray-700">Admin Sidebar Menu Structure</div>
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="text-center p-8"><LucideIcons.Loader2 className="w-8 h-8 text-indigo-600 animate-spin inline-block" /></div>
            ) : (
              menuItems.filter(item => !item.parent).sort((a,b) => a.order - b.order).map(parentItem => (
                <div key={parentItem._id} className="group">
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center font-medium text-gray-800">
                      <button onClick={() => toggleParent(parentItem._id)} className="text-gray-400 hover:text-gray-600 mr-2">
                        {expandedParents[parentItem._id] ? <LucideIcons.ChevronDown size={20} /> : <LucideIcons.ChevronRight size={20} />}
                      </button>
                      <DynamicIcon name={parentItem.icon} className="w-5 h-5 mr-3 text-indigo-600" />
                      {parentItem.title}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(parentItem)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Edit"><LucideIcons.Edit size={16} /></button>
                      <button onClick={() => handleDelete(parentItem._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><LucideIcons.Trash2 size={16} /></button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedParents[parentItem._id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {menuItems
                          .filter(child => child.parent === parentItem._id)
                          .sort((a, b) => a.order - b.order)
                          .map(childItem => (
                            <div key={childItem._id} className="flex items-center justify-between pl-16 pr-4 py-3 bg-gray-50 hover:bg-gray-100 border-t border-gray-100 group">
                              <div className="flex items-center text-gray-700">
                                <DynamicIcon name={childItem.icon} className="w-4 h-4 mr-3 text-gray-500" />
                                {childItem.title}
                              </div>
                              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(childItem)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Edit"><LucideIcons.Edit size={16} /></button>
                                <button onClick={() => handleDelete(childItem._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><LucideIcons.Trash2 size={16} /></button>
                              </div>
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-lg p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{selectedItem ? 'Edit Menu Item' : 'Create New Menu Item'}</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Title (e.g., Contacts & Leads)" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded-lg" />
                  <input type="text" placeholder="Path (e.g., /admin/contacts)" value={path} onChange={e => setPath(e.target.value)} className="w-full border p-2 rounded-lg" />
                  <input type="text" placeholder="Icon Name (e.g., Users)" value={icon} onChange={e => setIcon(e.target.value)} className="w-full border p-2 rounded-lg" />
                  <input type="text" placeholder="Permission (e.g., manage_contacts)" value={permission} onChange={e => setPermission(e.target.value)} className="w-full border p-2 rounded-lg" />
                  <input type="number" placeholder="Order" value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full border p-2 rounded-lg" />
                  <select value={parent} onChange={e => setParent(e.target.value)} className="w-full border p-2 rounded-lg">
                    <option value="">-- Select Parent (for child menu) --</option>
                    {parentMenus.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button onClick={closeModal} className="px-4 py-2 rounded-lg border">Cancel</button>
                  <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Save</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MenuConfiguration;
