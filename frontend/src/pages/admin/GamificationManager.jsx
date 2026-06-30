import React, { useState } from 'react';
import { Gift, Award, Plus, Trash2, Edit } from 'lucide-react';

export default function GamificationManager() {
  const [challenges, setChallenges] = useState([
    { id: 1, title: "Weekend Warrior", points: 500, requirement: "2 Fill Ups", status: "Active" },
    { id: 2, title: "Coffee Lover", points: 200, requirement: "5 Coffees", status: "Active" }
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] flex items-center gap-2">
            <Gift className="w-8 h-8 text-[#F5A623]" /> Gamification & Challenges
          </h1>
          <p className="text-gray-500 mt-2">Manage customer challenges, scratch cards, and rewards.</p>
        </div>
        <button className="bg-[#0A1628] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#112240] transition">
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
                  <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
