import { useEffect, useState } from 'react';
import { fetchSeasonDetails } from '@/services/tmdb.service';

interface HeatmapProps {
  tvId: number;
  seasons: { season_number: number; name: string }[];
}

export function EpisodeHeatmap({ tvId, seasons }: HeatmapProps) {
  const [data, setData] = useState<Record<number, Record<number, number | null>>>({});
  const [loading, setLoading] = useState(true);
  const [maxEpisodes, setMaxEpisodes] = useState(0);

  const validSeasons = seasons.filter(s => s.season_number > 0).sort((a, b) => a.season_number - b.season_number);

  useEffect(() => {
    async function loadAllSeasons() {
      setLoading(true);
      try {
        const promises = validSeasons.map(s => fetchSeasonDetails(tvId.toString(), s.season_number));
        const results = await Promise.all(promises);
        
        let highestEpCount = 0;
        const newMatrix: Record<number, Record<number, number | null>> = {};

        results.forEach((seasonData, index) => {
          if (!seasonData) return;
          const sNum = validSeasons[index].season_number;
          newMatrix[sNum] = {};
          
          seasonData.episodes.forEach(ep => {
            newMatrix[sNum][ep.episode_number] = ep.vote_average || null;
            if (ep.episode_number > highestEpCount) {
              highestEpCount = ep.episode_number;
            }
          });
        });

        setData(newMatrix);
        setMaxEpisodes(highestEpCount);
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
  }, [tvId]);

  if (validSeasons.length === 0) return null;

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-zinc-900/30 rounded-xl border border-zinc-800">
        <span className="text-zinc-500 animate-pulse font-medium">Building rating heatmap...</span>
      </div>
    );
  }

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'bg-zinc-800 text-transparent'; // No rating or aired yet
    if (rating >= 9.0) return 'bg-[#186a3b] text-white'; // Awesome (Dark Green)
    if (rating >= 8.0) return 'bg-[#2ecc71] text-zinc-900'; // Great (Bright Green)
    if (rating >= 7.0) return 'bg-[#f1c40f] text-zinc-900'; // Good (Yellow)
    if (rating >= 6.0) return 'bg-[#e67e22] text-white'; // Regular (Orange)
    return 'bg-[#e74c3c] text-white'; // Bad (Red)
  };

  const episodes = Array.from({ length: maxEpisodes }, (_, i) => i + 1);

  return (
    <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 tracking-wide font-mono">SERIES GRAPH</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Episode Ratings Heatmap</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-zinc-300">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#186a3b]"></div>Awesome</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#2ecc71]"></div>Great</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#f1c40f]"></div>Good</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#e67e22]"></div>Regular</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#e74c3c]"></div>Bad</div>
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
                const rating = data[s.season_number]?.[ep];
                return (
                  <div key={`${s.season_number}-${ep}`} className="w-14 shrink-0 px-[2px]">
                    <div 
                      className={`h-9 w-full flex items-center justify-center rounded-[4px] text-xs font-bold transition-all hover:opacity-80 hover:scale-105 cursor-default ${getRatingColor(rating)}`}
                      title={rating ? `S${s.season_number} E${ep} - Rating: ${rating.toFixed(1)}` : 'No rating / Unreleased'}
                    >
                      {rating ? rating.toFixed(1) : '-'}
                    </div>
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
