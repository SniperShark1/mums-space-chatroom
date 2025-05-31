interface UserAvatarProps {
  initials: string;
  ageGroup: string;
  size?: 'sm' | 'md';
  color?: string;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

export default function UserAvatar({ initials, ageGroup, size = 'md', color = 'blue' }: UserAvatarProps) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  const colorClasses = colorMap[color] || colorMap.blue;

  return (
    <div className={`${sizeClasses} ${colorClasses} rounded-full flex items-center justify-center flex-shrink-0 font-medium`}>
      {initials}
    </div>
  );
}
