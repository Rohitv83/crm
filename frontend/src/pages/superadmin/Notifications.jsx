import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bell, Send, Users, Loader2, ChevronDown, Check } from 'lucide-react'; // FIX: Added Check icon
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [activeStep, setActiveStep] = useState(1);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/superadmin/plans');
        setPlans(data);
      } catch (error) {
        setStatusMessage({ type: 'error', text: 'Failed to load plans for filtering.' });
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      setStatusMessage({ type: 'error', text: 'Title and message are required.' });
      return;
    }

    setIsSending(true);
    setStatusMessage({ type: 'info', text: 'Sending notifications...' });

    const payload = {
      title,
      message,
      link,
      filter: {
        type: filterType,
        value: filterValue
      }
    };

    try {
      const { data } = await api.post('/superadmin/notifications', payload);
      setStatusMessage({ type: 'success', text: data.message });
      // Form ko reset karein
      setTitle('');
      setMessage('');
      setLink('');
      setActiveStep(1);
    } catch (error) {
      setStatusMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'An error occurred while sending.' 
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const getRecipientCountText = () => {
    if (filterType === 'all') return 'All users will receive this notification.';
    if (filterType === 'plan' && filterValue) {
      const plan = plans.find(p => p.identifier === filterValue);
      return plan ? `Users with ${plan.name} plan will be notified.` : 'Please select a plan.';
    }
    if (filterType === 'role' && filterValue) {
      return `All users with the '${filterValue}' role will be notified.`;
    }
    return 'Please select your target audience.';
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* FIX: Removed mx-auto to make the layout left-aligned */}
      <div className="max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Bell className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">System Notifications</h1>
          </div>
          <p className="text-gray-600">Send targeted notifications to users based on their plan or role.</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-md space-y-8 border border-gray-100">
          {/* Progress Steps */}
          <div className="flex justify-between relative pb-8">
            <div className="absolute top-6 h-1 bg-gray-200 w-full -z-10"></div>
            <div className="absolute top-6 h-1 bg-indigo-600 transition-all duration-500" style={{ width: `${(activeStep - 1) * 50}%` }}></div>
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <button
                  onClick={() => step < activeStep && setActiveStep(step)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold 
                    ${activeStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}
                    ${step < activeStep ? 'cursor-pointer' : ''}
                  `}
                >
                  {step < activeStep ? <Check className="w-5 h-5" /> : step}
                </button>
                <span className={`mt-2 text-sm font-medium ${activeStep >= step ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {step === 1 ? 'Content' : step === 2 ? 'Recipients' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Notification Content */}
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">1</span>
                  Notification Content
                </h2>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., System Maintenance Alert"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message*</label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Enter the notification message..."
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                  <input
                    id="link"
                    type="text"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder="e.g., /dashboard/new-feature"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Recipients */}
          <AnimatePresence mode="wait">
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">2</span>
                  Select Recipients
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
                      <select 
                        value={filterType}
                        onChange={e => { setFilterType(e.target.value); setFilterValue(''); }}
                        className="w-full border border-gray-300 rounded-lg p-3 pl-4 pr-10 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="all">All Users</option>
                        <option value="plan">By Plan</option>
                        <option value="role">By Role</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-9 text-gray-400 w-5 h-5" />
                    </div>

                    {(filterType === 'plan' || filterType === 'role') && (
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {filterType === 'plan' ? 'Select Plan' : 'Select Role'}
                        </label>
                        <select 
                          value={filterValue} 
                          onChange={e => setFilterValue(e.target.value)} 
                          className="w-full border border-gray-300 rounded-lg p-3 pl-4 pr-10 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">-- Select {filterType === 'plan' ? 'a plan' : 'a role'} --</option>
                          {filterType === 'plan' ? (
                            plans.map(p => <option key={p._id} value={p.identifier}>{p.name}</option>)
                          ) : (
                            <>
                              <option value="admin">Admin</option>
                              <option value="user">User</option>
                            </>
                          )}
                        </select>
                        <ChevronDown className="absolute right-3 top-9 text-gray-400 w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Recipient Summary</h4>
                        <p className="text-blue-700 text-sm">{getRecipientCountText()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Review and Send */}
          <AnimatePresence mode="wait">
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">3</span>
                  Review and Send
                </h2>
                
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600 font-medium">Title:</span>
                    <span className="font-semibold text-gray-800">{title || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600 font-medium">Message:</span>
                    <span className="font-semibold text-gray-800 text-right max-w-xs">{message || 'Not provided'}</span>
                  </div>
                  {link && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600 font-medium">Link:</span>
                      <span className="font-semibold text-gray-800 text-right">{link}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600 font-medium">Recipients:</span>
                    <span className="font-semibold text-gray-800 text-right">
                      {getRecipientCountText()}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSubmit}
                    disabled={isSending}
                    className="w-full bg-indigo-600 text-white p-4 rounded-lg flex items-center justify-center text-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 mr-2" />
                        Send Notification
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t mt-4">
            <button
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (activeStep === 3) {
                  handleSubmit();
                } else {
                  setActiveStep(prev => Math.min(3, prev + 1));
                }
              }}
              disabled={
                (activeStep === 1 && (!title.trim() || !message.trim())) || 
                (activeStep === 2 && filterType !== 'all' && !filterValue)
              }
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors duration-200"
            >
              {activeStep === 3 ? 'Send Now' : 'Next'}
            </button>
          </div>

          {/* Status Message */}
          {statusMessage.text && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg text-center font-medium mt-4 ${
                statusMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                statusMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {statusMessage.text}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
