import { STUDIOS } from '@/lib/studios';
import { Link } from 'react-router-dom';

export default function StudiosIndex() {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="clay-card p-8 sm:p-12 text-center max-w-4xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 clay-badge-blue text-xs font-mono font-bold uppercase tracking-wider mb-4">
          Universes & Catalogs
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-3">
          Studios & Networks
        </h1>
        <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto">
          Explore the universes and catalogs of your favorite storytellers.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {STUDIOS.map((studio, index) => (
          <Link
            key={studio.id}
            to={`/studio/${studio.id}`}
            className="group flex flex-col items-center outline-none"
            style={{ transitionDelay: `${index * 30}ms` }}
          >
            {/* High Contrast Studio Card */}
            <div 
              className="relative mb-3.5 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#171817] p-6 transition-colors duration-200 hover:border-white/20 hover:bg-[#20211f]"
            >
              <div className="w-[80%] h-[75%] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={studio.logoUrl} 
                  alt={studio.name} 
                  className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-90 group-hover:opacity-100 transition-all" 
                />
              </div>
            </div>
            
            {/* Studio Name */}
            <span className="text-sm sm:text-base font-bold text-zinc-300 group-hover:text-white transition-colors text-center w-full leading-tight">
              {studio.name}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
