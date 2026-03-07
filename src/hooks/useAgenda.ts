'use client';

import { useState, useEffect } from 'react';
import { fetchUnifiedAgenda, type UnifiedEvent, type AgendaSource } from '@/services/agenda';

export function useAgenda(source: AgendaSource) {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgenda() {
      try {
        setLoading(true);
        const data = await fetchUnifiedAgenda(source);
        setEvents(data);
      } catch (err) {
        setError('Error loading streaming schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadAgenda();
  }, [source]);

  return { events, loading, error };
}
