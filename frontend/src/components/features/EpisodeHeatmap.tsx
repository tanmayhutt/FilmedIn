import { useEffect, useMemo, useState } from 'react';
import { fetchSeasonDetails } from '@/services/tmdb.service';

interface HeatmapProps {
  tvId: number;
  seasons: { season_number: number; name: string }[];
}

export function EpisodeHeatmap({ tvId, seasons }: HeatmapProps) {
  const [data, setData] = useState<Record<number, Record<number, { rating: number | null, name: string }>>>({});
  const [loading, setLoading] = useState(true);
  const [maxEpisodes, setMaxEpisodes] = useState(0);
  const [hasRatings, setHasRatings] = useState(false);

  const validSeasons = useMemo(
    () => seasons.filter(s => s.season_number > 0).sort((a, b) => a.season_number - b.season_number),
    [seasons]
  );

  useEffect(() => {
    async function loadAllSeasons() {
      setLoading(true);
      try {
        const promises = validSeasons.map(s => fetchSeasonDetails(tvId.toString(), s.season_number));
        const results = await Promise.all(promises);
        
        let highestEpCount = 0;
        let foundAnyRating = false;
        const newMatrix: Record<number, Record<number, { rating: number | null, name: string }>> = {};

        results.forEach((seasonData, index) => {
          if (!seasonData) return;
          const sNum = validSeasons[index].season_number;
          newMatrix[sNum] = {};
          
          seasonData.episodes.forEach(ep => {
            newMatrix[sNum][ep.episode_number] = {
              rating: ep.vote_average || null,
              name: ep.name || `Episode ${ep.episode_number}`
            };
            if (ep.vote_average && ep.vote_average > 0) {
              foundAnyRating = true;
            }
            if (ep.episode_number > highestEpCount) {
              highestEpCount = ep.episode_number;
            }
          });
        });

        setData(newMatrix);
        setMaxEpisodes(highestEpCount);
        setHasRatings(foundAnyRating);
      } catch (err) {
        console.error("Failed to load heatmap data", err);
      }
      setLoading(false);
    }

    if (validSeasons.length > 0) {
      loadAllSeasons();
    } else {
      setLoading(false);
    }
  }, [tvId, validSeasons]);

  if (validSeasons.length === 0 || (!loading && !hasRatings)) return null;

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-[var(--theme-dark)]/30 rounded-xl border border-white/10">
        <span className="text-zinc-500 animate-pulse font-medium">Building rating heatmap...</span>
      </div>
    );
  }

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'bg-white/[0.025] text-zinc-700';
    if (rating >= 9.0) return 'bg-zinc-200 text-zinc-950';
    if (rating >= 8.0) return 'bg-zinc-400 text-zinc-950';
    if (rating >= 7.0) return 'bg-zinc-600 text-white';
    if (rating >= 6.0) return 'bg-zinc-700 text-white';
    return 'bg-zinc-800 text-zinc-300';
  };

  const episodes = Array.from({ length: maxEpisodes }, (_, i) => i + 1);

  return (
    <div className="bg-[var(--theme-bg)] border border-white/10/80 rounded-2xl p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 tracking-wide font-mono">SERIES GRAPH</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Episode Ratings Heatmap</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-zinc-300">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-zinc-200"></div>Excellent</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-zinc-400"></div>Great</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-zinc-600"></div>Good</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-zinc-700"></div>Fair</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-zinc-800"></div>Low</div>
        </div>
      </div>

      <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
        <div className="inline-block min-w-full">
          <div className="flex">
            {/* Y-Axis Label (Episodes) - Top left empty cell */}
            <div className="w-10 shrink-0 flex items-end justify-center pb-2 text-[10px] text-zinc-600 font-medium">EP \ S</div>
            
            {/* X-Axis (Seasons) */}
            {validSeasons.map(s => (
              <div key={s.season_number} className="w-14 shrink-0 flex items-center justify-center pb-2 text-xs font-bold text-zinc-400">
                {s.season_number}
              </div>
            ))}
          </div>

          {episodes.map(ep => (
            <div key={ep} className="flex mb-1">
              {/* Y-Axis (Episode number) */}
              <div className="w-10 shrink-0 flex items-center justify-center pr-2 text-xs font-bold text-zinc-400">
                {ep}
              </div>
              
              {/* Grid cells */}
              {validSeasons.map(s => {
                const epData = data[s.season_number]?.[ep];
                const rating = epData?.rating ?? null;
                const epName = epData?.name ?? '';
                
                return (
                  <div key={`${s.season_number}-${ep}`} className="w-14 shrink-0 px-[2px]">
                    <a 
                      href={`https://www.themoviedb.org/tv/${tvId}/season/${s.season_number}/episode/${ep}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`h-9 w-full flex items-center justify-center rounded-[4px] text-xs font-bold transition-all hover:opacity-80 hover:scale-105 cursor-pointer ${getRatingColor(rating)}`}
                      title={rating ? `S${s.season_number} E${ep}: ${epName} - Rating: ${rating.toFixed(1)}` : `S${s.season_number} E${ep}: ${epName} (No rating)`}
                    >
                      {rating ? rating.toFixed(1) : '-'}
                    </a>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
