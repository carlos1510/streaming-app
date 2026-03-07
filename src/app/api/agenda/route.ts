import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

//const GOOLHD_API_URL = 'https://goolhd.com/agenda.json?v=1.07';
const GOOLHD_API_URL = 'https://goolhd.com/agenda.json?v=1.11';
const TVLIBRE_PAGE_URL = 'https://tvlibree.com/agenda/';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'goolhd';

  try {
    if (source === 'goolhd') {
      const response = await fetch(GOOLHD_API_URL, {
        next: { revalidate: 300 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
      });
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const response = await fetch(TVLIBRE_PAGE_URL, {
        next: { revalidate: 300 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
      });
      const html = await response.text();
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  } catch (error) {
    console.error(`Error in agenda proxy (${source}):`, error);
    return NextResponse.json({ error: 'Failed to fetch agenda' }, { status: 500 });
  }
}
