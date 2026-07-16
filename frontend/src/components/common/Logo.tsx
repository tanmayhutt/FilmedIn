import React from 'react'
import { Link } from 'react-router-dom'

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-[4px] ${className}`}>
      <span className="font-bold text-2xl tracking-tighter text-white">Filmed</span>
      <div className="flex items-center justify-center text-white mt-[2px]">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          {/* Clapperboard Top Stick */}
          <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" fill="currentColor" />
          <path d="m6.2 5.3 3.1 3.9" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="m12.4 3.4 3.1 4" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Clapperboard Bottom Box */}
          <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" fill="currentColor" />
          
          {/* The 'in' text cut out of the bottom box */}
          <text 
            x="12" 
            y="18.5" 
            textAnchor="middle" 
            fontFamily="Arial, sans-serif" 
            fontWeight="900" 
            fontSize="8.5"
            fill="#09090b"
          >
            in
          </text>
        </svg>
      </div>
    </Link>
  )
}
