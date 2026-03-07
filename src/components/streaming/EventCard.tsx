'use client';

import { UnifiedEvent } from '@/services/agenda';
import { Play, Calendar, Clock, Trophy, MapPin } from 'lucide-react';

interface EventCardProps {
  event: UnifiedEvent;
  onSelectStream: (url: string, name: string, streams: UnifiedEvent['streams']) => void;
}

export default function EventCard({ event, onSelectStream }: EventCardProps) {
  const { title, category, date, time, streams, source } = event;

  return (
    <div className="glass rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] shadow-lg">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
          <Trophy size={14} />
          {category}
        </div>
        <div className="flex items-center gap-2 text-foreground/60 text-sm">
          <Clock size={14} />
          {time.slice(0, 5)}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold line-clamp-2 leading-tight">
          {title}
        </h3>
        <div className="flex flex-wrap gap-3 mt-2">
          <p className="text-xs text-foreground/60 flex items-center gap-1">
            <Calendar size={12} />
            {date}
          </p>
          <p className="text-xs text-foreground/60 flex items-center gap-1 opacity-70 italic">
            <MapPin size={12} />
            Fuente: {source}
          </p>
        </div>
      </div>

      <div className="mt-2">
        <p className="text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wider">Canales disponibles</p>
        <div className="flex flex-wrap gap-2">
          {streams.map((stream) => (
            <button
              key={stream.id}
              onClick={() => onSelectStream(stream.url, title, streams)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-foreground/5 hover:bg-primary hover:text-white transition-colors text-sm font-medium border border-foreground/10"
            >
              <Play size={14} />
              {stream.name}
              <span className="text-[10px] opacity-70">({stream.language})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
