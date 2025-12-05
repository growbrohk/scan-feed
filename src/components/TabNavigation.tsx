import { ScanLine, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  activeTab: 'scan' | 'feed';
  onTabChange: (tab: 'scan' | 'feed') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb">
      <div className="flex">
        <button
          onClick={() => onTabChange('scan')}
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
            activeTab === 'scan'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ScanLine className="w-6 h-6" />
          <span className="text-xs font-medium">Scan</span>
        </button>
        <button
          onClick={() => onTabChange('feed')}
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
            activeTab === 'feed'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <List className="w-6 h-6" />
          <span className="text-xs font-medium">Feed</span>
        </button>
      </div>
    </nav>
  );
}
