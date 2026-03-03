import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  User,
  Users,
  ClipboardList,
  BookOpen,
  MessageSquare,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard',    to: '/student/dashboard',    icon: <LayoutDashboard size={18} /> },
    { label: 'Applications', to: '/student/applications', icon: <FileText size={18} /> },
    { label: 'My Profile',   to: '/student/profile',      icon: <User size={18} /> },
  ],
  mentor: [
    { label: 'Dashboard',   to: '/mentor/dashboard',  icon: <LayoutDashboard size={18} /> },
    { label: 'My Students', to: '/mentor/students',   icon: <Users size={18} /> },
    { label: 'My Profile',  to: '/mentor/profile',    icon: <User size={18} /> },
    { label: 'Messages',    to: '/mentor/messages',   icon: <MessageSquare size={18} /> },
  ],
  superadmin: [
    { label: 'Dashboard',    to: '/admin/dashboard',   icon: <LayoutDashboard size={18} /> },
    { label: 'Users',        to: '/admin/users',        icon: <Users size={18} /> },
    { label: 'Assignments',  to: '/admin/assignments',  icon: <ClipboardList size={18} /> },
    { label: 'Applications', to: '/admin/applications', icon: <BookOpen size={18} /> },
    { label: 'Messages',     to: '/admin/messages',     icon: <MessageSquare size={18} /> },
    { label: 'Settings',     to: '/admin/settings',     icon: <Settings size={18} /> },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  student: 'Student',
  mentor: 'Mentor',
  superadmin: 'Superadmin',
};

const ROLE_COLOR: Record<Role, string> = {
  student: 'bg-green-100 text-green-800',
  mentor: 'bg-blue-100 text-blue-800',
  superadmin: 'bg-purple-100 text-purple-800',
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV_ITEMS[user.role] ?? [];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex flex-col w-60 bg-white border-r border-gray-200">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
        <ShieldCheck className="text-primary-600" size={22} />
        <span className="text-[15px] font-semibold tracking-tight text-gray-900">
          Mentor Platform
        </span>
      </div>

      {/* Role Pill */}
      <div className="px-5 py-3">
        <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${ROLE_COLOR[user.role]}`}>
          {ROLE_LABEL[user.role]}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer: user name */}
      <div className="px-5 py-4 border-t border-gray-100 text-[12px] text-gray-400 truncate">
        @{user.username}
      </div>
    </aside>
  );
}
