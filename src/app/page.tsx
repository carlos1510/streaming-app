import ThemeToggle from '@/components/ui/ThemeToggle';
import AgendaList from '@/components/streaming/AgendaList';
import { Radio } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="w-full bg-[var(--header-bg)] border-b border-foreground/5 shadow-sm">
        <header className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                <Radio size={28} className="animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                FANS<span className="text-primary">Deportes</span> LIVE
              </h1>
            </div>
            <p className="text-foreground/60 font-medium max-w-md">
              Mira tus eventos deportivos favoritos en vivo.
            </p>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            <div className="hidden md:block h-10 w-[1px] bg-foreground/10 mx-2" />
            <ThemeToggle />
          </div>
        </header>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
        <AgendaList />

        {/* Footer */}
        <footer className="pt-12 border-t border-foreground/10 text-center text-foreground/40 text-sm pb-8">
          <p>&copy; {new Date().getFullYear()} FANSDeportes Streaming.</p>
        </footer>
      </div>
    </main>
  );
}
