'use client';

import { LayoutGrid, List } from 'lucide-react';
import { type AgendaSource } from '@/services/agenda';
import { cn } from '@/lib/utils';

interface SourceSelectorProps {
  source: AgendaSource;
  onSourceChange: (source: AgendaSource) => void;
}

export default function SourceSelector({ source, onSourceChange }: SourceSelectorProps) {
  return (
    <div className="flex p-1 bg-foreground/5 rounded-xl glass inline-flex">
      <button
        onClick={() => onSourceChange('goolhd')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold",
          source === 'goolhd' ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-foreground/5 text-foreground/60"
        )}
      >
        <LayoutGrid size={16} />
        GoolHD
      </button>
      <button
        onClick={() => onSourceChange('tvlibre')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold",
          source === 'tvlibre' ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-foreground/5 text-foreground/60"
        )}
      >
        <List size={16} />
        TVLibre
      </button>
    </div>
  );
}
