import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { api, formatApiErrorDetail } from '@/lib/api';
import { toast } from 'sonner';

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // For calendar
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const [newPromo, setNewPromo] = useState({
    title: '',
    description: '',
    type: 'FLASH',
    starts_at: '',
    expires_at: ''
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/promotions');
      if (res.data?.success) {
        setPromotions(res.data.data);
      }
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/admin/promotions', newPromo);
      if (res.data?.success) {
        toast.success('Promotion created successfully!');
        setShowModal(false);
        setNewPromo({ title: '', description: '', type: 'FLASH', starts_at: '', expires_at: '' });
        fetchPromotions();
      }
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Failed to create promotion');
    } finally {
      setSaving(false);
    }
  };

  const getEventsForDay = (day) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const targetIso = targetDate.toISOString().split('T')[0];
    
    return promotions.filter(p => {
      if (!p.starts_at) return false;
      const pStart = p.starts_at.split('T')[0];
      return pStart === targetIso;
    });
  };

  const getPromoColor = (type) => {
    switch(type) {
      case 'HOLIDAY': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'FLASH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'SEASONAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-fp-navy w-40">{monthName}</h2>
          <div className="flex space-x-1">
            <button onClick={prevMonth} className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700">
              Today
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-fp-navy text-white rounded-lg text-sm font-medium hover:bg-[#2A3F54] transition-colors ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Promotion
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && <div className="p-4 bg-blue-50 text-center text-sm font-medium text-blue-600 animate-pulse">Syncing calendar...</div>}
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar body */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] p-2 border-b border-r border-gray-100 bg-gray-50/30"></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

            return (
              <div 
                key={day} 
                className={`min-h-[120px] p-2 border-b border-r border-gray-100 transition-colors hover:bg-gray-50 ${isToday ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-fp-navy text-white' : 'text-gray-700'}`}>
                    {day}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {dayEvents.map((evt, eIdx) => (
                    <div 
                      key={eIdx} 
                      className={`px-2 py-1 text-xs font-semibold rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${getPromoColor(evt.type)}`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {Array.from({ length: 42 - (startDay + daysInMonth) }).map((_, i) => (
            <div key={`empty-end-${i}`} className="min-h-[120px] p-2 border-b border-r border-gray-100 bg-gray-50/30"></div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-fp-navy">New Promotion</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-fp-navy"
                  value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-fp-navy h-20 resize-none"
                  value={newPromo.description} onChange={e => setNewPromo({...newPromo, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-fp-navy bg-white"
                  value={newPromo.type} onChange={e => setNewPromo({...newPromo, type: e.target.value})}
                >
                  <option value="FLASH">Flash Sale</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="SEASONAL">Seasonal</option>
                  <option value="REFERRAL">Referral</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Starts At</label>
                  <input 
                    type="datetime-local" required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-fp-navy text-sm"
                    value={newPromo.starts_at} onChange={e => setNewPromo({...newPromo, starts_at: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expires At</label>
                  <input 
                    type="datetime-local" required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-fp-navy text-sm"
                    value={newPromo.expires_at} onChange={e => setNewPromo({...newPromo, expires_at: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-fp-navy hover:bg-[#2A3F54] text-white font-bold rounded-lg disabled:opacity-50">
                  {saving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
