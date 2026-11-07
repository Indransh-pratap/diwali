import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { diyaWishes } from '../data'

export default function InteractiveDiyas() {
  const [litDiyas, setLitDiyas] = useState([1]) // 1 lit initially
  const [activeWish, setActiveWish] = useState(null) // small popup wish

  const isAllLit = litDiyas.length === diyaWishes.length

  const handleDiyaClick = (id, idx) => {
    if (!litDiyas.includes(id)) {
      const nextLit = [...litDiyas, id]
      setLitDiyas(nextLit)

      if (nextLit.length === diyaWishes.length) {
        window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 20 } }))
      } else {
        window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 6 } }))
      }
    }

    setActiveWish(diyaWishes[idx])
  }

  return (
    <section id="diyas" className="relative w-full min-h-[80vh] py-24 px-4 flex flex-col items-center justify-center text-center z-10">
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Main Heading Only - Clean & Minimal */}
        <motion.h2
          className="font-script gold-text-luxury text-5xl sm:text-7xl mb-4"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          A Little Light For You ❤️
        </motion.h2>

        {/* Small Minimal Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.25em] text-[#e6c887]/80 mb-12 font-medium"
        >
          {litDiyas.length} / 5 lit
        </motion.div>

        {/* 5 Beautiful, Bigger, Realistic Glowing Diyas in Horizontal Arrangement */}
        <div className="relative flex items-end justify-center gap-5 sm:gap-10 my-4 px-2 w-full max-w-3xl">
          {diyaWishes.map((diya, idx) => {
            const isLit = litDiyas.includes(diya.id)
            const flameAnimation = idx % 3 === 0 ? 'flame-1' : idx % 3 === 1 ? 'flame-2' : 'flame-3'

            return (
              <div key={diya.id} className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleDiyaClick(diya.id, idx)}
                  aria-label={`Light Diya ${diya.id}`}
                  className="relative group transition-transform duration-300 hover:scale-108 active:scale-95 focus:outline-none"
                >
                  {/* Floor Reflection when lit */}
                  {isLit && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 sm:w-44 h-7 rounded-full bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,154,60,0.5)_0%,rgba(245,194,107,0.18)_50%,transparent_80%)] blur-md pointer-events-none" />
                  )}

                  {/* 3D-inspired Clay Diya SVG (Bigger, realistic lighting) */}
                  <svg
                    width="92"
                    height="78"
                    viewBox="0 0 120 100"
                    className="overflow-visible filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]"
                  >
                    <defs>
                      <linearGradient id={`clay-${diya.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#cf6430" />
                        <stop offset="45%" stopColor="#9e3e18" />
                        <stop offset="100%" stopColor="#5c1f09" />
                      </linearGradient>

                      <linearGradient id={`gold-rim-${diya.id}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f5e4be" />
                        <stop offset="50%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#f5e4be" />
                      </linearGradient>

                      <radialGradient id={`flame-glow-${diya.id}`} cx="50%" cy="40%">
                        <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.95" />
                        <stop offset="45%" stopColor="#ff9a3c" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
                      </radialGradient>

                      <linearGradient id={`flame-core-${diya.id}`} x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#ff4514" />
                        <stop offset="45%" stopColor="#ffb84d" />
                        <stop offset="85%" stopColor="#fffbe6" />
                      </linearGradient>
                    </defs>

                    {/* Flame Aura Glow (When lit) */}
                    {isLit && (
                      <circle cx="60" cy="38" r="48" fill={`url(#flame-glow-${diya.id})`} className="animate-pulse" />
                    )}

                    {/* Animated Realistic Flame */}
                    {isLit ? (
                      <g className={flameAnimation}>
                        <path d="M60 6 C74 24 76 38 60 50 C44 38 46 24 60 6Z" fill={`url(#flame-core-${diya.id})`} />
                        <path d="M60 14 C68 28 69 36 60 46 C51 36 52 28 60 14Z" fill="#fffbe6" opacity="0.85" />
                      </g>
                    ) : (
                      /* Unlit wick with faint ember */
                      <circle cx="60" cy="44" r="2.5" fill="#4a180b" opacity="0.7" />
                    )}

                    {/* Diya Wick */}
                    <rect x="58" y="44" width="4" height="9" rx="2" fill="#2d1007" />

                    {/* Terracotta Clay Body */}
                    <path
                      d="M8 52 Q60 49 112 52 Q106 90 60 92 Q14 90 8 52Z"
                      fill={`url(#clay-${diya.id})`}
                    />

                    {/* Golden Ornamental Rim */}
                    <path
                      d="M8 52 Q60 59 112 52"
                      stroke={`url(#gold-rim-${diya.id})`}
                      strokeWidth="2.5"
                      fill="none"
                      opacity="0.9"
                    />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>

        {/* Small Elegant Popup (Hidden by default, shown only when a diya is clicked) */}
        <AnimatePresence>
          {activeWish && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-12 inset-x-4 max-w-md mx-auto z-50 p-5 rounded-2xl bg-[#140726]/95 backdrop-blur-xl border border-[#e6c887]/35 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(230,200,135,0.15)] text-center"
            >
              <button
                onClick={() => setActiveWish(null)}
                aria-label="Close wish"
                className="absolute top-3 right-3 text-[#e6c887] p-1 rounded-full hover:bg-[#e6c887]/15 transition"
              >
                <X size={16} />
              </button>

              <p className="text-[11px] uppercase tracking-[0.2em] text-[#f29bb2] font-medium mb-1">
                {activeWish.title}
              </p>
              <p className="font-serif italic text-lg sm:text-xl text-[#faf4ea] leading-relaxed my-1">
                “{activeWish.wish}”
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal Celebration Banner when all are lit */}
        <AnimatePresence>
          {isAllLit && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 px-6 py-4 rounded-full bg-[#18082e]/80 border border-[#e6c887]/35 text-center shadow-[0_0_30px_rgba(230,200,135,0.2)] inline-flex items-center gap-2 text-sm font-serif italic text-[#f5e4be]"
            >
              <Sparkles size={16} className="text-[#e6c887]" />
              All diyas are burning bright with pure love for you, Radha.
              <Sparkles size={16} className="text-[#e6c887]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
