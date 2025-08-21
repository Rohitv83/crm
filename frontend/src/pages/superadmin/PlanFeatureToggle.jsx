import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { SlidersHorizontal, CheckSquare, Square, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PlanFeatureToggle = () => {
  const [plans, setPlans] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planPermissions, setPlanPermissions] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async (reselectId = null) => {
    setLoading(true);
    try {
      const [plansRes, permissionsRes] = await Promise.all([
        api.get('/superadmin/plans'),
        api.get('/superadmin/permissions')
      ]);
      
      setPlans(plansRes.data);
      setAllPermissions(permissionsRes.data);

      const currentSelectedId = reselectId || selectedPlan?._id;
      const currentPlan = plansRes.data.find(p => p._id === currentSelectedId);

      if (currentPlan) {
        setSelectedPlan(currentPlan);
        setPlanPermissions(currentPlan.permissions || []);
      } else if (plansRes.data.length > 0) {
        // Fallback to the first plan on initial load
        const firstPlan = plansRes.data[0];
        setSelectedPlan(firstPlan);
        setPlanPermissions(firstPlan.permissions || []);
      }

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setPlanPermissions(plan.permissions || []);
  };

  const handlePermissionToggle = (permission) => {
    setPlanPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission) 
        : [...prev, permission]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    
    // Create the payload with all plan data plus the updated permissions
    const payload = {
        ...selectedPlan,
        permissions: planPermissions
    };

    try {
      await api.put(`/superadmin/plans/${selectedPlan._id}`, payload);
      // Pass the ID of the saved plan to fetchData to keep it selected
      await fetchData(selectedPlan._id); 
    } catch (error) {
      alert('Error saving plan permissions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
       <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Plan-Based Feature Toggle</h1>
        <p className="text-gray-600 mb-8">Enable or disable specific features for each subscription plan.</p>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h2 className="font-bold text-lg text-gray-700 mb-4">Subscription Plans</h2>
                <div className="space-y-2">
                  {plans.map(plan => (
                    <button 
                      key={plan._id}
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                        selectedPlan?._id === plan._id 
                          ? 'bg-indigo-600 text-white shadow' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <SlidersHorizontal className="w-5 h-5 mr-3" />
                      <span className="capitalize font-medium">{plan.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:w-3/4">
              {selectedPlan ? (
                <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y:0 }} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Features for <span className="text-indigo-600 capitalize">{selectedPlan.name}</span>
                      </h2>
                      <p className="text-gray-500 mt-1">Toggle features available in this plan.</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveChanges} 
                      disabled={saving}
                      className="mt-4 md:mt-0 bg-emerald-500 text-white px-5 py-2.5 rounded-lg flex items-center hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allPermissions.map(p => (
                      <motion.label 
                        key={p} 
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={planPermissions.includes(p)}
                          onChange={() => handlePermissionToggle(p)}
                          className="hidden"
                        />
                        {planPermissions.includes(p) ? 
                          <CheckSquare className="w-5 h-5 text-indigo-600" /> : 
                          <Square className="w-5 h-5 text-gray-400" />
                        }
                        <span className="capitalize text-gray-700 select-none">{p.replace(/_/g, ' ')}</span>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center p-10 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">Select a plan to configure its features.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanFeatureToggle;