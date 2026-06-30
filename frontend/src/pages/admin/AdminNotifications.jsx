import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, Plus, Clock, Users, X } from 'lucide-react';
import { api, formatApiErrorDetail } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [newNotif, setNewNotif] = useState({
    title: '',
    body: '',
    target_tier: ''
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/history');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const res = await api.post('/notifications/send', {
        title: newNotif.title,
        body: newNotif.body,
        target_tier: newNotif.target_tier || null
      });
      if (res.data?.success) {
        toast.success(`Sent to ${res.data.data.sent_count} users!`);
        setShowModal(false);
        setNewNotif({ title: '', body: '', target_tier: '' });
        fetchHistory();
      }
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-fp-navy">Notification History</h2>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fp-navy transition-all text-sm"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 border border-transparent bg-fp-navy rounded-lg text-sm font-medium text-white hover:bg-[#2A3F54] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Send New
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading history...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications sent yet.</div>
        ) : notifications.map((notif) => (
          <div key={notif.id} className="p-6 flex gap-4 transition-colors hover:bg-gray-50/50">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-gray-900">
                  {notif.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500 font-medium">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {new Date(notif.sent_at).toLocaleString()}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{notif.body}</p>
              
              <div className="flex items-center space-x-4 text-xs font-medium text-gray-500">
                <span className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1" />
                  Sent to {notif.sent_count} {notif.target_tier ? `${notif.target_tier} users` : 'users (All Tiers)'}
                </span>
                <span>Opened: {notif.open_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-fp-navy flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Send Push Notification
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSend} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-fp-navy"
                  value={newNotif.title}
                  onChange={(e) => setNewNotif({...newNotif, title: e.target.value})}
                  placeholder="e.g., Flash Sale!"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message Body</label>
                <textarea 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-fp-navy resize-none h-24"
                  value={newNotif.body}
                  onChange={(e) => setNewNotif({...newNotif, body: e.target.value})}
                  placeholder="Enter the message you want to push to phones..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target Tier (Optional)</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-fp-navy bg-white"
                  value={newNotif.target_tier}
                  onChange={(e) => setNewNotif({...newNotif, target_tier: e.target.value})}
                >
                  <option value="">All Tiers</option>
                  <option value="Bronze">Bronze Only</option>
                  <option value="Silver">Silver Only</option>
                  <option value="Gold">Gold Only</option>
                  <option value="Platinum">Platinum Only</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Leave empty to send to everyone.</p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={sending}
                  className="px-6 py-2 bg-fp-navy hover:bg-[#2A3F54] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
