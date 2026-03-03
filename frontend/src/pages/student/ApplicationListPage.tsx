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

export default function ApplicationListPage() {
  const { user } = useAuth();
  const { data: myApps, loading } = useApiList(applicationsApi.list);

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle={`${myApps.length} application${myApps.length !== 1 ? 's' : ''}`}
        actions={
          user?.role === 'student' && (
            <Link
              to="/student/applications/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle size={15} />
              New Application
            </Link>
          )
        }
      />

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : myApps.length === 0 ? (
        <Card>
          <EmptyState icon={<FileText size={22} />} title="No applications" />
        </Card>
      ) : (
        <div className="space-y-3">
          {myApps.map(app => {
            const progress = getApplicationProgress(app);
            const steps = app.steps ?? [];
            const detailPath = user?.role === 'student'
              ? `/student/applications/${app.id}`
              : `/mentor/applications/${app.id}`;

            return (
              <Link key={app.id} to={detailPath}>
                <Card hoverable padding="md" className="flex items-center gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-[14px] font-semibold text-gray-900 truncate">{app.title}</h3>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                    <p className="text-[12px] text-gray-400 mb-3 truncate">
                      {app.student.user.first_name} {app.student.user.last_name}
                      {' · '}Updated {new Date(app.updated_at).toLocaleDateString()}
                    </p>
                    <ProgressBar
                      value={progress}
                      label={`${steps.filter(s => s.status === 'approved').length}/${steps.length} steps`}
                    />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
