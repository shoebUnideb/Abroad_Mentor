interface Props {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm:  'w-7  h-7  text-[11px]',
  md:  'w-9  h-9  text-[13px]',
  lg:  'w-12 h-12 text-[15px]',
  xl:  'w-16 h-16 text-[18px]',
};

const COLORS = [
  'bg-blue-500',   'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
  'bg-pink-500',   'bg-rose-500',   'bg-orange-500', 'bg-teal-500',
];

function colorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ src, name = '', size = 'md', className = '' }: Props) {
  const initials = name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
  const sizeClass = SIZE_MAP[size];
  const bg = colorFromName(name || 'user');

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${bg} text-white font-semibold`}>
          {initials || '?'}
        </div>
      )}
    </div>
  );
}
