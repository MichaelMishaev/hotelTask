interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number;
}

export function MaterialIcon({ name, filled = false, className = '', size }: MaterialIconProps) {
  const sizeStyle = size ? { fontSize: `${size}px` } : undefined;
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'material-symbols-fill' : ''} ${className}`}
      style={sizeStyle}
    >
      {name}
    </span>
  );
}
