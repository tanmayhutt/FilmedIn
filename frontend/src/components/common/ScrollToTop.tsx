import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 700);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#1b1b22]/95 text-white shadow-xl backdrop-blur-md transition-colors hover:bg-[#23232c]"
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
