/* ──────────────────────────────────────────────
   TypeScript Domain Interfaces
   ────────────────────────────────────────────── */

export type Role = 'superadmin' | 'mentor' | 'student';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_approved: boolean;
  first_name?: string;
  last_name?: string;
}

// ── Profiles ──────────────────────────────────

export interface StudentProfile {
  id: number;
  user: User;
  bio: string;
  phone: string;
  linkedin_url: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorProfile {
  id: number;
  user: User;
  bio: string;
  expertise: string;
  phone: string;
  linkedin_url: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

// ── Assignment ────────────────────────────────

export interface Assignment {
  id: number;
  student: StudentProfile;
  mentor: MentorProfile;
  assigned_by?: User;
  notes: string;
  is_active: boolean;
  assigned_at: string;
}

// ── Application ───────────────────────────────

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface Application {
  id: number;
  student: StudentProfile;
  title: string;
  description: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  steps?: Step[];
}

// ── Step ──────────────────────────────────────

export type StepStatus = 'todo' | 'submitted' | 'approved' | 'needs_revision';

export interface Step {
  id: number;
  application: number; // FK
  title: string;
  description: string;
  order: number;
  status: StepStatus;
  due_date?: string;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
  documents?: Document[];
}

// ── Comment ───────────────────────────────────

export interface Comment {
  id: number;
  author: User;
  text: string;
  created_at: string;
  step?: number;
  application?: number;
}

// ── Document ──────────────────────────────────

export interface Document {
  id: number;
  uploaded_by: User;
  title: string;
  file: string;        // URL
  created_at: string;
  step?: number;
  application?: number;
}

// ── Message ───────────────────────────────────

export interface Message {
  id: number;
  sender: User;
  receiver: User;
  body: string;
  timestamp: string;
  is_read: boolean;
}

// ── Auth ──────────────────────────────────────

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
