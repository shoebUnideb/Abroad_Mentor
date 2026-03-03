import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Linkedin, Phone, Mail } from 'lucide-react';
import { useApi, useApiList } from '../../hooks/useApi';
import { profilesApi } from '../../api/profiles';
import { applicationsApi } from '../../api/applications';
import { getApplicationProgress } from '../../utils/appUtils';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { data: profile, loading } = useApi(
    () => profilesApi.getMentorStudentDetail(Number(studentId)),
    [studentId]
  );
  const { data: allApps } = useApiList(applicationsApi.list);
  const apps = allApps.filter(a => a.student.id === Number(studentId));

  if (loading) return <p className="text-gray-400 text-center py-20">Loading…</p>;
  if (!profile) return <div className="text-gray-400 text-center py-20">Student not found.</div>;

  return (
    <div className="max-w-3xl">
      <Link to="/mentor/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 mb-5">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <PageHeader title={`${profile.user.first_name} ${profile.user.last_name}`} subtitle="Student profile" />

      <Card className="mb-6" padding="lg">
        <div className="flex items-start gap-5">
          <Avatar name={`${profile.user.first_name} ${profile.user.last_name}`} size="xl" />
          <div className="flex-1 space-y-2">
            <h2 className="text-[17px] font-bold text-gray-900">{profile.user.first_name} {profile.user.last_name}</h2>
            <div className="flex flex-wrap gap-4 text-[12px] text-gray-500">
              <span className="flex items-center gap-1.5"><Mail size={12} />{profile.user.email}</span>
              {profile.phone && <span className="flex items-center gap-1.5"><Phone size={12} />{profile.phone}</span>}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-primary-600 hover:underline">
                  <Linkedin size={12} />LinkedIn
                </a>
              )}
            </div>
            {profile.bio && <p className="text-[13px] text-gray-600 leading-relaxed mt-2">{profile.bio}</p>}
          </div>
        </div>
      </Card>

      <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Applications ({apps.length})
      </h2>

      {apps.length === 0 && (
        <Card><p className="text-[13px] text-gray-400 text-center py-8">No applications yet.</p></Card>
      )}

      <div className="space-y-3">
        {apps.map(app => {
          const progress = getApplicationProgress(app);
          const steps = app.steps ?? [];
          return (
            <Link key={app.id} to={`/mentor/applications/${app.id}`}>
              <Card hoverable padding="md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold text-gray-900">{app.title}</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">Updated {new Date(app.updated_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                </div>
                <ProgressBar value={progress}
                  label={`${steps.filter(s => s.status === 'approved').length}/${steps.length} steps approved`} />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
