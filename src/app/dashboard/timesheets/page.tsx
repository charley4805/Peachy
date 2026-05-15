export default function TimesheetsPage() {
  const timesheets = [
    { date: 'May 10, 2026', name: 'Sarah Miller', in: '07:05 AM', out: '04:15 PM', hours: '9.1', status: 'Pending' },
    { date: 'May 10, 2026', name: 'Alex Turner', in: '08:00 AM', out: '02:00 PM', hours: '6.0', status: 'Approved' },
    { date: 'May 09, 2026', name: 'Emma Davis', in: '07:00 AM', out: '03:00 PM', hours: '8.0', status: 'Approved' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-obsidian">Timesheets</h2>
          <p className="text-sm text-silver-dark mt-1">Review and approve employee time entries</p>
        </div>
        <button className="bg-white border border-silver-soft text-obsidian px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-silver-soft overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-silver-soft text-xs text-silver-dark uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Clock In</th>
              <th className="px-6 py-4 font-medium">Clock Out</th>
              <th className="px-6 py-4 font-medium">Hours</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silver-soft text-sm text-obsidian">
            {timesheets.map((entry, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">{entry.date}</td>
                <td className="px-6 py-4 font-medium">{entry.name}</td>
                <td className="px-6 py-4">{entry.in}</td>
                <td className="px-6 py-4">{entry.out || '-'}</td>
                <td className="px-6 py-4 font-bold">{entry.hours}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {entry.status === 'Pending' && (
                    <button className="text-brand-purple hover:text-brand-deep-purple font-medium text-sm">Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
