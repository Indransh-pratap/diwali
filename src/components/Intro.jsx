import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function Intro({ onOpen }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080414] overflow-hidden text-center cursor-pointer select-none"
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      onClick={onOpen}
      role="button"
      aria-label="Tap to light the diya and begin"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,rgba(74,18,38,0.85)_0%,rgba(8,4,20,0.95)_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-sm w-full rounded-3xl p-8 bg-[#120624]/80 backdrop-blur-xl border border-[#e6c887]/30 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col items-center"
      >
        {/* Large Glowing Clay Diya */}
        <div className="relative my-3">
          <svg
            width="104"
            height="90"
            viewBox="0 0 120 100"
            className="overflow-visible filter drop-shadow-[0_15px_25px_rgba(255,154,60,0.45)]"
          >
            <defs>
              <linearGradient id="introClay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cf6430" />
                <stop offset="50%" stopColor="#9e3e18" />
                <stop offset="100%" stopColor="#5c1f09" />
              </linearGradient>
              <linearGradient id="introRim" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f5e4be" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#f5e4be" />
              </linearGradient>
              <radialGradient id="introFlameGlow" cx="50%" cy="40%">
                <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#ff9a3c" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="introFlameCore" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ff4514" />
                <stop offset="45%" stopColor="#ffb84d" />
                <stop offset="85%" stopColor="#fffbe6" />
              </linearGradient>
            </defs>

            <circle cx="60" cy="38" r="48" fill="url(#introFlameGlow)" className="animate-pulse" />
            <g className="flame-2">
              <path d="M60 6 C74 24 76 38 60 50 C44 38 46 24 60 6Z" fill="url(#introFlameCore)" />
              <path d="M60 14 C68 28 69 36 60 46 C51 36 52 28 60 14Z" fill="#fffbe6" opacity="0.85" />
            </g>
            <rect x="58" y="44" width="4" height="9" rx="2" fill="#2d1007" />
            <path d="M8 52 Q60 49 112 52 Q106 90 60 92 Q14 90 8 52Z" fill="url(#introClay)" />
            <path d="M8 52 Q60 59 112 52" stroke="url(#introRim)" strokeWidth="2.5" fill="none" opacity="0.9" />
          </svg>
        </div>

        {/* Clean, minimal title */}
        <h1 className="font-script gold-text-luxury text-4xl sm:text-5xl my-3">
          For Radha ❤️
        </h1>

        <button className="btn-primary-luxury text-xs sm:text-sm mt-4 px-6 py-2.5">
          <span>Tap to light the diya 🪔</span>
          <Sparkles size={15} />
        </button>
      </motion.div>
    </motion.div>
  )
}
