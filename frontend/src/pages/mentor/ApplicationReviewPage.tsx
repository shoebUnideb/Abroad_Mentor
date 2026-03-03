import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, MessageSquare, Paperclip,
  CheckCircle, Clock, AlertCircle, Circle, Send,
  ThumbsUp, AlertTriangle, PlusCircle, UploadCloud, Trash2,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { applicationsApi } from '../../api/applications';
import { stepsApi } from '../../api/steps';
import { documentsApi } from '../../api/documents';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import Avatar from '../../components/ui/Avatar';
import PageHeader from '../../components/ui/PageHeader';
import type { Step } from '../../types';

const STEP_ICON: Record<Step['status'], React.ReactNode> = {
  approved:       <CheckCircle size={16} className="text-green-500" />,
  submitted:      <Clock       size={16} className="text-blue-500"  />,
  needs_revision: <AlertCircle size={16} className="text-orange-500"/>,
  todo:           <Circle      size={16} className="text-gray-300"  />,
};

export default function ApplicationReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: app, loading, refetch } = useApi(
    () => applicationsApi.get(Number(id)),
    [id]
  );
  const [activeStepId, setActiveStepId] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [acting, setActing]   = useState(false);

  // Add-step form
  const [showAddStep, setShowAddStep]     = useState(false);
  const [newStepTitle, setNewStepTitle]   = useState('');
  const [newStepDesc, setNewStepDesc]     = useState('');
  const [newStepDue, setNewStepDue]       = useState('');
  const [addingStep, setAddingStep]       = useState(false);

  // Document upload
  const [pendingFile, setPendingFile]   = useState<File | null>(null);
  const [uploadTitle, setUploadTitle]   = useState('');
  const [uploading, setUploading]       = useState(false);
  const [fileError, setFileError]       = useState('');
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;
    setAddingStep(true);
    try {
      const created = await stepsApi.addToApplication(Number(id), {
        title: newStepTitle.trim(),
        description: newStepDesc.trim() || undefined,
        due_date: newStepDue || undefined,
        order: (app?.steps?.length ?? 0) + 1,
      });
      setNewStepTitle('');
      setNewStepDesc('');
      setNewStepDue('');
      setShowAddStep(false);
      await refetch();
      setActiveStepId(created.id);
    } finally { setAddingStep(false); }
  };

  if (loading) return <p className="text-sm text-gray-400 py-20 text-center">Loading…</p>;
  if (!app) return <div className="text-center py-20 text-gray-400">Application not found.</div>;

  const steps = app.steps ?? [];
  const resolvedStepId = activeStepId ?? steps[0]?.id ?? null;
  const activeStep     = steps.find(s => s.id === resolvedStepId);
  const approvedCount  = steps.filter(s => s.status === 'approved').length;
  const progress       = steps.length ? Math.round((approvedCount / steps.length) * 100) : 0;

  const reviewStep = async (action: 'approve' | 'needs_revision') => {
    if (!resolvedStepId) return;
    setActing(true);
    try {
      if (action === 'approve') await stepsApi.approve(resolvedStepId);
      else await stepsApi.requestRevision(resolvedStepId);
      refetch();
    } finally { setActing(false); }
  };

  const addComment = async () => {
    if (!comment.trim() || !resolvedStepId) return;
    await stepsApi.addComment(resolvedStepId, comment.trim());
    setComment('');
    refetch();
  };

  const handleUploadDoc = async (stepId: number) => {
    if (!pendingFile) return;
    setFileError('');
    setUploading(true);
    try {
      await stepsApi.uploadDocument(stepId, pendingFile, uploadTitle || pendingFile.name);
      setPendingFile(null);
      setUploadTitle('');
      if (fileRef.current) fileRef.current.value = '';
      refetch();
    } finally { setUploading(false); }
  };

  const handleDeleteDoc = async (docId: number) => {
    setDeletingDocId(docId);
    try { await documentsApi.delete(docId); refetch(); }
    finally { setDeletingDocId(null); }
  };

  return (
    <div>
      <Link to={`/mentor/students/${app.student.id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 mb-5">
        <ArrowLeft size={14} /> Back to Student
      </Link>

      <PageHeader
        title={app.title}
        subtitle={`Student: ${app.student.user.first_name} ${app.student.user.last_name}`}
        actions={<StatusBadge status={app.status} />}
      />

      <div className="mb-6 max-w-xl">
        <ProgressBar value={progress} label={`${approvedCount} of ${steps.length} steps approved`} color="green" />
      </div>

      <div className="flex gap-5 min-h-[540px]">
        <aside className="w-64 shrink-0 space-y-1">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Steps</p>
            <button
              onClick={() => setShowAddStep(p => !p)}
              className="flex items-center gap-1 text-[11px] text-primary-600 hover:text-primary-800 font-medium">
              <PlusCircle size={12} /> Add
            </button>
          </div>

          {showAddStep && (
            <form onSubmit={handleAddStep} className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <input
                autoFocus
                type="text"
                value={newStepTitle}
                onChange={e => setNewStepTitle(e.target.value)}
                placeholder="Step title *"
                className="w-full px-2.5 py-1.5 text-[12px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <textarea
                rows={2}
                value={newStepDesc}
                onChange={e => setNewStepDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-2.5 py-1.5 text-[12px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <input
                type="date"
                value={newStepDue}
                onChange={e => setNewStepDue(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-1.5">
                <button type="submit" disabled={addingStep || !newStepTitle.trim()}
                  className="flex-1 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-[11px] font-semibold rounded-md transition-colors">
                  {addingStep ? 'Adding…' : 'Add Step'}
                </button>
                <button type="button" onClick={() => setShowAddStep(false)}
                  className="px-2.5 py-1.5 border border-gray-300 text-gray-500 text-[11px] rounded-md hover:bg-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {steps.map(step => (
            <button key={step.id} onClick={() => setActiveStepId(step.id)}
              className={['w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors text-[13px]',
                resolvedStepId === step.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100',
              ].join(' ')}>
              <span className="shrink-0">{STEP_ICON[step.status]}</span>
              <span className="flex-1 truncate">{step.order}. {step.title}</span>
              {resolvedStepId === step.id && <ChevronRight size={14} className="shrink-0 text-primary-400" />}
            </button>
          ))}
        </aside>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {!activeStep ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-[13px]">Select a step to review.</div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-900">Step {activeStep.order}: {activeStep.title}</h2>
                  {activeStep.due_date && (
                    <p className="text-[11px] text-gray-400 mt-0.5">Due {new Date(activeStep.due_date).toLocaleDateString()}</p>
                  )}
                </div>
                <StatusBadge status={activeStep.status} />
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {activeStep.description && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Description</p>
                    <p className="text-[13.5px] text-gray-700 leading-relaxed">{activeStep.description}</p>
                  </div>
                )}

                {activeStep.status === 'submitted' && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[13px] font-semibold text-blue-800 mb-3">Review this submission</p>
                    <div className="flex gap-2">
                      <button onClick={() => reviewStep('approve')} disabled={acting}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-[12px] font-semibold rounded-lg transition-colors">
                        <ThumbsUp size={13} /> Approve
                      </button>
                      <button onClick={() => reviewStep('needs_revision')} disabled={acting}
                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-[12px] font-semibold rounded-lg transition-colors">
                        <AlertTriangle size={13} /> Needs Revision
                      </button>
                    </div>
                  </div>
                )}

                {activeStep.status === 'approved' && (
                  <div className="flex items-center gap-2 text-green-600 text-[13px] font-medium">
                    <CheckCircle size={16} /> You approved this step.
                  </div>
                )}
                {activeStep.status === 'needs_revision' && (
                  <div className="flex items-center gap-2 text-orange-600 text-[13px] font-medium">
                    <AlertCircle size={16} /> Marked as needing revision.
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                    <Paperclip size={12} /> Documents
                  </p>
                  {(activeStep.documents ?? []).length > 0 && (
                    <ul className="space-y-1.5 mb-3">
                      {(activeStep.documents ?? []).map(doc => (
                        <li key={doc.id} className="flex items-center gap-2 text-[12px]">
                          <Paperclip size={12} className="text-primary-500 shrink-0" />
                          <a href={doc.file} target="_blank" rel="noreferrer"
                            className="flex-1 text-primary-600 hover:underline truncate">{doc.title}</a>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            disabled={deletingDocId === doc.id}
                            title="Delete"
                            className="text-gray-300 hover:text-red-500 disabled:opacity-40 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0] ?? null;
                      setFileError('');
                      if (f && f.size > 1_048_576) {
                        setFileError('File is too large. Maximum size is 1 MB.');
                        e.target.value = '';
                        return;
                      }
                      setPendingFile(f);
                      if (f) setUploadTitle(f.name.replace(/\.[^.]+$/, ''));
                    }}
                  />
                  {pendingFile ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={uploadTitle}
                        onChange={e => setUploadTitle(e.target.value)}
                        placeholder="Document title"
                        className="flex-1 px-2.5 py-1.5 text-[12px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        onClick={() => handleUploadDoc(activeStep.id)}
                        disabled={uploading}
                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-[11px] font-semibold rounded-md transition-colors"
                      >
                        {uploading ? 'Uploading…' : 'Upload'}
                      </button>
                      <button
                        onClick={() => { setPendingFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                        className="text-[12px] text-gray-400 hover:text-gray-700 px-1"
                      >✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1.5 text-[12px] text-primary-600 hover:text-primary-800 font-medium"
                    >
                      <UploadCloud size={13} /> Attach file
                    </button>
                  )}
                  {fileError && (
                    <p className="mt-1.5 text-[11px] text-red-600 font-medium">{fileError}</p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                    <MessageSquare size={12} /> Comments ({(activeStep.comments ?? []).length})
                  </p>
                  <div className="space-y-3 mb-4">
                    {(activeStep.comments ?? []).map(c => (
                      <div key={c.id} className="flex gap-3">
                        <Avatar name={c.author.username} size="sm" />
                        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[12px] font-semibold text-gray-800">{c.author.username}</span>
                            <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[13px] text-gray-700">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={comment} onChange={e => setComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addComment()}
                      placeholder="Leave feedback…"
                      className="flex-1 px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <button onClick={addComment}
                      className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
