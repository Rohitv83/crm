import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, User, Shield, Trash2, Clock, Search, Filter, 
  ChevronDown, ChevronUp, AlertCircle, Loader2, Calendar, UserCheck, UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/superadmin`,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`
  }
});

const actionIcons = {
  user_created: <UserCheck className="w-5 h-5 text-emerald-500" />,
  user_updated: <User className="w-5 h-5 text-blue-500" />,
  user_deleted: <UserX className="w-5 h-5 text-red-500" />,
  user_role_updated: <Shield className="w-5 h-5 text-indigo-500" />,
  login: <Activity className="w-5 h-5 text-purple-500" />,
  default: <Activity className="w-5 h-5 text-gray-500" />
};

const actionColors = {
  user_created: 'bg-emerald-100 text-emerald-800',
  user_updated: 'bg-blue-100 text-blue-800',
  user_deleted: 'bg-red-100 text-red-800',
  user_role_updated: 'bg-indigo-100 text-indigo-800',
  login: 'bg-purple-100 text-purple-800',
  default: 'bg-gray-100 text-gray-800'
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/activity-logs');
        setLogs(data);
      } catch (err) {
        setError('Failed to fetch activity logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs
    .filter(log => filter === 'all' || log.action === filter)
    .filter(log => {
      const matchesSearch = 
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Basic date filtering (would be enhanced with actual date comparisons)
      const matchesDate = dateRange === 'all' || true;
      
      return matchesSearch && matchesDate;
    });

  const toggleExpandLog = (logId) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const getActionLabel = (action) => {
    const labels = {
      user_created: 'User Created',
      user_updated: 'User Updated',
      user_deleted: 'User Deleted',
      user_role_updated: 'Role Updated',
      login: 'User Login',
      default: 'System Activity'
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600 mt-2">Track all system activities and user actions</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <select
                  id="action-filter"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                >
                  <option value="all">All Actions</option>
                  <option value="user_created">User Created</option>
                  <option value="user_updated">User Updated</option>
                  <option value="user_deleted">User Deleted</option>
                  <option value="user_role_updated">Role Changed</option>
                  <option value="login">Logins</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  id="date-range"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-end">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors">
                <Filter className="w-5 h-5 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs Timeline */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-indigo-600" />
              </motion.div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 flex flex-col items-center">
              <AlertCircle className="w-8 h-8 mb-2" />
              {error}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activity logs found matching your criteria
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLogs.map(log => (
                <motion.div 
                  key={log._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpandLog(log._id)}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-4 ${actionColors[log.action] || actionColors.default}`}>
                        {actionIcons[log.action] || actionIcons.default}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              <span className="font-semibold text-indigo-600">{log.actor.name}</span>
                              {' '}
                              <span className="capitalize">{getActionLabel(log.action)}</span>
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{log.details}</p>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1.5" />
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {expandedLog === log._id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedLog === log._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium text-gray-500">Actor:</span>{' '}
                              <span className="text-gray-700">{log.actor.name} ({log.actor.email})</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-gray-500">Action:</span>{' '}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${actionColors[log.action] || actionColors.default}`}>
                                {getActionLabel(log.action)}
                              </span>
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium text-gray-500">Date:</span>{' '}
                              <span className="text-gray-700 flex items-center">
                                <Calendar className="w-3 h-3 mr-1.5" />
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-gray-500">IP Address:</span>{' '}
                              <span className="text-gray-700">{log.ipAddress || 'Unknown'}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-2">Details</h4>
                          <p className="text-sm text-gray-600">{log.details}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityLogs;