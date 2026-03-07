'use client';

import { X, Maximize, Minimize, Shield, ShieldOff, AlertCircle, Play } from 'lucide-react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { type UnifiedStream } from '@/services/agenda';

interface StreamPlayerProps {
  url: string | null;
  name: string | null;
  streams: UnifiedStream[];
  onClose: () => void;
}

const ANTI_SANDBOX_DOMAINS = [
    'stream196tp.com',
    'streamtp10.com',
    'la14hd.com',
    'goolhd.com'
];

export default function StreamPlayer({ url: initialUrl, name, streams, onClose }: StreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);

  // Synchronize internal url with prop
  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const isAntiSandboxDomain = useMemo(() => {
    if (!url) return false;
    return ANTI_SANDBOX_DOMAINS.some(domain => url.includes(domain));
  }, [url]);

  useEffect(() => {
    if (isAntiSandboxDomain) {
      setUseSandbox(false);
    } else {
      setUseSandbox(true);
    }
  }, [isAntiSandboxDomain, url]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!url) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        ref={containerRef}
        className="relative w-full h-full flex flex-col bg-black shadow-2xl"
      >
        {/* Header */}
        <div className="w-full p-4 flex justify-between items-center bg-zinc-900 border-b border-zinc-800 z-10 transition-opacity">
          <div className="flex flex-col">
            <h2 className="text-white font-bold text-lg leading-tight truncate max-w-[300px] md:max-w-md">
              <span className="text-primary mr-2">LIVE:</span> {name}
            </h2>
            {!useSandbox && (
                <div className="flex items-center gap-1.5 text-yellow-500 font-bold uppercase tracking-wider animate-pulse">
                    <AlertCircle size={12} />
                    <span className="text-[10px]">
                        Compatibility Mode {isAntiSandboxDomain ? "(Auto)" : ""}
                    </span>
                </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseSandbox(!useSandbox)}
              className={`p-2 rounded-full transition-colors ${useSandbox ? 'bg-zinc-800 hover:bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}
              title={useSandbox ? "Bypass Protection (Use if video is blocked)" : "Re-enable Protection"}
            >
              {useSandbox ? <Shield size={20} /> : <ShieldOff size={20} />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-zinc-800 hover:bg-primary text-white transition-colors"
              title="Full Screen"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-800 hover:bg-red-500 text-white transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Section (80%) */}
          <div className="w-4/5 h-full bg-black relative">
            <iframe
              key={`${url}-${useSandbox}`}
              src={url}
              className="w-full h-full border-0 select-none"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={name || 'Stream Player'}
              sandbox={useSandbox ? "allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen allow-popups allow-popups-to-escape-sandbox" : undefined}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>

          {/* Sidebar Section (20%) */}
          <div className="w-1/5 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Play size={14} className="text-primary" />
                Channels
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {streams.map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => setUrl(stream.url)}
                  className={`w-full flex flex-col gap-1 p-3 rounded-xl transition-all duration-200 text-left group
                    ${url === stream.url 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50'
                    }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold truncate text-sm">{stream.name}</span>
                    <Play size={12} className={url === stream.url ? "opacity-100" : "opacity-0 group-hover:opacity-50 transition-opacity"} />
                  </div>
                  <span className={`text-[10px] uppercase font-medium tracking-tighter ${url === stream.url ? "text-white/80" : "text-zinc-500"}`}>
                    {stream.language} • Quality HD
                  </span>
                </button>
              ))}
              
              {streams.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 px-4 text-center py-10">
                   <AlertCircle size={32} className="mb-2 opacity-20" />
                   <p className="text-xs">No more channels available for this event.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/20 text-[10px] text-zinc-600 italic border-t border-zinc-800">
              Switch channels if the current one is offline or lagging.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
