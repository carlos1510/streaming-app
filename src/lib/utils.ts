import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeStreamLink(embedIframe: string): string {
  try {
    // The link format is /embed/eventos.html?r=BASE64_URL
    const urlParams = new URLSearchParams(embedIframe.split('?')[1]);
    const encodedUrl = urlParams.get('r');
    if (!encodedUrl) return '';
    
    // Decode base64
    return atob(encodedUrl);
  } catch (error) {
    console.error('Error decoding stream link:', error);
    return '';
  }
}
