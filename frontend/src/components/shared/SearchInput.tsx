import { useEffect, useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }: SearchInputProps) {
  const [internal, setInternal] = useState(value);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internal !== value) {
        onChange(internal);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [internal, value, onChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MaterialIcon name="search" className="text-gray-400 text-xl" />
      </div>
      <input
        type="text"
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
      />
    </div>
  );
}
