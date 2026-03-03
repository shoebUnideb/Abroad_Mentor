import {
  Users, BookOpen, ClipboardList, CheckCircle,
  Clock, TrendingUp, AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApiList } from '../../hooks/useApi';
import { usersApi } from '../../api/users';
import { applicationsApi } from '../../api/applications';
import { assignmentsApi } from '../../api/assignments';
import MetricCard from '../../components/ui/MetricCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';

export default function AdminDashboard() {
  const { data: users }       = useApiList(usersApi.list);
  const { data: allApps }     = useApiList(applicationsApi.list);
  const { data: assignments } = useApiList(assignmentsApi.list);

  const students   = users.filter(u => u.role === 'student');
  const mentors    = users.filter(u => u.role === 'mentor');
  const allSteps   = allApps.flatMap(a => a.steps ?? []);
  const active     = assignments.filter(a => a.is_active);

  const metrics = [
    { label: 'Total Students',    value: students.length,                                     icon: <Users size={18} />,        accent: 'blue'   as const },
    { label: 'Total Mentors',     value: mentors.length,                                      icon: <Users size={18} />,        accent: 'purple' as const },
    { label: 'Active Assignments',value: active.length,                                       icon: <ClipboardList size={18} />,accent: 'green'  as const },
    { label: 'Applications',      value: allApps.length,                                      icon: <BookOpen size={18} />,     accent: 'orange' as const },
    { label: 'Steps Submitted',   value: allSteps.filter(s => s.status === 'submitted').length,icon: <Clock size={18} />,       accent: 'orange' as const },
    { label: 'Steps Approved',    value: allSteps.filter(s => s.status === 'approved').length, icon: <CheckCircle size={18} />, accent: 'green'  as const },
  ];

  const recentApps = [...allApps]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform-wide overview"
        actions={
          <Link to="/admin/users"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm">
            Manage Users
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Applications</h2>
          <Card padding="none">
            {recentApps.map((app, i) => (
              <div key={app.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${i < recentApps.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <Avatar name={`${app.student.user.first_name} ${app.student.user.last_name}`} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-800 truncate">{app.title}</p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {app.student.user.first_name} {app.student.user.last_name}
                  </p>
                </div>
                <StatusBadge status={app.status} size="sm" />
              </div>
            ))}
            {recentApps.length === 0 && (
              <p className="text-center text-[13px] text-gray-400 py-10">No applications yet.</p>
            )}
          </Card>
        </div>

        <div>
          <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Action Required</h2>
          <div className="space-y-3">
            <Card padding="md">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800 mb-0.5">Unassigned students</p>
                  <p className="text-[12px] text-gray-500 mb-2">Review student assignments regularly.</p>
                  <Link to="/admin/assignments" className="text-[12px] text-primary-600 font-medium hover:underline">
                    Go to Assignments →
                  </Link>
                </div>
              </div>
            </Card>
            <Card padding="md">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800 mb-0.5">
                    {allSteps.filter(s => s.status === 'submitted').length} steps awaiting review
                  </p>
                  <p className="text-[12px] text-gray-500">Pending mentor review across all applications.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
