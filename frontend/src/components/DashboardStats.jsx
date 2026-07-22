import { Building, Mail, Users, Clock } from 'lucide-react';

export default function DashboardStats({ properties, inquiries, users, role }) {
  const totalProps = properties.length;
  const totalInqs = inquiries.length;
  
  const pendingProps = properties.filter(p => p.status === 'pending').length;
  const approvedProps = properties.filter(p => p.status === 'approved').length;
  const rejectedProps = properties.filter(p => p.status === 'rejected').length;

  const cards = [
    {
      title: 'Active Listings',
      value: totalProps,
      description: `${approvedProps} approved listings`,
      icon: <Building className="text-blue-600" size={20} />,
      bg: 'bg-blue-50/50 border-blue-100/50'
    },
    {
      title: 'Client Inquiries',
      value: totalInqs,
      description: `${inquiries.filter(i => i.status === 'unread').length} unread messages`,
      icon: <Mail className="text-indigo-600" size={20} />,
      bg: 'bg-indigo-50/50 border-indigo-100/50'
    }
  ];

  if (role === 'admin') {
    cards.push({
      title: 'Registered Users',
      value: users.length,
      description: 'Platform active registry',
      icon: <Users className="text-green-600" size={20} />,
      bg: 'bg-green-50/50 border-green-100/50'
    });
  }

  // Add a status breakdown card for transparency
  cards.push({
    title: 'Submission Statuses',
    value: `${approvedProps} / ${pendingProps} / ${rejectedProps}`,
    description: 'Approved / Pending / Rejected',
    icon: <Clock className="text-amber-600" size={20} />,
    bg: 'bg-amber-50/50 border-amber-100/50'
  });

  return (
    <div id="dashboard_stats_grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className={`p-4 border rounded-2xl flex items-start justify-between ${card.bg} shadow-sm`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              {card.title}
            </span>
            <p className="text-2xl font-sans font-black text-slate-900 leading-none">
              {card.value}
            </p>
            <span className="text-[10px] text-gray-500 font-medium block">
              {card.description}
            </span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-xs">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
