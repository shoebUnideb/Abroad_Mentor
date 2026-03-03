import type { ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
  style?: CSSProperties;
}

const PAD = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

export default function Card({
  children,
  className = '',
  padding = 'md',
  onClick,
  hoverable = false,
  style,
}: Props) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={[
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        PAD[padding],
        hoverable ? 'cursor-pointer transition-shadow hover:shadow-md hover:border-gray-300' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
