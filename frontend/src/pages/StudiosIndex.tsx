import { STUDIOS } from '@/lib/studios';
import { Link } from 'react-router-dom';

export default function StudiosIndex() {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6 mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white bg-gradient-to-br from-white via-zinc-200 to-zinc-500 text-transparent bg-clip-text">
          Studios & Networks
        </h1>
        <p className="text-lg text-zinc-400">
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
            {/* Glowing Rectangular Card */}
            <div 
              className={`relative w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center border-[3px] border-zinc-800 bg-gradient-to-br ${studio.bgGradient} group-hover:border-zinc-400 transition-all duration-300 group-hover:-translate-y-2 group-focus:border-white mb-4`}
              style={{ boxShadow: `0 0 0 0 ${studio.accentColor}00` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 20px 40px -10px ${studio.accentColor}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 0 ${studio.accentColor}00`;
              }}
            >
              <div className="w-[60%] h-[60%] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out p-2">
                <img src={studio.logoUrl} alt={studio.name} className="max-w-full max-h-full object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_2px_15px_rgba(255,255,255,0.4)] transition-all" />
              </div>
            </div>
            
            {/* Studio Name */}
            <span className="text-sm sm:text-base font-semibold text-zinc-400 group-hover:text-white transition-colors text-center w-full leading-tight">
              {studio.name}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
