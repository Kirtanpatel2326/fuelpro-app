import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const events = [
  { day: 5, title: 'Summer Kickoff', type: 'campaign', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { day: 12, title: 'Double Points Weekend', type: 'multiplier', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { day: 14, title: 'Double Points Weekend', type: 'multiplier', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { day: 19, title: 'Flash Sale: Coffee', type: 'discount', color: 'bg-green-100 text-green-700 border-green-200' },
  { day: 26, title: 'End of Month Push', type: 'campaign', color: 'bg-purple-100 text-purple-700 border-purple-200' }
];

export default function PromotionsManager() {
  const daysInMonth = 30; // June 2026
  const startDay = 1; // June 1, 2026 is a Monday (0 = Sun, 1 = Mon)

  const getEventsForDay = (day) => {
    return events.filter(e => e.day === day);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-fp-navy">June 2026</h2>
          <div className="flex space-x-1">
            <button className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700">
              Today
            </button>
            <button className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button className="flex items-center px-4 py-2 bg-fp-navy text-white rounded-lg text-sm font-medium hover:bg-[#2A3F54] transition-colors ml-auto sm:ml-0">
            <Plus className="w-4 h-4 mr-2" />
            New Promotion
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
          {/* Empty cells for start of month */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] p-2 border-b border-r border-gray-100 bg-gray-50/30"></div>
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = day === 24; // Mock today

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
                      className={`px-2 py-1 text-xs font-semibold rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${evt.color}`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Empty cells for end of month */}
          {Array.from({ length: 42 - (startDay + daysInMonth) }).map((_, i) => (
            <div key={`empty-end-${i}`} className="min-h-[120px] p-2 border-b border-r border-gray-100 bg-gray-50/30"></div>
          ))}
        </div>
      </div>

    </div>
  );
}
