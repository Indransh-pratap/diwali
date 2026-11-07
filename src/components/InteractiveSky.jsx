import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, Sparkles, ChevronRight } from 'lucide-react'
import { skyStarNotes } from '../data'
import { triggerHaptic } from '../utils/haptics'

export default function InteractiveSky() {
  const [selectedNote, setSelectedNote] = useState(null)
  const [shootingStars, setShootingStars] = useState([])
  const [customStars, setCustomStars] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now()
      const top = Math.random() * 30 + 5
      const left = Math.random() * 60 + 5
      setShootingStars((prev) => [...prev, { id, top, left }])
      setTimeout(() => {
        setShootingStars((prev) => prev.filter((s) => s.id !== id))
      }, 1400)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const interactiveStars = [
    { id: 1, x: '22%', y: '20%', size: 20 },
    { id: 2, x: '16%', y: '36%', size: 22 },
    { id: 3, x: '26%', y: '48%', size: 18 },
    { id: 4, x: '18%', y: '66%', size: 22 },
    { id: 5, x: '28%', y: '82%', size: 20 },
    { id: 6, x: '60%', y: '24%', size: 18 },
    { id: 7, x: '64%', y: '76%', size: 20 },
    { id: 8, x: '68%', y: '50%', size: 22 },
  ]

  const handleStarClick = (idx, e) => {
    if (e) e.stopPropagation()
    triggerHaptic(35)
    setSelectedNote({ text: skyStarNotes[idx % skyStarNotes.length], index: idx })
    window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 6 } }))
  }

  const handleSkyTap = (e) => {
    // When user taps on the celestial stage, spawn a new glowing star
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    triggerHaptic(20)
    const newStarId = Date.now()
    setCustomStars((prev) => [...prev.slice(-12), { id: newStarId, x, y }])

    // Also launch a shooting star
    setShootingStars((prev) => [
      ...prev,
      { id: newStarId + 1, top: Math.max(5, y - 10), left: Math.max(5, x - 10) }
    ])
    setTimeout(() => {
      setShootingStars((prev) => prev.filter((s) => s.id !== newStarId + 1))
    }, 1400)
  }

  const handleNextStar = () => {
    if (!selectedNote) return
    const nextIdx = (selectedNote.index + 1) % skyStarNotes.length
    handleStarClick(nextIdx)
  }

  return (
    <section id="sky" className="relative w-full min-h-[90vh] py-20 sm:py-24 px-3 sm:px-4 flex flex-col items-center justify-center text-center overflow-hidden z-10">
      {/* Shooting Stars */}
      {shootingStars.map((s) => (
        <div
          key={s.id}
          className="absolute h-0.5 w-24 bg-gradient-to-r from-transparent via-[#f5e4be] to-white pointer-events-none -z-10 transform -rotate-45"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            animation: 'shootingStar 1.4s ease-out forwards',
          }}
        />
      ))}

      <style>{`
        @keyframes shootingStar {
          0% { transform: translate(0, 0) rotate(-45deg) scaleX(0); opacity: 1; }
          60% { transform: translate(160px, 160px) rotate(-45deg) scaleX(1.4); opacity: 1; }
          100% { transform: translate(280px, 280px) rotate(-45deg) scaleX(0.2); opacity: 0; }
        }
      `}</style>

      {/* Main Heading */}
      <motion.h2
        className="font-script gold-text-luxury text-4xl sm:text-6xl md:text-7xl mb-3"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Our Starry Sky
      </motion.h2>

      {/* Mobile Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-xs sm:text-sm font-sans text-[#f5e4be]/80 mb-6 flex items-center justify-center gap-1.5"
      >
        <Sparkles size={14} className="text-[#e6c887]" />
        <span>Tap glowing stars to read secret thoughts ✨</span>
      </motion.p>

      {/* CELESTIAL STAGE WITH "RADHA" CONSTELLATION */}
      <div
        onClick={handleSkyTap}
        className="relative w-full max-w-3xl h-[340px] xs:h-[380px] sm:h-[440px] rounded-3xl border border-[#e6c887]/25 bg-[#0e051c]/70 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden cursor-crosshair touch-manipulation select-none"
      >
        {/* Glowing Full Moon */}
        <div className="absolute top-6 left-6 sm:top-10 sm:left-12 w-12 h-12 xs:w-14 xs:h-14 sm:w-18 sm:h-18 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fffbf0,#e6c887)] shadow-[0_0_35px_rgba(245,228,190,0.45)] pointer-events-none opacity-85" />

        {/* RADHA CONSTELLATION */}
        <svg viewBox="0 0 800 380" className="absolute inset-0 w-full h-full pointer-events-none">
          <g stroke="#e6c887" strokeWidth="1.2" opacity="0.4" strokeDasharray="3,3">
            <polyline points="120,280 120,130 170,130 190,165 170,200 120,200 190,280" />
            <polyline points="230,280 270,130 310,280" /><line x1="248" y1="225" x2="292" y2="225" />
            <polyline points="350,280 350,130 400,130 435,205 400,280 350,280" />
            <line x1="475" y1="130" x2="475" y2="280" /><line x1="545" y1="130" x2="545" y2="280" /><line x1="475" y1="205" x2="545" y2="205" />
            <polyline points="590,280 635,130 680,280" /><line x1="610" y1="225" x2="660" y2="225" />
          </g>

          {/* Glowing star nodes */}
          <g fill="#ffe6a3">
            <circle cx="120" cy="280" r="3.5" /><circle cx="120" cy="130" r="4" /><circle cx="170" cy="130" r="3" /><circle cx="190" cy="165" r="3.5" /><circle cx="170" cy="200" r="3" /><circle cx="190" cy="280" r="4" />
            <circle cx="230" cy="280" r="3.5" /><circle cx="270" cy="130" r="5" /><circle cx="310" cy="280" r="3.5" />
            <circle cx="350" cy="280" r="3.5" /><circle cx="350" cy="130" r="4" /><circle cx="400" cy="130" r="3" /><circle cx="435" cy="205" r="4.5" /><circle cx="400" cy="280" r="3.5" />
            <circle cx="475" cy="130" r="4" /><circle cx="475" cy="280" r="3.5" /><circle cx="545" cy="130" r="4" /><circle cx="545" cy="280" r="3.5" />
            <circle cx="590" cy="280" r="3.5" /><circle cx="635" cy="130" r="5" /><circle cx="680" cy="280" r="3.5" />
          </g>
        </svg>

        {/* User Created Tap Stars */}
        {customStars.map((st) => (
          <div
            key={st.id}
            className="absolute w-2 h-2 rounded-full bg-white pointer-events-none animate-ping"
            style={{
              top: `${st.y}%`,
              left: `${st.x}%`,
              boxShadow: '0 0 12px #fff, 0 0 20px #e6c887',
            }}
          />
        ))}

        {/* Constellation Name */}
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 font-script text-2xl sm:text-3xl text-[#f5e4be]/90 pointer-events-none drop-shadow-[0_0_12px_rgba(245,228,190,0.5)]">
          Radha ✨
        </p>

        {/* 8 Clickable Stars - Generous Thumb-Friendly Touch Targets (44px) */}
        {interactiveStars.map((st, i) => (
          <button
            key={st.id}
            onClick={(e) => handleStarClick(i, e)}
            aria-label={`Tap star ${st.id}`}
            className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform active:scale-125 focus:outline-none cursor-pointer group touch-manipulation"
            style={{ top: st.x, left: st.y }}
          >
            {/* Glowing Pulsing Ring */}
            <span className="absolute inset-2 rounded-full bg-[#f5e4be]/15 group-hover:bg-[#f5e4be]/30 animate-pulse pointer-events-none" />

            <Star
              size={st.size}
              className="text-[#f5e4be] group-hover:text-white transition drop-shadow-[0_0_10px_rgba(245,228,190,0.9)]"
              fill="currentColor"
            />
          </button>
        ))}
      </div>

      {/* Touch-Friendly Star Note Drawer */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.8rem)] sm:bottom-10 inset-x-3 xs:inset-x-4 max-w-md mx-auto z-40 p-5 rounded-3xl bg-[#140726]/95 backdrop-blur-2xl border border-[#e6c887]/35 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(230,200,135,0.18)] text-center"
          >
            <button
              onClick={() => setSelectedNote(null)}
              aria-label="Close note"
              className="absolute top-3.5 right-3.5 text-[#e6c887] p-2 rounded-full hover:bg-[#e6c887]/15 active:scale-90 transition"
            >
              <X size={18} />
            </button>

            <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-[#f29bb2] font-semibold mb-2">
              Secret Constellation Note ✨
            </span>

            <blockquote className="font-serif italic text-base sm:text-xl text-[#faf4ea] my-1 leading-relaxed px-2">
              “{selectedNote.text}”
            </blockquote>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e6c887]/20">
              <span className="text-[11px] text-[#e6c887]/60 font-medium">
                Star {selectedNote.index + 1} of {skyStarNotes.length}
              </span>
              <button
                onClick={handleNextStar}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#f5e4be] bg-[#e6c887]/20 hover:bg-[#e6c887]/30 px-3 py-1.5 rounded-full transition active:scale-95"
              >
                <span>Next Star</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
