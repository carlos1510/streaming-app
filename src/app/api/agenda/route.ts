import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

//const GOOLHD_API_URL = 'https://goolhd.com/agenda.json?v=1.07';
const GOOLHD_API_URL = 'https://goolhd.com/agenda.json?v=1.11';
const TVLIBRE_PAGE_URL = 'http://tv-libre.net/agenda/';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'goolhd';
  const timestamp = new Date().getTime();

  try {
    if (source === 'goolhd') {
      const response = await fetch(`${GOOLHD_API_URL}&t=${timestamp}`, {
        next: { revalidate: 300 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
      });
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Use http instead of https for tv-libre.net to avoid ECONNRESET from Cloudflare/TLS
      const response = await fetch(`${TVLIBRE_PAGE_URL}?t=${timestamp}`, {
        next: { revalidate: 0 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Referer': 'http://tv-libre.net/',
        }
      });
      const html = await response.text();
      return new NextResponse(html, {
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }
  } catch (error) {
    console.error(`Error in agenda proxy (${source}):`, error);
    return NextResponse.json({ error: 'Failed to fetch agenda' }, { status: 500 });
  }
}
