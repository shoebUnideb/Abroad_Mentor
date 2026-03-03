import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { profilesApi } from '../../api/profiles';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import { Linkedin, Phone, Save } from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { data: profile } = useApi(profilesApi.getStudentProfile);

  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? '');
      setPhone(profile.phone ?? '');
      setLinkedin(profile.linkedin_url ?? '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append('bio', bio);
    form.append('phone', phone);
    form.append('linkedin_url', linkedin);
    await profilesApi.updateStudentProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="My Profile"
        subtitle="Keep your profile up to date for your mentor."
      />

      <Card className="mb-6" padding="lg">
        <div className="flex items-center gap-5 mb-8">
          <Avatar
            name={`${user?.first_name} ${user?.last_name}`}
            size="xl"
          />
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-[13px] text-gray-500">@{user?.username}</p>
            <p className="text-[12px] text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Write a short bio..."
              className="w-full px-3.5 py-2.5 text-[13.5px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                <Phone size={11} className="inline mr-1" />Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555-0000"
                className="w-full px-3.5 py-2.5 text-[13.5px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                <Linkedin size={11} className="inline mr-1" />LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3.5 py-2.5 text-[13.5px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Save size={14} />
              Save Changes
            </button>
            {saved && (
              <span className="text-[12px] text-green-600 font-medium">Saved ✓</span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

