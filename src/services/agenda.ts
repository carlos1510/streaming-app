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
    
    return result.data.map((event: any) => ({
      id: event.id,
      title: event.attributes.diary_description,
      category: event.attributes.deportes,
      date: event.attributes.date_diary,
      time: event.attributes.diary_hour,
      source: 'goolhd',
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

    $('ul li').each((i, el) => {
      const eventLink = $(el).find('a').first();
      const eventTitleAndPage = eventLink.text().trim();
      
      if (eventTitleAndPage.includes(':')) {
        const [categoryAndTitle, time] = eventTitleAndPage.split('\n');
        const [category, title] = categoryAndTitle.split(': ');

        const streams: UnifiedStream[] = [];
        $(el).find('a').slice(1).each((j, streamEl) => {
          const streamName = $(streamEl).text().trim();
          const href = $(streamEl).attr('href') || '';
          
          let decodedUrl = href;
          if (href.includes('?r=')) {
            const encoded = href.split('?r=')[1];
            try {
              decodedUrl = atob(encoded);
            } catch (e) {
              console.error('Error decoding TVLibre link:', e);
            }
          } else if (href.startsWith('/')) {
              // Handle relative internal links by prepending the base domain
              decodedUrl = `https://tvlibree.com${href}`;
          } else if (href.startsWith('en-vivo/') || href.startsWith('eventos/')) {
              // Handle other relative formats
              decodedUrl = `https://tvlibree.com/${href}`;
          }

          if (streamName && !streamName.includes('Agenda')) {
            streams.push({
              id: `tvl-s-${i}-${j}`,
              name: streamName.replace('Calidad 720p', '').trim(),
              language: 'Español',
              url: decodedUrl
            });
          }
        });

        if (streams.length > 0) {
          events.push({
            id: `tvl-${i}`,
            title: (title || categoryAndTitle).trim(),
            category: (category || 'Deportes').trim(),
            date: new Date().toLocaleDateString(),
            time: (time || 'N/A').trim(),
            source: 'tvlibre',
            streams: streams
          });
        }
      }
    });

    return events;
  } catch (error) {
    console.error('Error fetching TVLibre via proxy:', error);
    return [];
  }
}

export async function fetchUnifiedAgenda(source: AgendaSource): Promise<UnifiedEvent[]> {
  if (source === 'goolhd') return fetchGoolHD();
  return fetchTVLibre();
}
