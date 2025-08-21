import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Mail, Send, Users, Filter, Loader2, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BroadcastEmail = () => {
  const [templates, setTemplates] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [previewContent, setPreviewContent] = useState(null);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [templatesRes, plansRes] = await Promise.all([
          api.get('/superadmin/email-templates'),
          api.get('/superadmin/plans')
        ]);
        setTemplates(templatesRes.data);
        setPlans(plansRes.data);
      } catch (error) {
        setStatusMessage({ type: 'error', text: 'Failed to load initial data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      const fetchPreview = async () => {
        try {
          const { data } = await api.get(`/superadmin/email-templates/${selectedTemplate}/preview`);
          setPreviewContent(data.content);
        } catch (error) {
          console.error('Failed to load preview', error);
        }
      };
      fetchPreview();
    }
  }, [selectedTemplate]);

  const handleSubmit = async () => {
    if (!selectedTemplate) {
      setStatusMessage({ type: 'error', text: 'Please select an email template.' });
      return;
    }

    setIsSending(true);
    setStatusMessage({ type: 'info', text: 'Sending emails...' });

    const payload = {
      templateId: selectedTemplate,
      filter: {
        type: filterType,
        value: filterValue
      }
    };

    try {
      const { data } = await api.post('/superadmin/broadcast-email', payload);
      setStatusMessage({ type: 'success', text: data.message || 'Emails sent successfully!' });
    } catch (error) {
      setStatusMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'An error occurred while sending the broadcast.' 
      });
    } finally {
      setIsSending(false);
    }
  };

  const getRecipientCountText = () => {
    if (filterType === 'all') return 'All users will receive this email';
    if (filterType === 'plan' && filterValue) {
      const plan = plans.find(p => p.identifier === filterValue);
      return plan ? `Users with ${plan.name} plan will receive this email` : '';
    }
    if (filterType === 'role' && filterValue) {
      return `All ${filterValue}s will receive this email`;
    }
    return 'Please select filter criteria';
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center mb-8"
        >
          <Mail className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Email Broadcast</h1>
        </motion.div>
        
        <div className="bg-white p-8 rounded-2xl shadow-md space-y-8 border border-gray-100">
          {/* Progress Steps */}
          <div className="flex justify-between relative pb-8">
            <div className="absolute top-1/2 h-1 bg-gray-200 w-full -z-10"></div>
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <button
                  onClick={() => setActiveStep(step)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold 
                    ${activeStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}
                    ${step < activeStep ? 'cursor-pointer' : ''}
                  `}
                >
                  {step < activeStep ? <Check className="w-5 h-5" /> : step}
                </button>
                <span className={`mt-2 text-sm font-medium ${activeStep >= step ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {step === 1 ? 'Template' : step === 2 ? 'Recipients' : 'Send'}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Select Template */}
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
                    Select Email Template
                  </h2>
                  
                  <div className="relative">
                    <select
                      value={selectedTemplate}
                      onChange={e => setSelectedTemplate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 pl-4 pr-10 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">-- Choose a template --</option>
                      {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>

                  {previewContent && (
                    <div className="mt-6 border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b font-medium text-gray-700">Preview</div>
                      <div 
                        className="p-4 bg-white"
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Select Recipients */}
          <AnimatePresence mode="wait">
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
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
                        <Users className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-blue-800">Recipient Summary</h4>
                          <p className="text-blue-700 text-sm">{getRecipientCountText()}</p>
                        </div>
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
              >
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
                    Review and Send
                  </h2>
                  
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="space-y-4">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Template:</span>
                        <span className="font-medium text-gray-600">
                          {templates.find(t => t._id === selectedTemplate)?.name || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Recipients:</span>
                        <span className="font-medium text-right text-gray-600">
                          {getRecipientCountText()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={handleSubmit}
                      disabled={isSending || !selectedTemplate}
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
                          Send Broadcast
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
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
              disabled={(activeStep === 1 && !selectedTemplate) || (activeStep === 2 && filterType !== 'all' && !filterValue)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors duration-200"
            >
              {activeStep === 3 ? 'Send Now' : 'Next'}
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg text-center font-medium ${
                statusMessage.type === 'error' ? 'bg-red-50 text-red-800' :
                statusMessage.type === 'success' ? 'bg-green-50 text-green-800' :
                'bg-blue-50 text-blue-800'
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

export default BroadcastEmail;