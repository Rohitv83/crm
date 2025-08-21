import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ListOrdered, Edit, Trash2, PlusCircle, X, Check, 
  DollarSign, Loader2, IndianRupee, Users, Eye, EyeOff,
  ArrowUpRight, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import SubscribersModal from '../../components/crm/SubscribersModal';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/superadmin`,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

const PlansManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [prices, setPrices] = useState({ usd: '', inr: '' });
  const [features, setFeatures] = useState(['']);
  const [isPublic, setIsPublic] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/plans');
      setPlans(data);
    } catch (error) {
      setError('Failed to fetch plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (index) => setFeatures(features.filter((_, i) => i !== index));

  const openModal = (plan = null) => {
    setSelectedPlan(plan);
    setName(plan ? plan.name : '');
    setIdentifier(plan ? plan.identifier : '');
    setPrices(plan ? plan.prices : { usd: '', inr: '' });
    setFeatures(plan ? plan.features : ['']);
    setIsPublic(plan ? plan.isPublic : true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setName('');
    setIdentifier('');
    setPrices({ usd: '', inr: '' });
    setFeatures(['']);
    setIsPublic(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !identifier.trim() || !prices.usd || !prices.inr || features.some(f => !f.trim())) {
      alert('Please fill all fields including the plan identifier.');
      return;
    }

    setIsSubmitting(true);
    const payload = { 
      name: name.trim(), 
      identifier: identifier.trim().toLowerCase(),
      prices: {
        usd: Number(prices.usd),
        inr: Number(prices.inr)
      }, 
      features: features.filter(f => f.trim()), 
      isPublic 
    };
    
    try {
      if (selectedPlan) {
        await api.put(`/plans/${selectedPlan._id}`, payload);
      } else {
        await api.post('/plans', payload);
      }
      await fetchPlans();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving plan. Name or Identifier must be unique.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/plans/${planId}`);
      await fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete plan. It may have active subscribers.');
    }
  };

  const handleViewSubscribers = async (plan) => {
    setSelectedPlan(plan);
    setIsSubscribersModalOpen(true);
    setSubscribersLoading(true);
    try {
      const { data } = await api.get(`/plans/${plan._id}/subscribers`);
      setSubscribers(data);
    } catch (error) {
      console.error("Failed to fetch subscribers", error);
      setSubscribers([]);
    } finally {
      setSubscribersLoading(false);
    }
  };

  const toggleExpandPlan = (planId) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plan.identifier && plan.identifier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPlanColor = (planIdentifier) => {
    const planColors = {
      basic: 'from-blue-500 to-blue-600',
      standard: 'from-purple-500 to-purple-600',
      premium: 'from-indigo-500 to-indigo-600',
      pro: 'from-teal-500 to-teal-600',
      enterprise: 'from-amber-500 to-amber-600'
    };
    return planColors[planIdentifier] || 'from-gray-500 to-gray-600';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <motion.h1 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Subscription Plans
            </motion.h1>
            <p className="text-gray-600">Manage and customize your pricing plans</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal()} 
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              New Plan
            </motion.button>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-indigo-600" />
            </motion.div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-red-500">
            {error}
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No plans found matching your criteria
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map(plan => (
              <motion.div 
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all"
              >
                <div className={`h-2 w-full bg-gradient-to-r ${getPlanColor(plan.identifier)}`}></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 capitalize">{plan.name}</h2>
                      <div className={`mt-1 text-xs font-semibold px-2 py-1 rounded-full inline-block ${plan.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {plan.isPublic ? 'Public' : 'Private'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(plan)} 
                        className="text-gray-500 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                        data-tooltip-id="edit-tooltip"
                        data-tooltip-content="Edit plan"
                      >
                        <Edit size={18} />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(plan._id)} 
                        className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                        data-tooltip-id="delete-tooltip"
                        data-tooltip-content="Delete plan"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-baseline">
                    <p className="text-4xl font-bold text-gray-900">${plan.prices.usd}</p>
                    <p className="text-2xl font-semibold text-gray-500 ml-2">/ ₹{plan.prices.inr}</p>
                    <span className="text-lg font-medium text-gray-500 ml-1">/month</span>
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      onClick={() => toggleExpandPlan(plan._id)}
                      className="w-full flex items-center justify-between text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <span>View Features</span>
                      {expandedPlan === plan._id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedPlan === plan._id && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 space-y-3"
                        >
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-gray-700">
                              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewSubscribers(plan)}
                      className="bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Subscribers
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      View
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Plan Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
                  </h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan Display Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Basic Plan" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan Identifier (unique)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. basic" 
                        value={identifier} 
                        onChange={e => setIdentifier(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input 
                          type="number" 
                          placeholder="e.g. 10" 
                          value={prices.usd} 
                          onChange={e => setPrices({...prices, usd: e.target.value})} 
                          className="w-full pl-8 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input 
                          type="number" 
                          placeholder="e.g. 800" 
                          value={prices.inr} 
                          onChange={e => setPrices({...prices, inr: e.target.value})} 
                          className="w-full pl-8 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Features</label>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addFeature} 
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                      >
                        <PlusCircle className="w-4 h-4 mr-1" /> Add Feature
                      </motion.button>
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {features.map((feature, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-2"
                        >
                          <input 
                            type="text" 
                            placeholder="Feature description" 
                            value={feature} 
                            onChange={e => handleFeatureChange(index, e.target.value)} 
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {features.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFeature(index)} 
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      id="visibility-toggle"
                      type="checkbox" 
                      checked={isPublic} 
                      onChange={e => setIsPublic(e.target.checked)} 
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="visibility-toggle" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                      Make this plan publicly visible
                    </label>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                        {selectedPlan ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      selectedPlan ? 'Update Plan' : 'Create Plan'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <SubscribersModal 
        isOpen={isSubscribersModalOpen}
        onClose={() => setIsSubscribersModalOpen(false)}
        plan={selectedPlan}
        subscribers={subscribers}
        loading={subscribersLoading}
      />

      <Tooltip id="edit-tooltip" />
      <Tooltip id="delete-tooltip" />
    </motion.div>
  );
};

export default PlansManagement;