import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

const ROLE_HOME: Record<Role, string> = {
  superadmin: '/admin/dashboard',
  mentor: '/mentor/dashboard',
  student: '/student/dashboard',
};

const QUICK_LOGINS: { label: string; username: string; role: Role }[] = [
  { label: 'Superadmin', username: 'admin',    role: 'superadmin' },
  { label: 'Mentor',     username: 'mentor1',  role: 'mentor'     },
  { label: 'Student',    username: 'student1', role: 'student'    },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      // user state is set by AuthContext; read fresh value after success
      // We navigate based on the resolved user from context
      // (state update may be async, so we use result's implied role from context)
      const role = user?.role ?? ('student' as Role);
      navigate(ROLE_HOME[role]);
    } else {
      setError(result.error ?? 'Login failed.');
    }
  };

  // After login, user is set → redirect if already logged in
  if (user) {
    navigate(ROLE_HOME[user.role], { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <aside className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-primary-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-white" size={26} />
          <span className="text-white font-semibold text-lg tracking-tight">Mentor Platform</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Structured guidance.<br/>Measurable progress.
          </h2>
          <p className="text-primary-200 text-[14px] leading-relaxed">
            A workflow-oriented platform for mentors, students, and administrators
            to track academic and professional progress end-to-end.
          </p>
        </div>
        <p className="text-primary-400 text-[12px]">© 2026 Mentor Platform</p>
      </aside>

      {/* Right panel */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <ShieldCheck className="text-primary-600" size={22} />
            <span className="font-semibold text-[15px] text-gray-800">Mentor Platform</span>
          </div>

          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-[13px] text-gray-500 mb-7">Enter your credentials to continue</p>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. student1"
                className="w-full px-3.5 py-2.5 text-[13.5px] bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-300 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-[13.5px] bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-[14px] font-semibold rounded-lg shadow-sm transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Dev quick-login  */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Dev quick-login
            </p>
            <div className="flex gap-2 flex-wrap">
              {QUICK_LOGINS.map(q => (
                <button
                  key={q.role}
                  onClick={() => { setUsername(q.username); setPassword('any'); }}
                  className="px-3 py-1.5 text-[11px] font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
