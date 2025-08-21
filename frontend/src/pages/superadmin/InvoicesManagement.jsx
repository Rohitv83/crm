import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, PlusCircle, Edit, Trash2, Loader2, X, DollarSign, Calendar, User, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors = {
  paid: 'bg-green-100 text-green-800',
  sent: 'bg-blue-100 text-blue-800',
  overdue: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',
};

const InvoicesManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form state
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invoicesRes, usersRes] = await Promise.all([
          api.get('/superadmin/invoices'),
          api.get('/superadmin/users')
        ]);
        setInvoices(invoicesRes.data);
        setClients(usersRes.data.filter(u => u.role === 'admin' || u.role === 'user'));
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' || field === 'price' ? Number(value) : value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const openModal = (invoice = null) => {
    setSelectedInvoice(invoice);
    if (invoice) {
      setClientId(invoice.client._id);
      setDueDate(new Date(invoice.dueDate).toISOString().split('T')[0]);
      setStatus(invoice.status);
      setItems(invoice.items);
    } else {
      setClientId('');
      setDueDate('');
      setStatus('draft');
      setItems([{ description: '', quantity: 1, price: 0 }]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    if (!clientId || !dueDate || items.some(item => !item.description || item.price <= 0)) {
      alert('Please fill all required fields and ensure all items have valid prices');
      return;
    }

    const payload = { 
      client: clientId, 
      dueDate, 
      status, 
      items,
      totalAmount: calculateTotal(items)
    };

    try {
      if (selectedInvoice) {
        await api.put(`/superadmin/invoices/${selectedInvoice._id}`, payload);
      } else {
        await api.post('/superadmin/invoices', payload);
      }
      // Refresh data
      const { data } = await api.get('/superadmin/invoices');
      setInvoices(data);
      closeModal();
    } catch (error) {
      alert('Error saving invoice. Please try again.');
    }
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/superadmin/invoices/${invoiceId}`);
        setInvoices(invoices.filter(invoice => invoice._id !== invoiceId));
      } catch (error) {
        alert('Failed to delete invoice.');
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoices Management</h1>
            <p className="text-gray-600">Manage and track all your invoices in one place</p>
          </div>
          <button 
            onClick={() => openModal()} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors shadow-md"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin inline-block" />
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(invoice => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-indigo-600 font-medium">
                        #{invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{invoice.client.companyName || invoice.client.name}</div>
                        <div className="text-gray-500">{invoice.client.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                        ${invoice.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[invoice.status]}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => openModal(invoice)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice._id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Invoice Modal */}
        <AnimatePresence>
          {isModalOpen && (
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
                className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                    </h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client*</label>
                        <select 
                          value={clientId} 
                          onChange={e => setClientId(e.target.value)} 
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select a Client</option>
                          {clients.map(client => (
                            <option key={client._id} value={client._id}>
                              {client.name} {client.companyName && `(${client.companyName})`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date*</label>
                        <input 
                          type="date" 
                          value={dueDate} 
                          onChange={e => setDueDate(e.target.value)} 
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        />
                      </div>
                    </div>

                    <div className="w-full md:w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select 
                        value={status} 
                        onChange={e => setStatus(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Items</h3>
                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-6">
                              <input
                                type="text"
                                placeholder="Description*"
                                value={item.description}
                                onChange={e => handleItemChange(index, 'description', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="1"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div className="col-span-3">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500">$</span>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Price*"
                                  value={item.price}
                                  onChange={e => handleItemChange(index, 'price', e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg p-2.5 pl-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button 
                                onClick={() => removeItem(index)} 
                                className="text-red-500 hover:text-red-700"
                                disabled={items.length <= 1}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={addItem} 
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center"
                        >
                          <PlusCircle className="w-4 h-4 mr-1" /> Add Item
                        </button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="text-xl font-bold text-gray-800">
                          ${calculateTotal(items).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                      <button 
                        onClick={closeModal} 
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSubmit} 
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm"
                      >
                        {selectedInvoice ? 'Update Invoice' : 'Create Invoice'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvoicesManagement;