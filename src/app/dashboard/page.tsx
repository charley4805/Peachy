export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active on Site', value: '24', trend: '+2 today' },
          { label: 'Late Clock-ins', value: '3', trend: '-1 from yesterday' },
          { label: 'Open Shifts', value: '12', trend: 'Needs filling' },
          { label: 'Pending Approvals', value: '8', trend: 'Timesheets' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-silver-soft flex flex-col">
            <span className="text-sm font-medium text-silver-dark mb-2">{kpi.label}</span>
            <span className="text-3xl font-bold text-obsidian">{kpi.value}</span>
            <span className="text-xs text-brand-purple mt-2 font-medium">{kpi.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-silver-soft p-6 h-96 flex flex-col">
          <h3 className="font-bold text-obsidian mb-4">Labor Hours vs Scheduled</h3>
          <div className="flex-1 bg-surface-fog rounded-xl flex items-center justify-center border border-dashed border-silver-medium">
            <span className="text-silver-dark text-sm">Analytics Chart Placeholder</span>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-silver-soft p-6 h-96 flex flex-col">
          <h3 className="font-bold text-obsidian mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-4">
            {[
              { time: '10m ago', text: 'Sarah M. clocked in at Site A' },
              { time: '1hr ago', text: 'Alex T. requested timesheet edit' },
              { time: '2hrs ago', text: 'New announcement sent to Sales' },
              { time: '3hrs ago', text: 'Mike R. missed clock out' },
              { time: '4hrs ago', text: 'System generated schedule' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-coral mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-obsidian">{activity.text}</p>
                  <p className="text-xs text-silver-dark">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
