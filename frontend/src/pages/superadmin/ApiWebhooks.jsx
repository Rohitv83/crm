import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Key, Zap, ShieldX, Loader2, Copy, Check, Plus, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AVAILABLE_EVENTS = [
  'contact.created',
  'contact.updated',
  'invoice.paid',
  'payment.received'
];

const ApiWebhooks = () => {
  const [activeTab, setActiveTab] = useState('api');
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showCreateWebhookModal, setShowCreateWebhookModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState('');

  const [newKeyData, setNewKeyData] = useState({
    user: '',
    name: '',
    description: '',
    permissions: ['read']
  });

  const [newWebhookData, setNewWebhookData] = useState({
    user: '',
    url: '',
    events: [],
    secret: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysRes, webhooksRes, usersRes] = await Promise.all([
        api.get('/superadmin/api-keys'),
        api.get('/superadmin/webhooks'),
        api.get('/superadmin/users')
      ]);
      setApiKeys(keysRes.data);
      setWebhooks(webhooksRes.data);
      setClients(usersRes.data.filter(u => u.role === 'admin'));
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // API Key Functions
  const handleCreateKey = async () => {
    if (!newKeyData.user || !newKeyData.name) {
      toast.error('Please select a client and provide a name for the key');
      return;
    }

    try {
      const { data } = await api.post('/superadmin/api-keys', newKeyData);
      setNewKey(data.key);
      setShowCreateKeyModal(false);
      setShowKeyModal(true);
      setNewKeyData({ user: '', name: '', description: '', permissions: ['read'] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create API key');
      console.error('Create key error:', error);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (window.confirm('Are you sure you want to revoke this API key? This will immediately disable any integrations using this key.')) {
      try {
        await api.put(`/superadmin/api-keys/${keyId}/revoke`);
        fetchData();
        toast.success('API key revoked successfully');
      } catch (error) {
        toast.error('Failed to revoke API key');
        console.error('Revoke error:', error);
      }
    }
  };

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyPermission = (permission) => {
    setNewKeyData(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions: newPermissions };
    });
  };

  // Webhook Functions
  const handleCreateWebhook = async () => {
    if (!newWebhookData.user || !newWebhookData.url || newWebhookData.events.length === 0) {
      toast.error('Please select a client, provide a URL, and select at least one event');
      return;
    }

    try {
      const { data } = await api.post('/superadmin/webhooks', newWebhookData);
      setWebhooks(prev => [data, ...prev]);
      setShowCreateWebhookModal(false);
      setNewWebhookData({ user: '', url: '', events: [], secret: '' });
      toast.success('Webhook created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create webhook');
      console.error('Create webhook error:', error);
    }
  };

  const handleDeleteWebhook = async (webhookId) => {
    if (window.confirm('Are you sure you want to delete this webhook? This will stop all event notifications to this endpoint.')) {
      try {
        await api.delete(`/superadmin/webhooks/${webhookId}`);
        setWebhooks(prev => prev.filter(wh => wh._id !== webhookId));
        toast.success('Webhook deleted successfully');
      } catch (error) {
        toast.error('Failed to delete webhook');
        console.error('Delete webhook error:', error);
      }
    }
  };

  const toggleWebhookEvent = (event) => {
    setNewWebhookData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const renderApiAccess = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Manage API Keys</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage API keys for client integrations</p>
        </div>
        <button
          onClick={() => setShowCreateKeyModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Create API Key
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading API keys...</p>
                  </td>
                </tr>
              ) : apiKeys.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <Key className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">No API keys found</p>
                    <button
                      onClick={() => setShowCreateKeyModal(true)}
                      className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
                    >
                      <Plus size={16} className="mr-2" />
                      Create First Key
                    </button>
                  </td>
                </tr>
              ) : (
                apiKeys.map(apiKey => (
                  <tr key={apiKey._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{apiKey.user?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{apiKey.user?.companyName || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{apiKey.name}</div>
                      {apiKey.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{apiKey.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {`${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 4)}`}
                        </span>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                          aria-label="Copy API key"
                        >
                          {copiedKey === apiKey.key ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        apiKey.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiKey.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <a
                          href="/api-docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Docs
                        </a>
                        {apiKey.status === 'active' && (
                          <button
                            onClick={() => handleRevokeKey(apiKey._id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <ShieldX size={16} className="mr-1" />
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWebhooks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Manage Webhooks</h2>
          <p className="text-sm text-gray-500 mt-1">Configure endpoints to receive real-time event notifications</p>
        </div>
        <button
          onClick={() => setShowCreateWebhookModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Create Webhook
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading webhooks...</p>
                  </td>
                </tr>
              ) : webhooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <Zap className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">No webhooks configured</p>
                    <button
                      onClick={() => setShowCreateWebhookModal(true)}
                      className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
                    >
                      <Plus size={16} className="mr-2" />
                      Create First Webhook
                    </button>
                  </td>
                </tr>
              ) : (
                webhooks.map(webhook => (
                  <tr key={webhook._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{webhook.user?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{webhook.user?.companyName || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-500 truncate max-w-xs">{webhook.url}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map(event => (
                          <span key={event} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            {event}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        webhook.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteWebhook(webhook._id)}
                        className="text-red-600 hover:text-red-900 flex items-center ml-auto"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">API & Webhooks</h1>
            <p className="mt-1 text-gray-500">
              Manage API access and webhook integrations for your application
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'api'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Key className="w-4 h-4 inline-block mr-2" />
              API Access
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'webhooks'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Zap className="w-4 h-4 inline-block mr-2" />
              Webhooks
            </button>
          </nav>
        </div>

        {activeTab === 'api' ? renderApiAccess() : renderWebhooks()}

        {/* Create API Key Modal */}
        <AnimatePresence>
          {showCreateKeyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New API Key</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client*</label>
                      <select
                        value={newKeyData.user}
                        onChange={(e) => setNewKeyData({...newKeyData, user: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">-- Select a Client --</option>
                        {clients.map(client => (
                          <option key={client._id} value={client._id}>
                            {client.name} ({client.companyName})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Key Name*</label>
                      <input
                        type="text"
                        value={newKeyData.name}
                        onChange={(e) => setNewKeyData({...newKeyData, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Production Server"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newKeyData.description}
                        onChange={(e) => setNewKeyData({...newKeyData, description: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Optional description..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                      <div className="space-y-2">
                        {['read', 'write', 'delete'].map(permission => (
                          <div key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`perm-${permission}`}
                              checked={newKeyData.permissions.includes(permission)}
                              onChange={() => toggleKeyPermission(permission)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`perm-${permission}`} className="ml-2 text-sm text-gray-700 capitalize">
                              {permission} access
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateKeyModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateKey}
                      disabled={!newKeyData.user || !newKeyData.name}
                      className={`px-4 py-2 rounded-lg text-white ${
                        !newKeyData.user || !newKeyData.name ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      Create Key
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* New API Key Modal */}
        <AnimatePresence>
          {showKeyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full"
              >
                <div className="p-6">
                  <div className="text-center">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">API Key Created Successfully</h3>
                    <p className="text-gray-500 mb-4">
                      Please copy this key and store it securely. You won't be able to see it again.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-sm break-all">{newKey}</code>
                      <button
                        onClick={() => copyToClipboard(newKey)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                      >
                        {copiedKey === newKey ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setShowKeyModal(false);
                        copyToClipboard(newKey);
                      }}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      I've copied the key
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Create Webhook Modal */}
        <AnimatePresence>
          {showCreateWebhookModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-xl max-w-lg w-full"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Webhook</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client*</label>
                      <select
                        value={newWebhookData.user}
                        onChange={(e) => setNewWebhookData({...newWebhookData, user: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">-- Select a Client --</option>
                        {clients.map(client => (
                          <option key={client._id} value={client._id}>
                            {client.name} ({client.companyName})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL*</label>
                      <input
                        type="url"
                        value={newWebhookData.url}
                        onChange={(e) => setNewWebhookData({...newWebhookData, url: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com/webhook"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                      <input
                        type="text"
                        value={newWebhookData.secret}
                        onChange={(e) => setNewWebhookData({...newWebhookData, secret: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Optional secret for verifying requests"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Events to send*</label>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_EVENTS.map(event => (
                          <label key={event} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newWebhookData.events.includes(event)}
                              onChange={() => toggleWebhookEvent(event)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-600">{event}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateWebhookModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateWebhook}
                      disabled={!newWebhookData.user || !newWebhookData.url || newWebhookData.events.length === 0}
                      className={`px-4 py-2 rounded-lg text-white ${
                        !newWebhookData.user || !newWebhookData.url || newWebhookData.events.length === 0
                          ? 'bg-indigo-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      Create Webhook
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ApiWebhooks;