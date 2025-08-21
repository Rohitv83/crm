import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileJson, Loader2, Search, CheckCircle, XCircle, Filter, Download, Calendar, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ApiUsage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statusCode: '',
    method: '',
    dateRange: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 20;

  const fetchLogs = async (pageNum = 1, refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
        statusCode: filters.statusCode,
        method: filters.method,
        dateRange: filters.dateRange,
        sortBy,
        sortOrder
      });

      const { data } = await api.get(`/superadmin/api-usage-logs?${params}`);
      setLogs(data.logs || data);
      setTotalPages(data.totalPages || Math.ceil((data.totalCount || data.length) / ITEMS_PER_PAGE));
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch API usage logs", error);
      toast.error('Failed to load API usage logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchLogs(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const getStatusIcon = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (statusCode >= 400 && statusCode < 500) {
      return <XCircle className="w-4 h-4 text-orange-500" />;
    }
    if (statusCode >= 500) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-50';
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-600 bg-orange-50';
    if (statusCode >= 500) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-700',
      POST: 'bg-green-100 text-green-700',
      PUT: 'bg-yellow-100 text-yellow-700',
      DELETE: 'bg-red-100 text-red-700',
      PATCH: 'bg-purple-100 text-purple-700'
    };
    return colors[method] || 'bg-gray-100 text-gray-700';
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/superadmin/api-usage-logs/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `api-usage-logs-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export started successfully');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const clearFilters = () => {
    setFilters({
      statusCode: '',
      method: '',
      dateRange: ''
    });
    setSearchTerm('');
  };

  const filteredLogs = logs.filter(log =>
    log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ipAddress?.includes(searchTerm) ||
    log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <FileJson className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">API Usage Analytics</h1>
              <p className="text-gray-500 mt-1">Monitor and analyze API requests in real-time</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => fetchLogs(1, true)}
              disabled={refreshing}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Code</label>
                  <select
                    value={filters.statusCode}
                    onChange={(e) => setFilters({...filters, statusCode: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">All Status Codes</option>
                    <option value="2xx">2xx Success</option>
                    <option value="4xx">4xx Client Error</option>
                    <option value="5xx">5xx Server Error</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HTTP Method</label>
                  <select
                    value={filters.method}
                    onChange={(e) => setFilters({...filters, method: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">All Methods</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, name, endpoint, or IP..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{logs.length}</div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(log => log.statusCode >= 200 && log.statusCode < 300).length}
            </div>
            <div className="text-sm text-gray-500">Successful</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {logs.filter(log => log.statusCode >= 400 && log.statusCode < 500).length}
            </div>
            <div className="text-sm text-gray-500">Client Errors</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(log => log.statusCode >= 500).length}
            </div>
            <div className="text-sm text-gray-500">Server Errors</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('user.name')}
                  >
                    Client {sortBy === 'user.name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('endpoint')}
                  >
                    Endpoint {sortBy === 'endpoint' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('statusCode')}
                  >
                    Status {sortBy === 'statusCode' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ipAddress')}
                  >
                    IP Address {sortBy === 'ipAddress' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    Time {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                      <p className="mt-2 text-gray-500">Loading API usage logs...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8">
                      <div className="text-gray-400">
                        <Search className="w-12 h-12 mx-auto mb-2" />
                        <p>No logs found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr 
                      key={log._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{log.user?.name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{log.user?.email}</div>
                        {log.user?.companyName && (
                          <div className="text-xs text-gray-400">{log.user.companyName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(log.method)}`}>
                            {log.method}
                          </span>
                          <span className="font-mono text-sm text-gray-600 break-all">
                            {log.endpoint}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.statusCode)}`}>
                          {getStatusIcon(log.statusCode)}
                          <span>{log.statusCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.ipAddress}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchLogs(pageNum)}
                    className={`px-3 py-2 border rounded-lg ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Log Detail Modal */}
        <AnimatePresence>
          {selectedLog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Request Details</h3>
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Client Information</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p><strong>Name:</strong> {selectedLog.user?.name || 'Unknown'}</p>
                        <p><strong>Email:</strong> {selectedLog.user?.email || 'N/A'}</p>
                        <p><strong>Company:</strong> {selectedLog.user?.companyName || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Request Details</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p><strong>Method:</strong> <span className={getMethodColor(selectedLog.method)}>{selectedLog.method}</span></p>
                        <p><strong>Endpoint:</strong> {selectedLog.endpoint}</p>
                        <p><strong>Status:</strong> <span className={getStatusColor(selectedLog.statusCode)}>{selectedLog.statusCode}</span></p>
                        <p><strong>IP Address:</strong> {selectedLog.ipAddress}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Timestamps</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p><strong>Request Time:</strong> {new Date(selectedLog.createdAt).toLocaleString()}</p>
                        {selectedLog.responseTime && (
                          <p><strong>Response Time:</strong> {selectedLog.responseTime}ms</p>
                        )}
                      </div>
                    </div>
                    
                    {selectedLog.requestBody && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Request Body</h4>
                        <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-sm">
                          {JSON.stringify(selectedLog.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {selectedLog.responseBody && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Response Body</h4>
                        <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-sm">
                          {JSON.stringify(selectedLog.responseBody, null, 2)}
                        </pre>
                      </div>
                    )}
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

export default ApiUsage;