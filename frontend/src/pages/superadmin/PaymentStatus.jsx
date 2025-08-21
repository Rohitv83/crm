    import React, { useState, useEffect } from 'react';
    import api from '../../utils/api';
    import { DollarSign, PlusCircle, Loader2, X, Calendar, User, FileText } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';

    const PaymentStatus = () => {
      const [payments, setPayments] = useState([]);
      const [invoices, setInvoices] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isModalOpen, setIsModalOpen] = useState(false);
      
      // Form state
      const [invoiceId, setInvoiceId] = useState('');
      const [amount, setAmount] = useState('');
      const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
      const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
      const [transactionId, setTransactionId] = useState('');

      const fetchData = async () => {
        setLoading(true);
        try {
          const [paymentsRes, invoicesRes] = await Promise.all([
            api.get('/superadmin/payments'),
            api.get('/superadmin/invoices') 
          ]);
          setPayments(paymentsRes.data);
          // Filter for invoices that are not yet paid
          setInvoices(invoicesRes.data.filter(inv => inv.status !== 'paid'));
        } catch (error) {
          console.error("Failed to fetch data", error);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchData();
      }, []);
      
      const openModal = () => setIsModalOpen(true);
      const closeModal = () => {
        setIsModalOpen(false);
        // Reset form
        setInvoiceId('');
        setAmount('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('bank_transfer');
        setTransactionId('');
      };

      const handleSubmit = async () => {
        if (!invoiceId || !amount || !paymentDate) {
          alert('Please fill all required fields.');
          return;
        }
        try {
          await api.post('/superadmin/payments', { invoiceId, amount, paymentDate, paymentMethod, transactionId });
          fetchData();
          closeModal();
        } catch (error) {
          alert('Error recording payment.');
        }
      };

      return (
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Payments Status</h1>
              <button onClick={openModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
                <PlusCircle className="w-5 h-5 mr-2" />
                Record Payment
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center p-8"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin inline-block" /></td></tr>
                  ) : payments.map(payment => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-indigo-600">{payment.invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{payment.invoice.client.companyName || payment.invoice.client.name}</td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-700">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-700 capitalize">{payment.paymentMethod.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimatePresence>
              {isModalOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-lg p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold mb-6">Record New Payment</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Invoice*</label>
                        <select value={invoiceId} onChange={e => setInvoiceId(e.target.value)} className="w-full mt-1 border border-gray-300 rounded-lg p-2">
                          <option value="">Select an unpaid invoice</option>
                          {invoices.map(inv => <option key={inv._id} value={inv._id}>{inv.invoiceNumber} - {inv.client.name} (${inv.totalAmount.toFixed(2)})</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Amount Paid*</label>
                          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full mt-1 border border-gray-300 rounded-lg p-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Payment Date*</label>
                          <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full mt-1 border border-gray-300 rounded-lg p-2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full mt-1 border border-gray-300 rounded-lg p-2">
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="cash">Cash</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Transaction ID (Optional)</label>
                          <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full mt-1 border border-gray-300 rounded-lg p-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button onClick={closeModal} className="px-4 py-2 rounded-lg border">Cancel</button>
                      <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Record Payment</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    };

    export default PaymentStatus;
    