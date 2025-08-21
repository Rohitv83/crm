import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Settings, Save, Loader2, CreditCard, HardDrive, Globe, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemConfiguration = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');
  const [saveStatus, setSaveStatus] = useState(null); // 'success' or 'error'
  const [dirtyFields, setDirtyFields] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/superadmin/settings');
      const settingsValues = Object.keys(data).reduce((acc, key) => {
        acc[key] = data[key].value;
        return acc;
      }, {});
      setSettings(settingsValues);
      setDirtyFields({}); // Reset dirty fields on fresh load
    } catch (error) {
      console.error("Failed to fetch settings", error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setDirtyFields(prev => ({ ...prev, [name]: true }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(dirtyFields).length === 0) {
      setSaveStatus('error');
      return;
    }

    setSaving(true);
    try {
      const payload = Object.keys(dirtyFields).map(key => ({ key, value: settings[key] }));
      await api.put('/superadmin/settings', payload);
      setSaveStatus('success');
      setDirtyFields({}); // Reset dirty fields after successful save
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'payment':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-700">Stripe Gateway</h3>
            <div>
              <label className="block text-sm font-medium text-gray-600">Stripe API Key</label>
              <input 
                type="text" 
                name="stripe_api_key" 
                value={settings.stripe_api_key || ''} 
                onChange={handleInputChange} 
                className="w-full mt-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="pk_test_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Stripe Secret</label>
              <input 
                type="password" 
                name="stripe_secret" 
                value={settings.stripe_secret || ''} 
                onChange={handleInputChange} 
                className="w-full mt-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="sk_test_..."
              />
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-500">Test mode is recommended during development</p>
            </div>
          </motion.div>
        );
      case 'storage':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-700">AWS S3 Storage</h3>
            <div>
              <label className="block text-sm font-medium text-gray-600">S3 Bucket Name</label>
              <input 
                type="text" 
                name="s3_bucket_name" 
                value={settings.s3_bucket_name || ''} 
                onChange={handleInputChange} 
                className="w-full mt-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="my-app-bucket"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">S3 Access Key</label>
              <input 
                type="text" 
                name="s3_access_key" 
                value={settings.s3_access_key || ''} 
                onChange={handleInputChange} 
                className="w-full mt-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="AKIA..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">S3 Secret Key</label>
              <input 
                type="password" 
                name="s3_secret_key" 
                value={settings.s3_secret_key || ''} 
                onChange={handleInputChange} 
                className="w-full mt-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Secret key"
              />
            </div>
          </motion.div>
        );
      case 'localization':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-700">Regional Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-600">Default Currency</label>
              <select 
                name="default_currency" 
                value={settings.default_currency || 'USD'} 
                onChange={handleInputChange} 
                className="w-full mt-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Default Language</label>
              <select 
                name="default_language" 
                value={settings.default_language || 'en'} 
                onChange={handleInputChange} 
                className="w-full mt-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Timezone</label>
              <select 
                name="timezone" 
                value={settings.timezone || 'UTC'} 
                onChange={handleInputChange} 
                className="w-full mt-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Asia/Tokyo">Japan (JST)</option>
              </select>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">System Configuration</h1>
            <p className="text-gray-500 mt-1">Manage your application's global settings</p>
          </div>
          <div className="flex items-center space-x-4">
            <AnimatePresence>
              {saveStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center px-3 py-2 rounded-lg ${saveStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {saveStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2" />
                  )}
                  <span className="text-sm font-medium">
                    {saveStatus === 'success' ? 'Settings saved successfully!' : 'Failed to save settings'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={handleSaveChanges} 
              disabled={saving || Object.keys(dirtyFields).length === 0}
              className={`px-5 py-2.5 rounded-lg flex items-center transition-colors ${
                saving 
                  ? 'bg-indigo-300 text-white' 
                  : Object.keys(dirtyFields).length === 0 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 p-2">
              <button 
                onClick={() => setActiveTab('payment')} 
                className={`px-4 py-2.5 font-medium rounded-lg flex items-center transition-colors ${
                  activeTab === 'payment' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-2" /> 
                <span>Payment</span>
              </button>
              <button 
                onClick={() => setActiveTab('storage')} 
                className={`px-4 py-2.5 font-medium rounded-lg flex items-center transition-colors ${
                  activeTab === 'storage' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <HardDrive className="w-5 h-5 mr-2" /> 
                <span>Storage</span>
              </button>
              <button 
                onClick={() => setActiveTab('localization')} 
                className={`px-4 py-2.5 font-medium rounded-lg flex items-center transition-colors ${
                  activeTab === 'localization' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Globe className="w-5 h-5 mr-2" /> 
                <span>Localization</span>
              </button>
            </nav>
          </div>
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;