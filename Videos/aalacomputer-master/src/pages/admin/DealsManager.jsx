import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, Save, TrendingUp, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { apiCall } from '../../config/api';

const DealsManager = ({ onStatsUpdate }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState({
    name: '', title: '', price: '', originalPrice: '', discount: '', description: '', imageUrl: '', stock: 0
  });

  useEffect(() => { loadDeals(); }, []);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/admin/deals').catch(() => ({ deals: [] }));
      setDeals(data.deals || []);
      if (onStatsUpdate) onStatsUpdate();
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dealData = { ...formData, price: parseFloat(formData.price) || 0, originalPrice: parseFloat(formData.originalPrice) || 0, discount: parseInt(formData.discount) || 0, stock: parseInt(formData.stock) || 0 };
      if (editingDeal) {
        await apiCall(`/api/admin/deals/${editingDeal._id}`, { method: 'PUT', body: JSON.stringify(dealData) });
        setSuccess('Deal updated!');
      } else {
        await apiCall('/api/admin/deals', { method: 'POST', body: JSON.stringify(dealData) });
        setSuccess('Deal created!');
      }
      setShowModal(false);
      resetForm();
      loadDeals();
    } catch (err) {
      setError(err.message || 'Failed to save deal');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this deal?')) return;
    setLoading(true);
    try {
      await apiCall(`/api/admin/deals/${id}`, { method: 'DELETE' });
      setSuccess('Deal deleted!');
      loadDeals();
    } catch { setError('Failed to delete'); } finally { setLoading(false); }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({ name: deal.name || deal.Name || '', title: deal.title || deal.name || '', price: deal.price || '', originalPrice: deal.originalPrice || '', discount: deal.discount || '', description: deal.description || '', imageUrl: deal.imageUrl || deal.img || '', stock: deal.stock || 0 });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', title: '', price: '', originalPrice: '', discount: '', description: '', imageUrl: '', stock: 0 });
    setEditingDeal(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold mb-2">Deals Management</h2><p className="text-gray-400">{deals.length} active deals</p></div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl font-semibold hover:shadow-lg transition-all"><Plus className="w-5 h-5" />Add Deal</button>
      </div>

      <AnimatePresence>
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-400"><AlertCircle className="w-5 h-5" />{error}</motion.div>}
        {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500 rounded-xl text-green-400"><CheckCircle className="w-5 h-5" />{success}</motion.div>}
      </AnimatePresence>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search deals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500" />
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 animate-spin text-pink-500" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.filter(d => (d.name || d.Name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(deal => (
            <motion.div key={deal._id || deal.id} whileHover={{ y: -4 }} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-pink-500 transition-all">
              <div className="aspect-square bg-gray-900 rounded-lg mb-3 overflow-hidden"><img src={deal.imageUrl || deal.img || '/placeholder.svg'} alt={deal.name} className="w-full h-full object-contain" onError={(e) => e.target.src = '/placeholder.svg'} /></div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{deal.name || deal.Name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-pink-400 font-bold text-xl">PKR {(deal.price || 0).toLocaleString()}</span>
                {deal.originalPrice && <span className="text-gray-500 line-through text-sm">PKR {deal.originalPrice.toLocaleString()}</span>}
                {deal.discount && <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">{deal.discount}% OFF</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(deal)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"><Edit className="w-4 h-4" />Edit</button>
                <button onClick={() => handleDelete(deal._id || deal.id)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"><Trash2 className="w-4 h-4" />Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6"><h3 className="text-2xl font-bold">{editingDeal ? 'Edit Deal' : 'Add Deal'}</h3><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-800 rounded-lg"><X className="w-6 h-6" /></button></div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-2">Deal Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value, title: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium mb-2">Price *</label><input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500" /></div>
                  <div><label className="block text-sm font-medium mb-2">Original Price</label><input type="number" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500" /></div>
                  <div><label className="block text-sm font-medium mb-2">Discount %</label><input type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-2">Image URL</label><input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500" /></div>
                <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500" /></div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">{loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}{editingDeal ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DealsManager;
