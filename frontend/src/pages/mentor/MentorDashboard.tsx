import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApiList } from '../../hooks/useApi';
import { profilesApi } from '../../api/profiles';
import { applicationsApi } from '../../api/applications';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import MetricCard from '../../components/ui/MetricCard';
import EmptyState from '../../components/ui/EmptyState';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

export default function MentorDashboard() {
  const { user } = useAuth();
  const { data: students } = useApiList(profilesApi.getMentorStudents);
  const { data: allApps }  = useApiList(applicationsApi.list);

  const allSteps     = allApps.flatMap(a => a.steps ?? []);
  const pendingReview = allSteps.filter(s => s.status === 'submitted').length;
  const totalApproved = allSteps.filter(s => s.status === 'approved').length;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.first_name ?? user?.username}`}
        subtitle="Overview of your assigned students and pending reviews."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Assigned Students" value={students.length} icon={<Users size={18} />} accent="blue" />
        <MetricCard label="Total Applications" value={allApps.length}  icon={<BookOpen size={18} />} accent="purple" />
        <MetricCard label="Pending Review"     value={pendingReview}    icon={<Clock size={18} />} accent="orange" />
        <MetricCard label="Steps Approved"     value={totalApproved}    icon={<CheckCircle size={18} />} accent="green" />
      </div>

      <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-3">My Students</h2>

      {students.length === 0 ? (
        <Card>
          <EmptyState title="No students assigned yet" description="Contact the administrator to get students assigned to you." />
        </Card>
      ) : (
        <Card padding="none">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Student</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 hidden md:table-cell">Applications</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 hidden lg:table-cell">Overall Progress</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Latest Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {students.map((sp, i) => {
                const apps = allApps.filter(a => a.student.id === sp.id);
                const latest = apps[0];
                const totalSteps = apps.flatMap(a => a.steps ?? []).length;
                const doneSteps  = apps.flatMap(a => a.steps ?? []).filter(s => s.status === 'approved').length;
                const pct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;
                return (
                  <tr key={sp.id} className={`${i < students.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${sp.user.first_name} ${sp.user.last_name}`} size="sm" />
                        <div>
                          <p className="font-semibold text-gray-800">{sp.user.first_name} {sp.user.last_name}</p>
                          <p className="text-[11px] text-gray-400">@{sp.user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">{apps.length}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell w-40">
                      <ProgressBar value={pct} showPercent={false} />
                      <span className="text-[10px] text-gray-400">{pct}%</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {latest ? <StatusBadge status={latest.status} size="sm" /> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/mentor/students/${sp.id}`}
                        className="text-[12px] text-primary-600 hover:text-primary-800 font-medium">View →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
