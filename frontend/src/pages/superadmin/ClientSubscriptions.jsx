import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; 
import { 
  Users, Edit, Search, Loader2, X, ChevronDown, ChevronUp,
  Briefcase, Calendar, Mail, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const planColors = {
  basic: 'bg-blue-100 text-blue-800',
  standard: 'bg-purple-100 text-purple-800',
  premium: 'bg-indigo-100 text-indigo-800',
  enterprise: 'bg-emerald-100 text-emerald-800',
  pro: 'bg-teal-100 text-teal-800'
};

const ClientSubscriptions = () => {
  const [admins, setAdmins] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [expandedAdmin, setExpandedAdmin] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPlan, setNewPlan] = useState('');
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsRes, plansRes] = await Promise.all([
        api.get('/superadmin/admins'),
        api.get('/superadmin/plans')
      ]);
      setAdmins(adminsRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error("Fetch data error:", err);
      setError('Failed to fetch data. Please check your authorization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (user) => {
    setSelectedUser(user);
    setNewPlan(user.plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handlePlanChange = async () => {
    if (!selectedUser || !newPlan) return;

    setUpdatingPlan(true);
    try {
      const res = await api.put(
        `/superadmin/users/${selectedUser._id}/plan`,
        { plan: newPlan }
      );

      console.log("Plan update response:", res.data);
      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Plan update error:", err);
      const backendMessage =
        err.response?.data?.message || 'Failed to update plan. Please try again.';
      alert(backendMessage);
    } finally {
      setUpdatingPlan(false);
    }
  };

  const toggleExpandAdmin = (adminId) => {
    setExpandedAdmin(expandedAdmin === adminId ? null : adminId);
  };

  const filteredAdmins = admins
    .filter(admin => planFilter === 'all' || admin.plan === planFilter)
    .filter(admin => 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.companyName && admin.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <motion.h1 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold text-gray-900 mb-2"
              style={{ color: '#2c3e50' }}
            >
              Client Subscriptions
            </motion.h1>
            <p className="text-gray-600">Manage all client subscription plans</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white p-4 rounded-xl shadow-sm mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <select
                id="plan-filter"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
              >
                <option value="all">All Plans</option>
                {plans.map(plan => (
                  <option key={plan._id} value={plan.identifier} className="capitalize">
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">
            {error}
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No clients found matching your criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAdmins.map(admin => (
              <motion.div
                key={admin._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpandAdmin(admin._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{admin.name}</h3>
                        <p className="text-sm text-gray-500">{admin.companyName || 'No company'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${planColors[admin.plan] || 'bg-gray-100 text-gray-800'}`}>
                          {admin.plan}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(admin);
                        }}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                        title="Change plan"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {expandedAdmin === admin._id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedAdmin === admin._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div className="space-y-3">
                          <p className="text-sm flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-700">{admin.email}</span>
                          </p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-700">
                              Joined on {new Date(admin.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
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
                  <h2 className="text-2xl font-bold text-gray-900">Change Subscription Plan</h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.companyName || selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="new-plan" className="block text-sm font-medium text-gray-700 mb-1">
                      Select New Plan
                    </label>
                    <select
                      id="new-plan"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={newPlan}
                      onChange={e => setNewPlan(e.target.value)}
                    >
                      {plans.map(plan => (
                        // FIX: Use plan.identifier as the value
                        <option key={plan._id} value={plan.identifier} className="capitalize">
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={updatingPlan}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePlanChange}
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                      disabled={updatingPlan}
                    >
                      {updatingPlan ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Update Plan"
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientSubscriptions;
