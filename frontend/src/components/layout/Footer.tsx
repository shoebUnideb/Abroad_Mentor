import { GraduationCap } from 'lucide-react';

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center shrink-0">
            <GraduationCap size={13} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold text-gray-700 tracking-tight">MentorPath</span>
        </div>
        <p className="text-[12px] text-gray-400">
          © {YEAR} MentorPath. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
