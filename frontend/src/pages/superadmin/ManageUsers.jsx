import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Edit, Trash2, UserPlus, X, Shield, Users, 
  CheckCircle, XCircle, Mail, Phone, Calendar, Briefcase,
  ChevronDown, ChevronUp, MoreVertical, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/superadmin`,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

const roleColors = {
  superadmin: 'bg-red-100 text-red-800',
  admin: 'bg-indigo-100 text-indigo-800',
  user: 'bg-emerald-100 text-emerald-800'
};

const statusIcons = {
  active: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  suspended: <XCircle className="w-4 h-4 text-red-500" />,
  pending: <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [expandedUser, setExpandedUser] = useState(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users. Please check your authorization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await api.put(`/users/${selectedUser._id}/role`, { role: newRole });
      fetchUsers();
      closeEditModal();
    } catch (err) {
      alert('Failed to update role. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${selectedUser._id}`);
      fetchUsers();
      closeDeleteModal();
    } catch (err) {
      alert('Failed to delete user. Please try again.');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const toggleExpandUser = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const filteredUsers = users
    .filter(user => roleFilter === 'all' || user.role === roleFilter)
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all users and their permissions</p>
          </div>
          <button className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center transition-colors">
            <UserPlus className="w-5 h-5 mr-2" />
            Invite New User
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found matching your criteria</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <div key={user._id} className="hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 items-center p-4">
                    <div className="col-span-5 md:col-span-4 flex items-center">
                      <img 
                        className="w-10 h-10 rounded-full mr-4" 
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                        alt={user.name} 
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="col-span-2 hidden md:block text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-2 hidden md:flex justify-center">
                      {statusIcons[user.status] || statusIcons.pending}
                    </div>
                    <div className="col-span-4 md:col-span-2 flex justify-end space-x-2">
                      <button 
                        onClick={() => openDetailModal(user)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="View details"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Edit user"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(user)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete user"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedUser === user._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-2">
                            <p className="flex items-center text-sm">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-700">{user.phone || 'Not provided'}</span>
                            </p>
                            <p className="flex items-center text-sm">
                              <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-700">{user.companyName || 'No company'}</span>
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-700">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </p>
                            <p className="flex items-center text-sm">
                              <Shield className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-gray-700">
                                Status: <span className="capitalize">{user.status}</span>
                              </span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDetailModal}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                    <p className="text-indigo-600">{selectedUser.email}</p>
                  </div>
                  <button 
                    onClick={closeDetailModal}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-indigo-500" />
                        Account Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Role</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[selectedUser.role]}`}>
                            {selectedUser.role}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Status</span>
                          <span className="capitalize text-gray-500">{selectedUser.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Joined On</span>
                          <span className='text-gray-500'>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Last Active</span>
                          <span className='text-gray-500'>{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : 'Never'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
                        Company Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Company</span>
                          <span className='text-gray-500'>{selectedUser.companyName || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Position</span>
                          <span className='text-gray-500'>{selectedUser.position || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-indigo-500" />
                        User Activity
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Users Created</span>
                          <span className='text-gray-500'>{selectedUser.createdUsersCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Last Login</span>
                          <span className='text-gray-500'>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-indigo-500" />
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Email</span>
                          <span className='text-gray-500'>{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Phone</span>
                          <span className='text-gray-500'>{selectedUser.phone || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openEditModal(selectedUser);
                    }}
                    className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openDeleteModal(selectedUser);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeEditModal}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Update User Role</h2>
                  <button 
                    onClick={closeEditModal}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <img 
                      className="w-12 h-12 rounded-full mr-4" 
                      src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=random`} 
                      alt={selectedUser.name} 
                    />
                    <div>
                      <p className="font-medium">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Select New Role
                    </label>
                    <select
                      id="role"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRoleChange}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Update Role
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDeleteModal}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
                  <button 
                    onClick={closeDeleteModal}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-700">
                    Are you sure you want to delete <span className="font-semibold">{selectedUser.name}</span>? This action cannot be undone.
                  </p>

                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          Deleting this user will permanently remove all their data from our servers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeDeleteModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsers;