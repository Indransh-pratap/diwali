import { useState } from 'react'

export default function Diya({ size = 120, className = '', flameClass = 'flame-center', onClick }) {
  const [bursts, setBursts] = useState([])

  const handleClick = (e) => {
    // Spawn burst
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now() + Math.random()
    setBursts((prev) => [...prev, id])
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b !== id))
    }, 800)

    if (onClick) onClick(e)
  }

  const art = (
    <svg width={size} height={size * 0.8} viewBox="0 0 120 96" className={`${className} overflow-visible`} aria-hidden="true">
      <defs>
        <radialGradient id={`g-${size}-${flameClass}`} cx="50%" cy="40%">
          <stop offset="0" stopColor="#ffd27a" stopOpacity=".95" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`b-${size}-${flameClass}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#b8651b" />
        </linearGradient>
        <linearGradient id={`f-${size}-${flameClass}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff5722" />
          <stop offset=".5" stopColor="#ffc14d" />
          <stop offset="1" stopColor="#fffbe6" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="38" r="46" fill={`url(#g-${size}-${flameClass})`} className="glow" />
      <g className={flameClass}>
        <path d="M60 8 C72 24 74 36 60 48 C46 36 48 24 60 8Z" fill={`url(#f-${size}-${flameClass})`} />
      </g>
      <rect x="58" y="44" width="4" height="8" rx="2" fill="#5a2a0a" />
      <path d="M8 52 Q60 50 112 52 Q106 88 60 90 Q14 88 8 52Z" fill={`url(#b-${size}-${flameClass})`} />
      <path d="M8 52 Q60 58 112 52" stroke="#fff0b8" strokeWidth="2" fill="none" opacity=".7" />
    </svg>
  )

  return onClick ? (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Light a diya"
      className="relative transition hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
    >
      {art}
      {bursts.map((id) => (
        <span
          key={id}
          className="diya-burst pointer-events-none"
          style={{ top: '35%', left: '50%' }}
        />
      ))}
    </button>
  ) : art
}
