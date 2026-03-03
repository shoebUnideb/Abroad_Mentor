import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" subtitle="Platform configuration." />
      <Card padding="lg">
        <div className="flex items-center gap-3 text-gray-400 py-8 justify-center">
          <Settings size={20} />
          <span className="text-[13px]">Settings panel — coming in Phase 2.</span>
        </div>
      </Card>
    </div>
  );
}
