import { useState } from "react";
import axios from "axios";

export default function Register() {
  // Form steps
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    companyName: "",
    companySize: "",
    industryType: "",
    password: "",
    plan: "",
    terms: false,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Root color variables
  const primaryColor = "#6366f1";
  const primaryHover = "#4f46e5";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.terms) {
      setError("You must accept the Terms and Conditions to register.");
      setStep(4); // Jump to last step where terms are
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      setMessage(res.data.message);
      setStep(5); // Success step
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full mx-auto bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Branding/Image */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <div className="flex items-center mb-6">
              <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
              <span className="text-2xl font-bold">CRM Pro</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Transform Your Customer Relationships</h2>
            <p className="text-indigo-100 mb-8">
              Join thousands of businesses managing their customer interactions more effectively with our powerful CRM platform.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 mt-1 mr-3 text-indigo-200 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium">Centralized Customer Data</h4>
                  <p className="text-sm text-indigo-200">All your customer information in one secure place</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-5 h-5 mt-1 mr-3 text-indigo-200 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium">Actionable Insights</h4>
                  <p className="text-sm text-indigo-200">Powerful analytics to drive your business decisions</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-5 h-5 mt-1 mr-3 text-indigo-200 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium">24/7 Support</h4>
                  <p className="text-sm text-indigo-200">Our team is always ready to help you succeed</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/women/12.jpg" alt="Testimonial" />
              </div>
              <div>
                <p className="text-sm text-indigo-200">"CRM Pro helped us increase our customer retention by 40% in just 3 months!"</p>
                <p className="text-xs font-medium mt-1">- Sarah Johnson, Marketing Director</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= i ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  style={{ backgroundColor: step >= i ? primaryColor : undefined }}
                >
                  {i}
                </div>
                <span className={`text-xs mt-1 ${step >= i ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                  {i === 1 && 'Personal'}
                  {i === 2 && 'Company'}
                  {i === 3 && 'Plan'}
                  {i === 4 && 'Review'}
                </span>
              </div>
            ))}
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {step === 5 ? (
            // Success Step
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-6">Thank you for joining CRM Pro. We've sent a confirmation email to {formData.email}.</p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{ 
                  backgroundColor: primaryColor,
                  hoverBackgroundColor: primaryHover,
                }}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-gray-600">Tell us about yourself</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Company Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Company Information</h3>
                  <p className="text-gray-600">Tell us about your business</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input 
                        type="text" 
                        id="companyName" 
                        name="companyName" 
                        value={formData.companyName} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                      <select
                        id="companySize" 
                        name="companySize" 
                        value={formData.companySize} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        required
                      >
                        <option value="">Select number of employees</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="501+">501+</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="industryType" className="block text-sm font-medium text-gray-700 mb-1">Industry Type</label>
                      <input 
                        type="text" 
                        id="industryType" 
                        name="industryType" 
                        value={formData.industryType} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
                      <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        required 
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 characters with at least one number</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Plan Selection */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Choose Your Plan</h3>
                  <p className="text-gray-600">Select the plan that fits your business needs</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <label className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.plan === 'basic' ? 'ring-2 border-indigo-500' : 'border-gray-300 hover:border-gray-400'}`}>
                      <input type="radio" name="plan" value="basic" checked={formData.plan === 'basic'} onChange={handleChange} className="hidden" />
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">Basic</span>
                          <span className="font-medium text-indigo-600">$10/month</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Perfect for small businesses getting started</p>
                        <ul className="mt-3 text-sm text-gray-600 space-y-2">
                          <li className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Up to 100 contacts
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Basic reporting
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Email support
                          </li>
                        </ul>
                      </div>
                    </label>
                    
                    <label className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.plan === 'pro' ? 'ring-2 border-indigo-500' : 'border-gray-300 hover:border-gray-400'}`}>
                      <input type="radio" name="plan" value="pro" checked={formData.plan === 'pro'} onChange={handleChange} className="hidden" />
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">Professional</span>
                          <span className="font-medium text-indigo-600">$25/month</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">For growing businesses with more complex needs</p>
                        <ul className="mt-3 text-sm text-gray-600 space-y-2">
                          <li className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Up to 1000 contacts
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Advanced reporting
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Priority support
                          </li>
                        </ul>
                      </div>
                    </label>
                    
                    <label className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.plan === 'enterprise' ? 'ring-2 border-indigo-500' : 'border-gray-300 hover:border-gray-400'}`}>
                      <input type="radio" name="plan" value="enterprise" checked={formData.plan === 'enterprise'} onChange={handleChange} className="hidden" />
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">Enterprise</span>
                          <span className="font-medium text-indigo-600">Custom Pricing</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">For large organizations with custom requirements</p>
                        <ul className="mt-3 text-sm text-gray-600 space-y-2">
                          <li className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Unlimited contacts
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Custom integrations
                          </li>
                          <li className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            24/7 dedicated support
                          </li>
                        </ul>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 4: Review and Terms */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Review Your Information</h3>
                  <p className="text-gray-600">Please verify your details before submitting</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <p className="text-gray-500">Full Name</p>
                        <p>{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p>{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p>{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Address</p>
                        <p>{formData.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Company Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <p className="text-gray-500">Company Name</p>
                        <p>{formData.companyName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Company Size</p>
                        <p>{formData.companySize}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Industry</p>
                        <p>{formData.industryType}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Selected Plan</h4>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium text-indigo-600 capitalize">
                        {formData.plan} Plan
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input 
                        id="terms" 
                        name="terms" 
                        type="checkbox" 
                        checked={formData.terms} 
                        onChange={handleChange} 
                        className="h-4 w-4 rounded border-gray-300 focus:ring-indigo-500 text-indigo-600" 
                        required
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        I agree to the <a href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">Terms and Conditions</a> and <a href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {step > 1 && step < 5 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="py-2 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                )}
                
                {step < 4 ? (
                  <button
                    type="submit"
                    className="ml-auto py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    style={{ backgroundColor: primaryColor, hoverBackgroundColor: primaryHover }}
                  >
                    Continue
                  </button>
                ) : step === 4 && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                    style={{ 
                      backgroundColor: loading ? '#a5b4fc' : primaryColor, 
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Complete Registration'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
