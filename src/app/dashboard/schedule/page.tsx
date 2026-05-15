'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Mock data
const EMPLOYEES = [
  { id: '1', name: 'Sarah Miller', role: 'Foreman', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: '2', name: 'Alex Turner', role: 'Electrician', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: '3', name: 'Mike Ross', role: 'Laborer', avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: '4', name: 'Emma Davis', role: 'Plumber', avatar: 'https://i.pravatar.cc/150?img=5' },
];

const SHIFTS = [
  { id: 's1', employeeId: '1', site: 'Downtown Highrise', date: '2026-05-10', startHour: 7, duration: 8, color: 'bg-brand-coral' },
  { id: 's2', employeeId: '2', site: 'Downtown Highrise', date: '2026-05-10', startHour: 8, duration: 6, color: 'bg-brand-purple' },
  { id: 's3', employeeId: '3', site: 'Uptown Clinic', date: '2026-05-10', startHour: 9, duration: 8, color: 'bg-blue-500' },
  { id: 's4', employeeId: '4', site: 'Uptown Clinic', date: '2026-05-10', startHour: 7, duration: 4, color: 'bg-green-500' },
  { id: 's5', employeeId: '4', site: 'City Mall Maintenance', date: '2026-05-10', startHour: 13, duration: 4, color: 'bg-orange-500' },
];

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-05-10'));

  // Generate 24 hours (for simplicity, we'll show 6 AM to 6 PM)
  const hours = Array.from({ length: 13 }, (_, i) => i + 6);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-obsidian">Schedule Builder</h2>
          <p className="text-silver-dark text-sm mt-1">Manage shifts and labor allocation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev Day
          </Button>
          <span className="font-medium text-obsidian px-2">May 10, 2026</span>
          <Button variant="secondary" size="sm">
            Next Day
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <Button variant="primary">
            <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Shift
          </Button>
        </div>
      </div>

      {/* Gantt Chart Area */}
      <Card noPadding className="flex-1 flex flex-col min-h-[500px]">
        {/* Timeline Header */}
        <div className="flex border-b border-silver-soft bg-gray-50/80 sticky top-0 z-10">
          <div className="w-64 flex-shrink-0 p-4 border-r border-silver-soft font-bold text-obsidian text-sm flex items-center">
            Team Member
          </div>
          <div className="flex-1 flex relative">
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="flex-1 border-r border-silver-soft/50 p-2 text-center text-xs font-medium text-silver-dark"
              >
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Rows */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-10">
          {EMPLOYEES.map((employee) => (
            <div key={employee.id} className="flex border-b border-silver-soft hover:bg-gray-50/50 transition-colors group">
              {/* Employee Info */}
              <div className="w-64 flex-shrink-0 p-4 border-r border-silver-soft flex items-center gap-3 bg-white group-hover:bg-gray-50/50 z-10 relative">
                <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full border border-silver-soft" />
                <div>
                  <p className="font-bold text-obsidian text-sm">{employee.name}</p>
                  <p className="text-xs text-silver-dark">{employee.role}</p>
                </div>
              </div>
              
              {/* Timeline Row */}
              <div className="flex-1 relative min-h-[72px]">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {hours.map((hour) => (
                    <div key={hour} className="flex-1 border-r border-silver-soft/30 h-full" />
                  ))}
                </div>

                {/* Shift Blocks */}
                {SHIFTS.filter(s => s.employeeId === employee.id).map(shift => {
                  // Calculate position (each hour block is 1 unit of flex-1, meaning we map it to %)
                  // Total hours displayed = 13 (6 to 18)
                  // Let's use left % and width % for absolute positioning
                  const totalHours = hours.length;
                  const startOffset = Math.max(0, shift.startHour - hours[0]);
                  const leftPercent = (startOffset / totalHours) * 100;
                  const widthPercent = (shift.duration / totalHours) * 100;

                  return (
                    <div 
                      key={shift.id}
                      className={`absolute top-3 bottom-3 rounded-lg shadow-sm ${shift.color} text-white p-2 text-xs flex flex-col justify-center cursor-pointer hover:opacity-90 transition-opacity border border-black/10`}
                      style={{ 
                        left: `${leftPercent}%`, 
                        width: `${widthPercent}%`,
                        // Slight margin to prevent overlap visually
                        marginLeft: '2px',
                        marginRight: '2px'
                      }}
                      title={`${shift.site} (${shift.duration} hrs)`}
                    >
                      <div className="font-bold truncate">{shift.site}</div>
                      <div className="truncate opacity-90">{shift.startHour > 12 ? shift.startHour - 12 : shift.startHour}{shift.startHour >= 12 ? 'pm' : 'am'} - {shift.startHour + shift.duration > 12 ? shift.startHour + shift.duration - 12 : shift.startHour + shift.duration}{(shift.startHour + shift.duration) >= 12 ? 'pm' : 'am'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Open Shifts Row */}
          <div className="flex border-b border-silver-soft bg-orange-50/30 group">
             <div className="w-64 flex-shrink-0 p-4 border-r border-silver-soft flex items-center gap-3 z-10 relative">
                <div className="w-10 h-10 rounded-full border border-dashed border-silver-medium flex items-center justify-center bg-white text-silver-dark">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-obsidian text-sm">Open Shifts</p>
                  <p className="text-xs text-silver-dark">Unassigned</p>
                </div>
              </div>
              <div className="flex-1 relative min-h-[72px]">
                <div className="absolute inset-0 flex pointer-events-none">
                  {hours.map((hour) => (
                    <div key={hour} className="flex-1 border-r border-silver-soft/30 h-full" />
                  ))}
                </div>
                {/* Example Open Shift */}
                <div 
                  className="absolute top-3 bottom-3 rounded-lg shadow-sm bg-white border-2 border-dashed border-brand-coral text-brand-coral p-2 text-xs flex flex-col justify-center cursor-pointer hover:bg-brand-coral/5 transition-colors"
                  style={{ left: `${(2/13)*100}%`, width: `${(6/13)*100}%`, marginLeft: '2px', marginRight: '2px' }}
                >
                  <div className="font-bold truncate">Site Inspection</div>
                  <div className="truncate">8am - 2pm • Any role</div>
                </div>
              </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
