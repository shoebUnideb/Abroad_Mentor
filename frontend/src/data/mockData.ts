import type {
  User,
  StudentProfile,
  MentorProfile,
  Assignment,
  Application,
  Step,
  Comment,
  Document,
  Message,
} from '../types';

/* ── Users ────────────────────────────────────── */

export const mockUsers: User[] = [
  { id: 1, username: 'admin',   email: 'admin@platform.io',   role: 'superadmin', is_approved: true, first_name: 'Super', last_name: 'Admin'  },
  { id: 2, username: 'mentor1', email: 'mentor1@platform.io', role: 'mentor',     is_approved: true, first_name: 'Alice',  last_name: 'Chen'   },
  { id: 3, username: 'mentor2', email: 'mentor2@platform.io', role: 'mentor',     is_approved: true, first_name: 'James',  last_name: 'Rivera' },
  { id: 4, username: 'student1',email: 'student1@platform.io',role: 'student',    is_approved: true, first_name: 'Omar',   last_name: 'Patel'  },
  { id: 5, username: 'student2',email: 'student2@platform.io',role: 'student',    is_approved: true, first_name: 'Sofia',  last_name: 'Kim'    },
  { id: 6, username: 'student3',email: 'student3@platform.io',role: 'student',    is_approved: true, first_name: 'Lena',   last_name: 'Müller' },
];

/* ── Profiles ─────────────────────────────────── */

export const mockStudentProfiles: StudentProfile[] = [
  {
    id: 1, user: mockUsers[3],
    bio: 'Aspiring software engineer interested in machine learning.',
    phone: '+1 555-0101', linkedin_url: 'https://linkedin.com/in/omarpatel',
    created_at: '2025-01-10T09:00:00Z', updated_at: '2025-01-10T09:00:00Z',
  },
  {
    id: 2, user: mockUsers[4],
    bio: 'Graduate student focusing on data science and visualisation.',
    phone: '+1 555-0102', linkedin_url: 'https://linkedin.com/in/sofiakim',
    created_at: '2025-01-12T09:00:00Z', updated_at: '2025-01-12T09:00:00Z',
  },
  {
    id: 3, user: mockUsers[5],
    bio: 'Undergraduate researcher in human-computer interaction.',
    phone: '+49 555-0103', linkedin_url: '',
    created_at: '2025-01-15T09:00:00Z', updated_at: '2025-01-15T09:00:00Z',
  },
];

export const mockMentorProfiles: MentorProfile[] = [
  {
    id: 1, user: mockUsers[1],
    bio: 'Senior ML engineer with 10 years of industry experience.',
    expertise: 'Machine Learning, Python, Cloud Systems',
    phone: '+1 555-0201', linkedin_url: 'https://linkedin.com/in/alicechen',
    created_at: '2025-01-05T09:00:00Z', updated_at: '2025-01-05T09:00:00Z',
  },
  {
    id: 2, user: mockUsers[2],
    bio: 'Full-stack developer and open-source contributor.',
    expertise: 'React, Node.js, DevOps',
    phone: '+1 555-0202', linkedin_url: 'https://linkedin.com/in/jamesrivera',
    created_at: '2025-01-05T09:00:00Z', updated_at: '2025-01-05T09:00:00Z',
  },
];

/* ── Assignments ──────────────────────────────── */

export const mockAssignments: Assignment[] = [
  {
    id: 1,
    student: mockStudentProfiles[0],
    mentor:  mockMentorProfiles[0],
    assigned_by: mockUsers[0],
    notes: 'Focus on ML fundamentals.',
    is_active: true,
    assigned_at: '2025-01-20T10:00:00Z',
  },
  {
    id: 2,
    student: mockStudentProfiles[1],
    mentor:  mockMentorProfiles[0],
    assigned_by: mockUsers[0],
    notes: 'Data pipeline project.',
    is_active: true,
    assigned_at: '2025-01-21T10:00:00Z',
  },
  {
    id: 3,
    student: mockStudentProfiles[2],
    mentor:  mockMentorProfiles[1],
    assigned_by: mockUsers[0],
    notes: 'UX research project.',
    is_active: true,
    assigned_at: '2025-01-22T10:00:00Z',
  },
];

/* ── Comments ─────────────────────────────────── */

export const mockComments: Comment[] = [
  { id: 1, author: mockUsers[1], text: 'Good start! Review the data preprocessing section.', created_at: '2025-02-01T11:00:00Z', step: 1 },
  { id: 2, author: mockUsers[3], text: 'Thanks, I have updated the notebook.', created_at: '2025-02-02T09:30:00Z', step: 1 },
  { id: 3, author: mockUsers[1], text: 'Looks much better. Approved!', created_at: '2025-02-03T14:00:00Z', step: 1 },
  { id: 4, author: mockUsers[1], text: 'Please add more detail to your methodology.', created_at: '2025-02-05T10:00:00Z', application: 1 },
];

/* ── Documents ────────────────────────────────── */

export const mockDocuments: Document[] = [
  { id: 1, uploaded_by: mockUsers[3], title: 'Project Proposal',       file: '/media/documents/proposal.pdf',   created_at: '2025-02-01T09:00:00Z', application: 1 },
  { id: 2, uploaded_by: mockUsers[3], title: 'Data Analysis Notebook',  file: '/media/documents/notebook.ipynb', created_at: '2025-02-03T15:00:00Z', step: 1 },
];

/* ── Steps ────────────────────────────────────── */

export const mockSteps: Step[] = [
  {
    id: 1, application: 1, order: 1,
    title: 'Literature Review',
    description: 'Survey at least 10 recent papers on the chosen topic. Summarise key findings.',
    status: 'approved',
    due_date: '2025-02-10',
    created_at: '2025-01-25T10:00:00Z', updated_at: '2025-02-03T14:00:00Z',
    comments: [mockComments[0], mockComments[1], mockComments[2]],
    documents: [mockDocuments[1]],
  },
  {
    id: 2, application: 1, order: 2,
    title: 'Data Collection & Cleaning',
    description: 'Collect the dataset, handle missing values, and normalise features.',
    status: 'submitted',
    due_date: '2025-02-20',
    created_at: '2025-01-25T10:00:00Z', updated_at: '2025-02-12T09:00:00Z',
    comments: [],
    documents: [],
  },
  {
    id: 3, application: 1, order: 3,
    title: 'Model Training',
    description: 'Train baseline and advanced models. Record metrics.',
    status: 'todo',
    due_date: '2025-03-01',
    created_at: '2025-01-25T10:00:00Z', updated_at: '2025-01-25T10:00:00Z',
    comments: [],
    documents: [],
  },
  {
    id: 4, application: 1, order: 4,
    title: 'Final Report',
    description: 'Write up findings, methodology, results, and conclusions.',
    status: 'todo',
    due_date: '2025-03-15',
    created_at: '2025-01-25T10:00:00Z', updated_at: '2025-01-25T10:00:00Z',
    comments: [],
    documents: [],
  },
];

/* ── Applications ─────────────────────────────── */

export const mockApplications: Application[] = [
  {
    id: 1,
    student: mockStudentProfiles[0],
    title: 'ML Research Project – Predictive Analytics',
    description: 'A 12-week project applying machine learning to predict student outcomes.',
    status: 'under_review',
    created_at: '2025-01-25T10:00:00Z',
    updated_at: '2025-02-12T09:00:00Z',
    steps: mockSteps,
  },
  {
    id: 2,
    student: mockStudentProfiles[0],
    title: 'Open-Source Contribution – PyTorch',
    description: 'Contribute to PyTorch documentation and fix identified issues.',
    status: 'pending',
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
    steps: [],
  },
  {
    id: 3,
    student: mockStudentProfiles[1],
    title: 'Data Visualisation Dashboard',
    description: 'Build an interactive dashboard for academic performance data.',
    status: 'approved',
    created_at: '2025-01-28T10:00:00Z',
    updated_at: '2025-02-10T10:00:00Z',
    steps: [],
  },
];

/* ── Messages ─────────────────────────────────── */

export const mockMessages: Message[] = [
  { id: 1, sender: mockUsers[1], receiver: mockUsers[0], body: 'Hi, could we schedule a sync this week?', timestamp: '2025-02-10T08:00:00Z', is_read: true },
  { id: 2, sender: mockUsers[0], receiver: mockUsers[1], body: 'Sure! Thursday at 3pm works.', timestamp: '2025-02-10T08:30:00Z', is_read: true },
  { id: 3, sender: mockUsers[1], receiver: mockUsers[0], body: 'Omar\'s step 2 submission looks solid. Ready to approve.', timestamp: '2025-02-15T09:00:00Z', is_read: false },
];

/* ── Helpers ──────────────────────────────────── */

/** Compute application progress (% of steps approved) */
export function getApplicationProgress(app: Application): number {
  if (!app.steps || app.steps.length === 0) return 0;
  const approved = app.steps.filter(s => s.status === 'approved').length;
  return Math.round((approved / app.steps.length) * 100);
}
