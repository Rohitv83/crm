import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Mail, Edit, Trash2, PlusCircle, X, Loader2, Eye, 
  ChevronDown, ChevronUp, Search, Code, Type, FileText, Calendar // FIX: Added Calendar icon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmailManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/superadmin/email-templates');
      setTemplates(data);
    } catch (error) {
      setError('Failed to fetch email templates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openModal = (template = null) => {
    setSelectedTemplate(template);
    setName(template ? template.name : '');
    setSubject(template ? template.subject : '');
    setBody(template ? template.body : '');
    setIsModalOpen(true);
  };

  const openPreview = (template) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedTemplate(null);
  };

  const toggleExpandTemplate = (templateId) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      alert('Please fill all fields.');
      return;
    }

    setIsSubmitting(true);
    const payload = { name, subject, body };
    
    try {
      if (selectedTemplate) {
        await api.put(`/superadmin/email-templates/${selectedTemplate._id}`, payload);
      } else {
        await api.post('/superadmin/email-templates', payload);
      }
      await fetchTemplates();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving template. Name must be unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/superadmin/email-templates/${templateId}`);
      await fetchTemplates();
    } catch (error) {
      alert('Failed to delete template. Please try again.');
    }
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen"
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
              style={{ color: '#2c3e50' }}
            >
              Email Template Management
            </motion.h1>
            <p className="text-gray-600">Create and manage reusable email templates</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
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
              New Template
            </motion.button>
          </div>
        </div>

        {/* Templates List */}
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
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            {searchTerm ? 'No templates match your search' : 'No templates found. Create your first template!'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map(template => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all"
              >
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleExpandTemplate(template._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center">
                        <Mail className="w-5 h-5 text-indigo-600 mr-3" />
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(template);
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
                          title="Preview template"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(template);
                          }}
                          className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                          title="Edit template"
                        >
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(template._id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
                          title="Delete template"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                      
                      {expandedTemplate === template._id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedTemplate === template._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6"
                    >
                      <div className="border-t border-gray-200 pt-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FileText className="w-5 h-5 text-indigo-500 mr-2" />
                            Template Preview
                          </h4>
                          <div className="prose max-w-none text-black" dangerouslySetInnerHTML={{ __html: template.body }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Template Edit/Create Modal */}
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
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                    </h2>
                    <button 
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Welcome Email" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Welcome to Our Platform!" 
                        value={subject} 
                        onChange={e => setSubject(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Email Body (HTML supported)</label>
                        <div className="flex items-center text-sm text-gray-500">
                          <Code className="w-4 h-4 mr-1" />
                          HTML Editor
                        </div>
                      </div>
                      <textarea 
                        placeholder="Enter your email content here..."
                        value={body} 
                        onChange={e => setBody(e.target.value)} 
                        rows={12}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-black"
                      />
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
                          {selectedTemplate ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        selectedTemplate ? 'Update Template' : 'Create Template'
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Template Preview Modal */}
        <AnimatePresence>
          {isPreviewOpen && selectedTemplate && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={closePreview}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Template Preview: {selectedTemplate.name}
                    </h2>
                    <button 
                      onClick={closePreview}
                      className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Subject:</h3>
                      <p className="text-gray-700">{selectedTemplate.subject}</p>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-800 text-white px-4 py-2 flex items-center">
                        <Type className="w-4 h-4 mr-2" />
                        <span>Email Preview</span>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="prose max-w-none text-black" dangerouslySetInnerHTML={{ __html: selectedTemplate.body }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closePreview}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close Preview
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EmailManagement;
