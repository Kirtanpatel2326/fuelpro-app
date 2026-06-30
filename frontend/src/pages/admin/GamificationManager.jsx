import React, { useState, useEffect } from 'react';
import { Gift, Award, Plus, Trash2, Edit } from 'lucide-react';
import { api } from '@/lib/api';

import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const GamificationManager = () => {
  const [challenges, setChallenges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChallengeData, setNewChallengeData] = useState({ title: '', points: 0, requirement: '' });

  const fetchChallenges = async () => {
    try {
      const { data } = await api.get('/gamification/challenges');
      setChallenges(data);
    } catch (error) {
      console.error("Error fetching challenges", error);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this challenge?")) {
      try {
        await api.delete(`/gamification/challenges/${id}`);
        fetchChallenges();
      } catch (error) {
        console.error("Error deleting challenge", error);
      }
    }
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleCreateConfirm = async () => {
    try {
      if (!newChallengeData.title || !newChallengeData.requirement) {
        toast.error('Please fill in all fields');
        return;
      }
      await api.post('/gamification/challenges', {
        ...newChallengeData,
        status: "Active"
      });
      setIsModalOpen(false);
      setNewChallengeData({ title: '', points: 0, requirement: '' });
      toast.success('Challenge created successfully');
      fetchChallenges();
    } catch (error) {
      console.error("Error creating challenge", error);
      toast.error('Failed to create challenge');
    }
  };

  const handleToggleStatus = async (challenge) => {
    try {
      const newStatus = challenge.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/gamification/challenges/${challenge.id}`, { status: newStatus });
      fetchChallenges();
    } catch (error) {
      console.error("Error updating challenge", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] flex items-center gap-2">
            <Gift className="w-8 h-8 text-[#F5A623]" /> Gamification & Challenges
          </h1>
          <p className="text-gray-500 mt-2">Manage customer challenges, scratch cards, and rewards.</p>
        </div>
        <button onClick={handleCreate} className="bg-[#0A1628] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#112240] transition">
          <Plus className="w-5 h-5" /> New Challenge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <Award className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Challenges</p>
            <p className="text-2xl font-bold text-[#0A1628]">{challenges.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-medium">Challenge Title</th>
              <th className="p-4 font-medium">Requirement</th>
              <th className="p-4 font-medium">Points Reward</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {challenges.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-[#0A1628]">{c.title}</td>
                <td className="p-4 text-gray-600">{c.requirement}</td>
                <td className="p-4 font-bold text-[#F5A623]">+{c.points}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {c.status}
                  </span>
                </td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button onClick={() => handleToggleStatus(c)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500" title="Toggle Status"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Create Challenge Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
              <DialogDescription>
                Add a new gamification challenge to drive customer behavior.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Challenge Title</label>
                <input 
                  type="text" 
                  value={newChallengeData.title}
                  onChange={(e) => setNewChallengeData({...newChallengeData, title: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm" 
                  placeholder="e.g. Weekend Warrior" 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Points Reward</label>
                <input 
                  type="number" 
                  value={newChallengeData.points}
                  onChange={(e) => setNewChallengeData({...newChallengeData, points: parseInt(e.target.value) || 0})}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm" 
                  placeholder="e.g. 500" 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Requirement Description</label>
                <textarea 
                  value={newChallengeData.requirement}
                  onChange={(e) => setNewChallengeData({...newChallengeData, requirement: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm min-h-[80px]" 
                  placeholder="What must the user do?" 
                />
              </div>
            </div>
            <DialogFooter>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateConfirm}
                className="px-4 py-2 bg-[#0A1628] text-white rounded-lg hover:bg-[#2A3F54] font-medium text-sm transition-colors"
              >
                Create Challenge
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default GamificationManager;
