import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Use the central API utility
import { Shield, CheckSquare, Square, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// This component now correctly uses the central 'api' instance,
// which is configured with the correct base URL and authorization headers.

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // These API calls will now correctly go to /api/superadmin/...
      const [rolesRes, permissionsRes] = await Promise.all([
        api.get('/superadmin/roles'),
        api.get('/superadmin/permissions')
      ]);
      
      setRoles(rolesRes.data);
      setAllPermissions(permissionsRes.data);

      if (rolesRes.data.length > 0) {
        const adminRole = rolesRes.data.find(r => r.name === 'admin') || rolesRes.data[0];
        setSelectedRole(adminRole);
        setPermissions(adminRole.permissions);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setPermissions(role.permissions);
  };

  const handlePermissionToggle = (permission) => {
    setPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission) 
        : [...prev, permission]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      // This API call will now correctly go to /api/superadmin/roles/:id
      await api.put(`/superadmin/roles/${selectedRole._id}`, { permissions });
      fetchData();
    } catch (error) {
      alert('Error saving permissions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
       <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Role & Permission Management</h1>
        <p className="text-gray-600 mb-8">Select a role to configure its access permissions across the platform.</p>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h2 className="font-bold text-lg text-gray-700 mb-4">System Roles</h2>
                <div className="space-y-2">
                  {roles.map(role => (
                    <button 
                      key={role._id}
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                        selectedRole?._id === role._id 
                          ? 'bg-indigo-600 text-white shadow' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Shield className="w-5 h-5 mr-3" />
                      <span className="capitalize font-medium">{role.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:w-3/4">
              {selectedRole ? (
                <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y:0 }} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Permissions for <span className="text-indigo-600 capitalize">{selectedRole.name}</span>
                      </h2>
                      <p className="text-gray-500 mt-1">Select the permissions for this role.</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveChanges} 
                      disabled={saving}
                      className="mt-4 md:mt-0 bg-emerald-500 text-white px-5 py-2.5 rounded-lg flex items-center hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allPermissions.map(p => (
                      <motion.label 
                        key={p} 
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={permissions.includes(p)}
                          onChange={() => handlePermissionToggle(p)}
                          className="hidden"
                        />
                        {permissions.includes(p) ? 
                          <CheckSquare className="w-5 h-5 text-indigo-600" /> : 
                          <Square className="w-5 h-5 text-gray-400" />
                        }
                        <span className="capitalize text-gray-700 select-none">{p.replace(/_/g, ' ')}</span>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center p-10 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">Select a role to see its permissions.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;
