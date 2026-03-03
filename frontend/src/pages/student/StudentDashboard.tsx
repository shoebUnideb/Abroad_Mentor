import { Link } from 'react-router-dom';
import { PlusCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApiList } from '../../hooks/useApi';
import { applicationsApi } from '../../api/applications';
import { getApplicationProgress } from '../../utils/appUtils';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: myApps, loading } = useApiList(applicationsApi.list);

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.first_name ?? user?.username} 👋`}
        subtitle="Track your applications and progress below."
        actions={
          <Link
            to="/student/applications/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle size={15} />
            New Application
          </Link>
        }
      />

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total Apps',   value: myApps.length },
          { label: 'In Review',    value: myApps.filter(a => a.status === 'under_review').length },
          { label: 'Approved',     value: myApps.filter(a => a.status === 'approved').length },
          { label: 'Pending',      value: myApps.filter(a => a.status === 'pending').length },
        ].map(s => (
          <Card key={s.label} padding="md">
            <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Application cards */}
      <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        My Applications
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : myApps.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText size={22} />}
            title="No applications yet"
            description="Start by creating your first application."
            action={
              <Link
                to="/student/applications/new"
                className="px-4 py-2 bg-primary-600 text-white text-[13px] font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Application
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {myApps.map(app => {
            const progress = getApplicationProgress(app);
            const steps = app.steps ?? [];
            return (
              <Link key={app.id} to={`/student/applications/${app.id}`}>
                <Card hoverable padding="md">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-[14px] font-semibold text-gray-900 leading-snug line-clamp-2">
                      {app.title}
                    </h3>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  {app.description && (
                    <p className="text-[12px] text-gray-500 line-clamp-2 mb-4">
                      {app.description}
                    </p>
                  )}

                  <ProgressBar value={progress} label={`${steps.filter(s => s.status === 'approved').length}/${steps.length} steps`} />

                  <p className="text-[11px] text-gray-400 mt-3">
                    Updated {new Date(app.updated_at).toLocaleDateString()}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
