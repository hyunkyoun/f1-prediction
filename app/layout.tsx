import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'F1 Qualifier Predictor 2026',
  description: 'Predict qualifying results for every race of the 2026 F1 season',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#0f0f0f] text-white">
        {/* Header / Nav */}
        <header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <span className="text-[#e10600]">F1</span>
              <span className="text-white/80">Predictor</span>
              <span className="text-xs font-normal text-white/40 ml-1">2026</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-white/60">
              <Link href="/" className="hover:text-white transition-colors">Calendar</Link>
              <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
              <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-[#2a2a2a] mt-16 py-6 text-center text-xs text-white/30">
          F1 Qualifier Predictor · 2026 Season · Not affiliated with Formula 1
        </footer>
      </body>
    </html>
  );
}
