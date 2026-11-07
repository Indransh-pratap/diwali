import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ChevronRight, Check } from 'lucide-react'
import { diyaWishes } from '../data'
import { triggerHaptic } from '../utils/haptics'
import Sparkler from './Sparkler'

export default function InteractiveDiyas() {
  const [litDiyas, setLitDiyas] = useState([1]) // 1 lit initially
  const [activeWish, setActiveWish] = useState(null) // popup wish

  const isAllLit = litDiyas.length === diyaWishes.length

  const handleDiyaClick = (id, idx) => {
    triggerHaptic(35)

    if (!litDiyas.includes(id)) {
      const nextLit = [...litDiyas, id]
      setLitDiyas(nextLit)

      if (nextLit.length === diyaWishes.length) {
        window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 24 } }))
      } else {
        window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 8 } }))
      }
    }

    setActiveWish({ ...diyaWishes[idx], index: idx })
  }

  const handleLightAll = () => {
    triggerHaptic(50)
    setLitDiyas(diyaWishes.map((d) => d.id))
    window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 25 } }))
    setActiveWish({ ...diyaWishes[diyaWishes.length - 1], index: diyaWishes.length - 1 })
  }

  const handleNextDiyaWish = () => {
    if (!activeWish) return
    const nextIdx = (activeWish.index + 1) % diyaWishes.length
    handleDiyaClick(diyaWishes[nextIdx].id, nextIdx)
  }

  return (
    <section id="diyas" className="relative w-full min-h-screen py-20 sm:py-28 px-3 sm:px-6 flex flex-col items-center justify-center text-center z-10 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex flex-col items-center">
        {/* Section Heading */}
        <motion.h2
          className="font-script gold-text-luxury text-4xl sm:text-6xl md:text-7xl mb-3 text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          A Little Light For You ❤️
        </motion.h2>

        {/* Helpful User Cue */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs sm:text-sm font-sans text-[#f5e4be]/85 mb-4 flex items-center justify-center gap-1.5"
        >
          <Sparkles size={14} className="text-[#e6c887]" />
          <span>Tap each diya & light the phuljhadiyaan 🪔✨</span>
        </motion.p>

        {/* Interactive Progress Indicator Dots */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8" aria-label={`${litDiyas.length} of 5 diyas lit`}>
          {diyaWishes.map((diya, i) => {
            const isLit = litDiyas.includes(diya.id)
            return (
              <button
                key={diya.id}
                onClick={() => handleDiyaClick(diya.id, i)}
                aria-label={`View Diya ${diya.id}`}
                className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                  isLit
                    ? 'w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-[#ff9a3c] to-[#e6c887] text-[#120726] shadow-[0_0_12px_rgba(255,154,60,0.7)]'
                    : 'w-5 h-5 sm:w-6 sm:h-6 bg-[#1a082c] border border-[#e6c887]/30 text-[#e6c887]/50'
                }`}
              >
                {isLit ? <Check size={12} strokeWidth={3} /> : <span className="text-[10px]">{i + 1}</span>}
              </button>
            )
          })}
          <span className="text-xs text-[#e6c887]/80 ml-1.5 font-medium">
            {litDiyas.length}/5 Lit
          </span>
        </div>

        {/* ======================================================================
            THE DIWALI ALTAR:
            Desktop & Tablet (sm:flex-nowrap): Left Phuljhadi | 5 Diyas | Right Phuljhadi
            Mobile (< sm): 5 Diyas at top, flanked by Left & Right Phuljhadi below
            ====================================================================== */}
        <div className="relative w-full my-4 sm:my-6 flex flex-wrap sm:flex-nowrap items-end justify-center gap-4 sm:gap-6 md:gap-8 px-2">
          {/* 1. Left Phuljhadi (Sparkler) */}
          <div className="order-2 sm:order-1 flex-shrink-0 flex flex-col items-center">
            <Sparkler side="left" label="Left Phuljhadi" />
          </div>

          {/* 2. Center 5 Clay Diyas */}
          <div className="order-1 sm:order-2 w-full sm:w-auto flex items-end justify-center gap-2 xs:gap-3 sm:gap-5 md:gap-7 my-2 px-1 overflow-visible">
            {diyaWishes.map((diya, idx) => {
              const isLit = litDiyas.includes(diya.id)
              const flameAnimation = idx % 3 === 0 ? 'flame-1' : idx % 3 === 1 ? 'flame-2' : 'flame-3'

              return (
                <div key={diya.id} className="relative flex flex-col items-center flex-1 max-w-[80px] sm:max-w-[100px]">
                  <button
                    type="button"
                    onClick={() => handleDiyaClick(diya.id, idx)}
                    aria-label={`Light Diya ${diya.id}: ${diya.title}`}
                    className="relative group transition-transform duration-200 active:scale-90 focus:outline-none w-full flex flex-col items-center cursor-pointer p-1 touch-manipulation"
                  >
                    {/* Floor Reflection when lit */}
                    {isLit && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 xs:w-20 sm:w-32 h-6 rounded-full bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,154,60,0.6)_0%,rgba(245,194,107,0.2)_50%,transparent_80%)] blur-md pointer-events-none" />
                    )}

                    {/* Responsive Clay Diya SVG */}
                    <svg
                      viewBox="0 0 120 100"
                      className="w-full h-auto max-w-[64px] xs:max-w-[76px] sm:max-w-[92px] overflow-visible filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.7)]"
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
                        <circle cx="60" cy="44" r="3" fill="#6d2b15" opacity="0.8" className="animate-ping" />
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

                    {/* Diya Label */}
                    <span className={`text-[11px] sm:text-xs font-serif mt-2 truncate w-full text-center transition-colors ${
                      isLit ? 'text-[#f5e4be] font-medium' : 'text-[#e6c887]/50'
                    }`}>
                      {diya.title.split('-')[1] || `Diya ${diya.id}`}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>

          {/* 3. Right Phuljhadi (Sparkler) */}
          <div className="order-3 sm:order-3 flex-shrink-0 flex flex-col items-center">
            <Sparkler side="right" label="Right Phuljhadi" />
          </div>
        </div>

        {/* Quick "Light All" Action */}
        {!isAllLit && (
          <button
            onClick={handleLightAll}
            className="mt-6 text-xs text-[#e6c887]/80 hover:text-[#f5e4be] border border-[#e6c887]/25 px-4 py-1.5 rounded-full backdrop-blur-sm bg-[#120726]/60 transition active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles size={13} className="text-[#f5e4be]" /> Light all diyas together
          </button>
        )}

        {/* Celebration Banner when all are lit */}
        <AnimatePresence>
          {isAllLit && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 px-5 py-3.5 rounded-full bg-[#18082e]/90 border border-[#e6c887]/40 text-center shadow-[0_0_35px_rgba(230,200,135,0.25)] inline-flex items-center gap-2 text-xs sm:text-sm font-serif italic text-[#f5e4be]"
            >
              <Sparkles size={16} className="text-[#e6c887] animate-pulse flex-shrink-0" />
              <span>All 5 diyas are lit with endless prayers for you, Radha ❤️</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wish Popup Dialog with Dimmed Backdrop */}
        <AnimatePresence>
          {activeWish && (
            <>
              {/* Semi-transparent Dimmed Backdrop to prevent background text collision */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveWish(null)}
                className="fixed inset-0 z-40 bg-[#080414]/70 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.25 }}
                className="fixed bottom-6 sm:bottom-10 inset-x-3 xs:inset-x-4 max-w-md mx-auto z-50 p-5 sm:p-6 rounded-3xl bg-[#140726]/95 backdrop-blur-2xl border border-[#e6c887]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(230,200,135,0.2)] text-center"
              >
                <button
                  onClick={() => setActiveWish(null)}
                  aria-label="Close wish"
                  className="absolute top-3.5 right-3.5 text-[#e6c887] p-2 rounded-full hover:bg-[#e6c887]/15 active:scale-90 transition"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#f29bb2] font-semibold mb-1">
                  <span>{activeWish.title}</span>
                  <span className="text-[#e6c887]/50">•</span>
                  <span className="text-[#e6c887]/80">{activeWish.meaning}</span>
                </div>

                <p className="font-serif italic text-base sm:text-xl text-[#faf4ea] leading-relaxed my-2 px-1">
                  “{activeWish.wish}”
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e6c887]/20">
                  <span className="text-[11px] text-[#e6c887]/60 font-medium">
                    Diya {activeWish.index + 1} of 5
                  </span>
                  <button
                    onClick={handleNextDiyaWish}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#f5e4be] bg-[#e6c887]/20 hover:bg-[#e6c887]/30 px-3 py-1.5 rounded-full transition active:scale-95"
                  >
                    <span>Next Diya</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
