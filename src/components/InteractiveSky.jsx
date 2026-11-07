import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { skyStarNotes } from '../data'

export default function InteractiveSky() {
  const [selectedNote, setSelectedNote] = useState(null)
  const [shootingStars, setShootingStars] = useState([])

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
    { id: 1, x: '20%', y: '22%', size: 18 },
    { id: 2, x: '35%', y: '16%', size: 20 },
    { id: 3, x: '48%', y: '26%', size: 16 },
    { id: 4, x: '66%', y: '18%', size: 20 },
    { id: 5, x: '82%', y: '28%', size: 18 },
    { id: 6, x: '24%', y: '60%', size: 16 },
    { id: 7, x: '76%', y: '64%', size: 18 },
    { id: 8, x: '50%', y: '68%', size: 20 },
  ]

  const handleStarClick = (idx) => {
    setSelectedNote(skyStarNotes[idx % skyStarNotes.length])
    window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 5 } }))
  }

  return (
    <section id="sky" className="relative w-full min-h-[90vh] py-24 px-4 flex flex-col items-center justify-center text-center overflow-hidden z-10">
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

      {/* Single Main Heading */}
      <motion.h2
        className="font-script gold-text-luxury text-5xl sm:text-7xl mb-8"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Our Starry Sky
      </motion.h2>

      {/* CELESTIAL STAGE WITH "RADHA" CONSTELLATION */}
      <div className="relative w-full max-w-3xl h-[380px] sm:h-[440px] rounded-3xl border border-[#e6c887]/20 bg-[#0e051c]/60 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Glowing Full Moon */}
        <div className="absolute top-8 left-8 sm:top-10 sm:left-12 w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fffbf0,#e6c887)] shadow-[0_0_35px_rgba(245,228,190,0.45)] pointer-events-none opacity-80" />

        {/* RADHA CONSTELLATION */}
        <svg viewBox="0 0 800 380" className="absolute inset-0 w-full h-full pointer-events-none">
          <g stroke="#e6c887" strokeWidth="1.2" opacity="0.38" strokeDasharray="3,3">
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

        {/* Constellation Name */}
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-script text-2xl text-[#f5e4be]/90 pointer-events-none">
          Radha ✨
        </p>

        {/* 8 Clickable Stars */}
        {interactiveStars.map((st, i) => (
          <button
            key={st.id}
            onClick={() => handleStarClick(i)}
            aria-label={`Tap star ${st.id}`}
            className="absolute p-2 transition transform hover:scale-135 focus:outline-none"
            style={{ top: st.x, left: st.y }}
          >
            <Star
              size={st.size}
              className="text-[#f5e4be] hover:text-white transition drop-shadow-[0_0_8px_rgba(230,200,135,0.85)]"
              fill="currentColor"
            />
          </button>
        ))}
      </div>

      {/* Small Minimal Star Note Drawer */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-10 inset-x-4 max-w-md mx-auto z-40 p-5 rounded-2xl bg-[#140726]/95 backdrop-blur-xl border border-[#e6c887]/35 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-center"
          >
            <button
              onClick={() => setSelectedNote(null)}
              aria-label="Close"
              className="absolute top-3 right-3 text-[#e6c887] p-1 rounded-full hover:bg-[#e6c887]/15 transition"
            >
              <X size={16} />
            </button>

            <blockquote className="font-serif italic text-lg sm:text-xl text-[#faf4ea] my-1 leading-relaxed">
              “{selectedNote}”
            </blockquote>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
