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

      <div className="flex flex-wrap justify-center gap-12 sm:gap-16">
        {STUDIOS.map((studio, index) => (
          <Link
            key={studio.id}
            to={`/studio/${studio.id}`}
            className="group flex flex-col items-center gap-6 shrink-0 outline-none"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            {/* Big Circular Icon */}
            <div 
              className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden flex items-center justify-center border-4 border-zinc-800 bg-gradient-to-br ${studio.bgGradient} group-hover:border-zinc-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-focus:border-white`}
              style={{ boxShadow: `0 0 0 0 ${studio.accentColor}00` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 15px 40px -10px ${studio.accentColor}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 0 ${studio.accentColor}00`;
              }}
            >
              <div className="w-[80%] h-[80%] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                {studio.logo}
              </div>
            </div>
            
            {/* Studio Name */}
            <span className="text-sm sm:text-base font-semibold text-zinc-400 group-hover:text-white transition-colors text-center max-w-[160px] leading-tight">
              {studio.name}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
