import React from 'react';

export type StudioType = 'movie' | 'tv';

export interface Studio {
  id: string; // our internal string id like 'marvel'
  name: string;
  tmdbId: number;
  type: StudioType;
  logo: React.ReactNode;
  bgGradient: string;
  accentColor: string;
}

export const STUDIOS: Studio[] = [
  {
    id: 'marvel',
    name: 'Marvel Studios',
    tmdbId: 420,
    type: 'movie',
    bgGradient: 'from-[#EC1D24]/20 to-[#EC1D24]/5',
    accentColor: '#EC1D24',
    logo: (
      <div className="inline-flex items-center justify-center bg-[#EC1D24] px-3 py-1 rounded-sm">
        <span className="text-white font-black text-xl tracking-wider" style={{ fontFamily: 'Arial Black, sans-serif' }}>MARVEL</span>
      </div>
    ),
  },
  {
    id: 'pixar',
    name: 'Pixar Animation Studios',
    tmdbId: 3,
    type: 'movie',
    bgGradient: 'from-[#0070C9]/20 to-[#0070C9]/5',
    accentColor: '#0070C9',
    logo: (
      <span className="text-white font-bold text-2xl tracking-tight drop-shadow-md" style={{ fontFamily: 'Georgia, serif' }}>
        PIXAR<span className="text-[#0070C9]">.</span>
      </span>
    ),
  },
  {
    id: 'lucasfilm',
    name: 'Lucasfilm',
    tmdbId: 1,
    type: 'movie',
    bgGradient: 'from-[#FFD700]/20 to-[#FFD700]/5',
    accentColor: '#FFD700',
    logo: (
      <span className="text-white font-bold text-xl tracking-[0.25em] uppercase drop-shadow-md" style={{ fontFamily: 'Arial, sans-serif' }}>Lucasfilm</span>
    ),
  },
  {
    id: 'disney',
    name: 'Walt Disney Pictures',
    tmdbId: 2,
    type: 'movie',
    bgGradient: 'from-blue-500/20 to-blue-500/5',
    accentColor: '#3b82f6',
    logo: (
      <svg viewBox="0 0 120 34" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        <text x="0" y="26" fontFamily="Georgia, serif" fontSize="30" fontWeight="700" fill="white" letterSpacing="-1">Disney</text>
      </svg>
    ),
  },
  {
    id: 'hbo',
    name: 'HBO',
    tmdbId: 49,
    type: 'tv',
    bgGradient: 'from-purple-600/20 to-purple-600/5',
    accentColor: '#9333ea',
    logo: (
      <span className="text-white font-black text-3xl tracking-widest drop-shadow-md" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '0.15em' }}>HBO</span>
    ),
  },
  {
    id: 'paramount',
    name: 'Paramount Pictures',
    tmdbId: 4,
    type: 'movie',
    bgGradient: 'from-sky-500/20 to-sky-500/5',
    accentColor: '#0ea5e9',
    logo: (
      <span className="text-white font-medium text-xl tracking-tight drop-shadow-md flex items-center gap-2" style={{ fontFamily: 'Times New Roman, serif' }}>
        <span className="text-sky-400">★</span> Paramount
      </span>
    ),
  },
  {
    id: 'universal',
    name: 'Universal Pictures',
    tmdbId: 33,
    type: 'movie',
    bgGradient: 'from-[#C4A45D]/20 to-[#C4A45D]/5',
    accentColor: '#C4A45D',
    logo: (
      <span className="text-white font-bold text-xl sm:text-2xl tracking-wider drop-shadow-md" style={{ fontFamily: 'Arial, sans-serif' }}>UNIVERSAL</span>
    ),
  }
];
