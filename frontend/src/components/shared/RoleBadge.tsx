const roleStyles: Record<string, { bg: string; text: string }> = {
  Guest: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Staff: { bg: 'bg-green-50', text: 'text-green-700' },
  Admin: { bg: 'bg-purple-50', text: 'text-purple-700' },
};

interface RoleBadgeProps {
  role: 'Guest' | 'Staff' | 'Admin';
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = roleStyles[role] ?? roleStyles.Guest;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles.bg} ${styles.text}`}>
      {role}
    </span>
  );
}
