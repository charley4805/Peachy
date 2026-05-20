export default function TeamPage() {
  const team = [
    { name: 'Sarah Miller', role: 'Foreman', status: 'Active', site: 'Downtown Highrise' },
    { name: 'Alex Turner', role: 'Electrician', status: 'Active', site: 'Downtown Highrise' },
    { name: 'Mike Ross', role: 'Laborer', status: 'Off', site: '-' },
    { name: 'Emma Davis', role: 'Plumber', status: 'Active', site: 'Uptown Clinic' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-obsidian">Team Directory</h2>
          <p className="text-sm text-silver-dark mt-1">Manage employees, roles, and current status</p>
        </div>
        <button className="bg-gradient-to-r from-brand-coral to-brand-purple text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:opacity-90">
          + Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-silver-soft overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-silver-soft text-xs text-silver-dark uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Current Status</th>
              <th className="px-6 py-4 font-medium">Job Site</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silver-soft text-sm text-obsidian">
            {team.map((member, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-silver-soft flex items-center justify-center text-silver-dark text-xs">
                    {member.name.charAt(0)}
                  </div>
                  {member.name}
                </td>
                <td className="px-6 py-4">{member.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-silver-dark">{member.site}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand-purple hover:text-brand-deep-purple font-medium text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
