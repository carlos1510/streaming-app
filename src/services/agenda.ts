import * as cheerio from 'cheerio';

export interface UnifiedStream {
  id: string | number;
  name: string;
  language: string;
  url: string;
}

export interface UnifiedEvent {
  id: string | number;
  title: string;
  category: string;
  date: string;
  time: string;
  streams: UnifiedStream[];
  source: 'goolhd' | 'tvlibre';
}

export type AgendaSource = 'goolhd' | 'tvlibre';

export async function fetchGoolHD(): Promise<UnifiedEvent[]> {
  try {
    const response = await fetch('/api/agenda?source=goolhd');
    if (!response.ok) throw new Error('API proxy error');
    const result = await response.json();
    
    const events = result.data.map((event: any) => ({
      id: event.id,
      title: event.attributes.diary_description,
      category: event.attributes.deportes,
      date: event.attributes.date_diary,
      time: event.attributes.diary_hour,
      source: 'goolhd' as const,
      streams: event.attributes.embeds.data.map((embed: any) => {
        const urlParams = new URLSearchParams(embed.attributes.embed_iframe.split('?')[1]);
        const encodedUrl = urlParams.get('r');
        const decodedUrl = encodedUrl ? atob(encodedUrl) : '';
        
        return {
          id: embed.id,
          name: embed.attributes.embed_name,
          language: embed.attributes.idioma,
          url: decodedUrl
        };
      })
    }));

    // Sort events by time (HH:MM:SS format)
    return events.sort((a: any, b: any) => a.time.localeCompare(b.time));
  } catch (error) {
    console.error('Error fetching GoolHD via proxy:', error);
    return [];
  }
}

export async function fetchTVLibre(): Promise<UnifiedEvent[]> {
  try {
    const response = await fetch('/api/agenda?source=tvlibre');
    if (!response.ok) throw new Error('API proxy error');
    const html = await response.text();
    const $ = cheerio.load(html);
    const events: UnifiedEvent[] = [];

    // The main list of events is within ul.menu
    $('ul.menu > li').each((i, el) => {
      const mainLink = $(el).children('a').first();
      const timeSpan = mainLink.find('span').first();
      const time = timeSpan.text().trim();
      
      // Get title by removing the time span from the link's text
      let titleWithCategory = mainLink.text().replace(time, '').trim();
      
      // Categorize and clean title
      let category = 'Deportes';
      if (titleWithCategory.includes(':')) {
        const parts = titleWithCategory.split(':');
        category = parts[0].trim();
        titleWithCategory = parts.slice(1).join(':').trim();
      }

      const streams: UnifiedStream[] = [];
      // Nested <ul> contains the stream options
      $(el).find('ul li a').each((j, streamEl) => {
        let streamName = $(streamEl).text().trim();
        const qualitySpan = $(streamEl).find('span').first();
        const quality = qualitySpan.text().trim();
        
        // Clean stream name
        streamName = streamName.replace(quality, '').trim();
        
        const href = $(streamEl).attr('href') || '';
        let decodedUrl = href;
        
        if (href.startsWith('/')) {
          decodedUrl = `https://tv-libre.net${href}`;
        }
        
        if (href.includes('?r=')) {
          const encoded = href.split('?r=')[1];
          try {
            // Check if the encoded string is actually base64 or just a plain URL
            if (encoded.match(/^[A-Za-z0-9+/=]+$/)) {
              decodedUrl = atob(encoded);
            } else {
              decodedUrl = decodeURIComponent(encoded);
            }
          } catch (e) {
            console.error('Error decoding TVLibre link:', e);
          }
        }

        if (streamName && !streamName.toLowerCase().includes('agenda')) {
          streams.push({
            id: `tvl-s-${i}-${j}`,
            name: streamName,
            language: 'Español',
            url: decodedUrl
          });
        }
      });

      if (streams.length > 0) {
        // Source uses CET/UTC+1 (60 minutes). Convert to local time.
        let localTime = time || 'N/A';
        if (time && time.includes(':')) {
          try {
            const [hStr, mStr] = time.trim().split(':');
            const h = parseInt(hStr, 10);
            const m = parseInt(mStr.slice(0, 2), 10); // Handle characters after minutes like am/pm if present
            
            const eventDate = new Date();
            eventDate.setHours(h, m, 0, 0);
            
            const userHuso = eventDate.getTimezoneOffset() * -1;
            // The site's base timezone is UTC+1 (60 mins)
            const adjustedDate = new Date(eventDate.getTime() - (60 - userHuso) * 60000);
            
            const hours = adjustedDate.getHours();
            const minutes = adjustedDate.getMinutes();
            const ampm = hours >= 12 ? 'pm' : 'am';
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
            
            localTime = `${displayHours}:${displayMinutes}${ampm}`;
          } catch (e) {
            console.error('Error calculating local time for TVLibre:', e);
          }
        }

        events.push({
          id: `tvl-${i}`,
          title: titleWithCategory || 'Evento en vivo',
          category: category,
          date: new Date().toLocaleDateString('es-ES'),
          time: localTime,
          source: 'tvlibre',
          streams: streams
        });
      }
    });

    // Helper to convert time string (e.g., "20:30", "11:00am", "2:30pm") to minutes from start of day
    const timeToMinutes = (timeStr: string) => {
      if (!timeStr || timeStr === 'N/A') return 9999;
      
      const cleanTime = timeStr.trim().toLowerCase();
      
      // Try AM/PM format first
      const amPmMatch = cleanTime.match(/(\d+):(\d+)\s*(am|pm)/);
      if (amPmMatch) {
        let hours = parseInt(amPmMatch[1], 10);
        const minutes = parseInt(amPmMatch[2], 10);
        const period = amPmMatch[3];
        
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
      }
      
      // Try 24-hour format
      const twentyFourMatch = cleanTime.match(/(\d+):(\d+)/);
      if (twentyFourMatch) {
        const hours = parseInt(twentyFourMatch[1], 10);
        const minutes = parseInt(twentyFourMatch[2], 10);
        return hours * 60 + minutes;
      }
      
      return 9999;
    };

    // Sort events by time ascending
    return events.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  } catch (error) {
    console.error('Error fetching TVLibre via proxy:', error);
    return [];
  }
}

export async function fetchUnifiedAgenda(source: AgendaSource): Promise<UnifiedEvent[]> {
  if (source === 'goolhd') return fetchGoolHD();
  return fetchTVLibre();
}
