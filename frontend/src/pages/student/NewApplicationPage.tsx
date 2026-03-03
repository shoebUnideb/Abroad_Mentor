import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

export default function NewApplicationPage() {
  const navigate = useNavigate();
  const [title, setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const app = await applicationsApi.create({ title: title.trim(), description: description.trim() });
      navigate(`/student/applications/${app.id}`);
    } catch {
      setError('Failed to create application. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 mb-5"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <PageHeader
        title="New Application"
        subtitle="Fill in the details to start a new application."
      />

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Summer Research Internship"
              className="w-full px-3.5 py-2.5 text-[13.5px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Briefly describe this application…"
              className="w-full px-3.5 py-2.5 text-[13.5px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle size={15} />
              {saving ? 'Creating…' : 'Create Application'}
            </button>
            <Link
              to="/student/dashboard"
              className="px-5 py-2.5 border border-gray-300 text-gray-600 text-[13px] font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
