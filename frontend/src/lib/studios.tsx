import React from 'react';

export type StudioType = 'movie' | 'tv';

export interface Studio {
  id: string; // our internal string id
  name: string;
  tmdbCompanyId?: number;
  tmdbNetworkId?: number;
  type: 'movie' | 'tv';
  logoUrl: string;
  bgGradient: string;
  accentColor: string;
}

export const STUDIOS: Studio[] = [
  {
    id: 'marvel',
    name: 'Marvel Studios',
    tmdbCompanyId: 420,
    type: 'movie',
    bgGradient: 'from-[#EC1D24]/30 to-[#EC1D24]/10',
    accentColor: '#EC1D24',
    logoUrl: 'https://image.tmdb.org/t/p/w500/hUzeosd33nzE5MCNsZxCGEKTXaQ.png'
  },
  {
    id: 'pixar',
    name: 'Pixar Animation',
    tmdbCompanyId: 3,
    type: 'movie',
    bgGradient: 'from-[#0070C9]/30 to-[#0070C9]/10',
    accentColor: '#0070C9',
    logoUrl: 'https://image.tmdb.org/t/p/w500/1TjvGVDMYsj6JBxOAkUHpPEwLf7.png'
  },
  {
    id: 'disney',
    name: 'Walt Disney Pictures',
    tmdbCompanyId: 2,
    type: 'movie',
    bgGradient: 'from-[#3b82f6]/30 to-[#3b82f6]/10',
    accentColor: '#3b82f6',
    logoUrl: 'https://image.tmdb.org/t/p/w500/wdrCwmRnLFJhEoH8GSfymY85KHT.png'
  },
  {
    id: 'lucasfilm',
    name: 'Lucasfilm',
    tmdbCompanyId: 1,
    type: 'movie',
    bgGradient: 'from-[#FFD700]/30 to-[#FFD700]/10',
    accentColor: '#FFD700',
    logoUrl: 'https://image.tmdb.org/t/p/w500/tlVSws0RvvtPBwViUyOFAO0vcQS.png'
  },
  {
    id: 'hbo',
    name: 'HBO',
    tmdbCompanyId: 745, // HBO Films
    tmdbNetworkId: 49, // HBO Network
    type: 'tv',
    bgGradient: 'from-[#652CB3]/30 to-[#652CB3]/10',
    accentColor: '#652CB3',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    tmdbCompanyId: 178464, // Netflix company for movies
    tmdbNetworkId: 213,    // Netflix network for tv
    type: 'tv',
    bgGradient: 'from-[#E50914]/30 to-[#E50914]/10',
    accentColor: '#E50914',
    logoUrl: 'https://image.tmdb.org/t/p/w500/wwemzKWzjKYJFfCeiB57q3r4Bcm.png'
  },
  {
    id: 'a24',
    name: 'A24',
    tmdbCompanyId: 41077,
    type: 'movie',
    bgGradient: 'from-[#ffffff]/30 to-[#ffffff]/5',
    accentColor: '#ffffff',
    logoUrl: 'https://image.tmdb.org/t/p/w500/1ZXsGaFPgrgS6ZZGS37AqD5uU12.png'
  },
  {
    id: 'amazon',
    name: 'Amazon Prime',
    tmdbCompanyId: 20580, // Amazon Studios
    tmdbNetworkId: 1024, // Amazon network
    type: 'tv',
    bgGradient: 'from-[#00A8E1]/30 to-[#00A8E1]/10',
    accentColor: '#00A8E1',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg'
  },
  {
    id: 'appletv',
    name: 'Apple TV+',
    tmdbCompanyId: 110620, // Apple Studios
    tmdbNetworkId: 2552, // Apple TV+ network
    type: 'tv',
    bgGradient: 'from-[#ffffff]/30 to-[#ffffff]/5',
    accentColor: '#ffffff',
    logoUrl: 'https://image.tmdb.org/t/p/w500/bngHRFi794mnMq34gfVcm9nDxN1.png'
  },
  {
    id: 'paramount',
    name: 'Paramount Pictures',
    tmdbCompanyId: 4,
    tmdbNetworkId: 43, // Paramount Network
    type: 'movie',
    bgGradient: 'from-[#0ea5e9]/30 to-[#0ea5e9]/10',
    accentColor: '#0ea5e9',
    logoUrl: 'https://image.tmdb.org/t/p/w500/jay6WcMgagAklUt7i9Euwj1pzTF.png'
  },
  {
    id: 'universal',
    name: 'Universal Pictures',
    tmdbCompanyId: 33,
    type: 'movie',
    bgGradient: 'from-[#C4A45D]/30 to-[#C4A45D]/10',
    accentColor: '#C4A45D',
    logoUrl: 'https://image.tmdb.org/t/p/w500/8lvHyhjr8oUKOOy2dKXoALWKdp0.png'
  },
  {
    id: 'warnerbros',
    name: 'Warner Bros.',
    tmdbCompanyId: 174,
    type: 'movie',
    bgGradient: 'from-[#0057b7]/30 to-[#0057b7]/10',
    accentColor: '#0057b7',
    logoUrl: 'https://image.tmdb.org/t/p/w500/zhD3hhtKB5qyv7ZeL4uLpNxgMVU.png'
  },
  {
    id: 'sony',
    name: 'Columbia Pictures',
    tmdbCompanyId: 5,
    type: 'movie',
    bgGradient: 'from-[#ffffff]/30 to-[#ffffff]/5',
    accentColor: '#ffffff',
    logoUrl: 'https://image.tmdb.org/t/p/w500/71BqEFAF4V3qjjMPCpLuyJFB9A.png'
  },
  {
    id: 'lionsgate',
    name: 'Lionsgate',
    tmdbCompanyId: 1632,
    type: 'movie',
    bgGradient: 'from-[#D4AF37]/30 to-[#D4AF37]/10',
    accentColor: '#D4AF37',
    logoUrl: 'https://image.tmdb.org/t/p/w500/cisLn1YAUuptXVBa0xjq7ST9cH0.png'
  },
  {
    id: 'focusfeatures',
    name: 'Focus Features',
    tmdbCompanyId: 10146,
    type: 'movie',
    bgGradient: 'from-[#ffffff]/30 to-[#ffffff]/5',
    accentColor: '#ffffff',
    logoUrl: 'https://image.tmdb.org/t/p/w500/xnFIOeq5cKw09kCWqV7foWDe4AA.png'
  },
  {
    id: 'dreamworks',
    name: 'DreamWorks',
    tmdbCompanyId: 521,
    type: 'movie',
    bgGradient: 'from-[#00A0B0]/30 to-[#00A0B0]/10',
    accentColor: '#00A0B0',
    logoUrl: 'https://image.tmdb.org/t/p/w500/3BPX5VGBov8SDqTV7wC1L1xShAS.png'
  },
  {
    id: 'illumination',
    name: 'Illumination',
    tmdbCompanyId: 6704,
    type: 'movie',
    bgGradient: 'from-[#FDB813]/30 to-[#FDB813]/10',
    accentColor: '#FDB813',
    logoUrl: 'https://image.tmdb.org/t/p/w500/fOG2oY4m1YuYTQh4bMqqZkmgOAI.png'
  },
  {
    id: 'ghibli',
    name: 'Studio Ghibli',
    tmdbCompanyId: 10342,
    type: 'movie',
    bgGradient: 'from-[#5A8FCE]/30 to-[#5A8FCE]/10',
    accentColor: '#5A8FCE',
    logoUrl: 'https://image.tmdb.org/t/p/w500/uFuxPEZRUcBTEiYIxjHJq62Vr77.png'
  }
];
