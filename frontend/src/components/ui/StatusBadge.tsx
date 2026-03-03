import type { ApplicationStatus, StepStatus } from '../../types';

type AnyStatus = ApplicationStatus | StepStatus;

const CONFIG: Record<AnyStatus, { label: string; cls: string }> = {
  // Application statuses
  pending:      { label: 'Pending',      cls: 'bg-yellow-100 text-yellow-800 ring-yellow-200' },
  under_review: { label: 'Under Review', cls: 'bg-blue-100   text-blue-800   ring-blue-200'   },
  approved:     { label: 'Approved',     cls: 'bg-green-100  text-green-800  ring-green-200'  },
  rejected:     { label: 'Rejected',     cls: 'bg-red-100    text-red-800    ring-red-200'    },
  // Step statuses
  todo:          { label: 'To Do',         cls: 'bg-gray-100   text-gray-600   ring-gray-200'   },
  submitted:     { label: 'Submitted',     cls: 'bg-blue-100   text-blue-800   ring-blue-200'   },
  needs_revision:{ label: 'Needs Revision',cls: 'bg-orange-100 text-orange-800 ring-orange-200' },
};

interface Props {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const { label, cls } = CONFIG[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 ring-gray-200' };
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';
  return (
    <span className={`inline-flex items-center font-semibold uppercase tracking-wide rounded-full ring-1 ${sizeClass} ${cls}`}>
      {label}
    </span>
  );
}
