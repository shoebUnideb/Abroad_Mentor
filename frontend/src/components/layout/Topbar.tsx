import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Home, Info, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() ||
      user.username[0].toUpperCase()
    : '';

  return (
    <header className="fixed top-0 right-0 left-60 z-10 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: breadcrumb / global links */}
      <nav className="flex items-center gap-5 text-[13px] text-gray-500">
        <Link
          to="/"
          className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
        >
          <Home size={14} />
          Home
        </Link>
        <Link
          to="/about"
          className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
        >
          <Info size={14} />
          About
        </Link>
      </nav>

      {/* Right: notification + user dropdown */}
      <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(p => !p); setDropdownOpen(false); }}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
              <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Notifications
              </p>
              <div className="px-4 py-3 text-[13px] text-gray-500 border-t border-gray-50">
                No new notifications.
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropdownOpen(p => !p); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-[11px] font-bold flex items-center justify-center">
              {initials}
            </div>
            <span className="text-[13px] font-medium text-gray-700 max-w-[120px] truncate">
              {user?.first_name
                ? `${user.first_name} ${user.last_name ?? ''}`
                : user?.username}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-[12px] font-semibold text-gray-800">{user?.username}</p>
                <p className="text-[11px] text-gray-400 capitalize">{user?.role}</p>
              </div>
              <Link
                to={
                  user?.role === 'student'  ? '/student/profile' :
                  user?.role === 'mentor'   ? '/mentor/profile'  : '/admin/settings'
                }
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                <User size={14} />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
