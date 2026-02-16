interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface SegmentedControlProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function SegmentedControl({ tabs, activeTab, onTabChange }: SegmentedControlProps) {
  return (
    <div className="flex h-12 items-center justify-center rounded-xl bg-gray-200/50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 h-full rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.key
              ? 'bg-white shadow-sm text-primary font-semibold'
              : 'text-gray-500'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </button>
      ))}
    </div>
  );
}
