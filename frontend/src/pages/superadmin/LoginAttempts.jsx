import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Clock, Loader2, CheckCircle, XCircle, Search, Filter, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const LoginAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAttempts();
  }, []);

  useEffect(() => {
    filterAndSortAttempts();
  }, [attempts, searchTerm, statusFilter, sortConfig]);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/superadmin/login-attempts');
      setAttempts(data);
    } catch (error) {
      console.error("Failed to fetch login attempts", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttempts();
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const filterAndSortAttempts = () => {
    let result = [...attempts];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(attempt => 
        attempt.email.toLowerCase().includes(term) || 
        attempt.ipAddress.includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const successFilter = statusFilter === 'success';
      result = result.filter(attempt => attempt.success === successFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredAttempts(result);
  };

  const getHeaderClass = (key) => {
    if (sortConfig.key !== key) return 'cursor-pointer hover:text-indigo-700';
    return sortConfig.direction === 'asc' 
      ? 'text-indigo-700 cursor-pointer' 
      : 'text-indigo-700 cursor-pointer';
  };

  const StatusBadge = ({ success }) => (
    success ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-fade-in">
        <CheckCircle className="w-4 h-4 mr-1.5" />
        Success
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 animate-fade-in">
        <XCircle className="w-4 h-4 mr-1.5" />
        Failed
      </span>
    )
  );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="relative">
              <div className="absolute bg-indigo-200 rounded-lg blur-sm opacity-75 animate-pulse-slow"></div>
              <div className="relative flex items-center p-2 rounded-lg ">
                <Clock className="w-8 h-8 text-indigo-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-800">Login Attempts Log</h1>
              </div>
            </div>
          </div>
          
           <button
              onClick={() => fetchLogs(1, true)}
              disabled={refreshing}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
              </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by email or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors duration-200"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors duration-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success Only</option>
                  <option value="failed">Failed Only</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('success')}
                  >
                    <div className="flex items-center">
                      <span className={getHeaderClass('success')}>Status</span>
                      {sortConfig.key === 'success' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1 text-indigo-600" /> : 
                        <ChevronDown className="w-4 h-4 ml-1 text-indigo-600" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      <span className={getHeaderClass('email')}>Email</span>
                      {sortConfig.key === 'email' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1 text-indigo-600" /> : 
                        <ChevronDown className="w-4 h-4 ml-1 text-indigo-600" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('ipAddress')}
                  >
                    <div className="flex items-center">
                      <span className={getHeaderClass('ipAddress')}>IP Address</span>
                      {sortConfig.key === 'ipAddress' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1 text-indigo-600" /> : 
                        <ChevronDown className="w-4 h-4 ml-1 text-indigo-600" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      <span className={getHeaderClass('createdAt')}>Time</span>
                      {sortConfig.key === 'createdAt' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1 text-indigo-600" /> : 
                        <ChevronDown className="w-4 h-4 ml-1 text-indigo-600" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading login attempts...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Search className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg">No login attempts found</p>
                        <p className="text-sm">Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((attempt, index) => (
                    <tr 
                      key={attempt._id} 
                      className="hover:bg-indigo-50 transition-colors duration-150 animate-fade-in-down"
                      style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge success={attempt.success} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded-md">
                          {attempt.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md font-medium">
                          {attempt.ipAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(attempt.createdAt).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {!loading && filteredAttempts.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredAttempts.length}</span> of <span className="font-semibold">{attempts.length}</span> login attempts
              </p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from { 
            opacity: 0;
            transform: translate3d(0, -10px, 0);
          }
          to { 
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes pulseSlow {
          0% { opacity: 0.7; }
          50% { opacity: 0.5; }
          100% { opacity: 0.7; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out both;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginAttempts;