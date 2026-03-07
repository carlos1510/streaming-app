'use client';

import { useState } from 'react';
import { useAgenda } from '@/hooks/useAgenda';
import { type AgendaSource, type UnifiedEvent } from '@/services/agenda';
import EventCard from './EventCard';
import StreamPlayer from './StreamPlayer';
import SourceSelector from '../ui/SourceSelector';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';

export default function AgendaList() {
  const [source, setSource] = useState<AgendaSource>('goolhd');
  const { events, loading, error } = useAgenda(source);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState<{ url: string; name: string; streams: UnifiedEvent['streams'] } | null>(null);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-foreground/5 p-4 rounded-2xl glass">
        <SourceSelector source={source} onSourceChange={setSource} />

        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
          <input
            type="text"
            placeholder={`Busca en ${source === 'goolhd' ? 'GoolHD' : 'TVLibre'}...`}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border-foreground/10 focus:ring-2 focus:ring-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="text-primary animate-spin" />
          <p className="text-foreground/60 font-medium">Fetching {source} streams...</p>
        </div>
      ) : error ? (
        <div className="p-8 glass rounded-2xl text-center">
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <p className="text-foreground/60 text-lg">No events found matching your search.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-foreground/40 text-sm px-2">
            <SlidersHorizontal size={16} />
            <span>Mostrando {filteredEvents.length} eventos de {source === 'goolhd' ? 'GoolHD' : 'TVLibre'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelectStream={(url, name, streams) => setSelectedStream({ url, name, streams })}
              />
            ))}
          </div>
        </>
      )}

      <StreamPlayer
        url={selectedStream?.url || null}
        name={selectedStream?.name || null}
        streams={selectedStream?.streams || []}
        onClose={() => setSelectedStream(null)}
      />
    </div>
  );
}
