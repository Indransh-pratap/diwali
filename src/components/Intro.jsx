import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Volume2, VolumeX, Flame } from 'lucide-react'
import { triggerHaptic } from '../utils/haptics'
import { festiveAudio } from '../utils/festiveSoundEngine'
import FestiveFireworksCanvas from './FestiveFireworksCanvas'

export default function Intro({ onOpen }) {
  const [isLit, setIsLit] = useState(false)
  const [showSparkBurst, setShowSparkBurst] = useState(false)
  const [ambientMuted, setAmbientMuted] = useState(false)

  // 1. DICTION SEQUENCE: When user clicks "Tap to light the diya"
  const handleLightDiya = (e) => {
    e.stopPropagation()
    if (isLit) return

    triggerHaptic(50)

    // A. Play gentle lighting sound (match strike + warm chime)
    festiveAudio.playLightingSound()

    // B. Trigger small spark burst animation at wick
    setShowSparkBurst(true)
    setTimeout(() => setShowSparkBurst(false), 900)

    // C. Start festive ambient soundscape (distant crackers, anar, chakri, thuds)
    festiveAudio.startFestiveAmbience()

    // D. Request background music autoplay
    window.dispatchEvent(new CustomEvent('request-music-play'))

    // E. Reveal the flame and illuminate the card
    setIsLit(true)
  }

  // 2. TRANSITION SEQUENCE: Enter Radha's Universe
  const handleEnterUniverse = (e) => {
    e.stopPropagation()
    triggerHaptic(30)
    if (onOpen) onOpen(e)
  }

  // Toggle ambient fireworks SFX volume
  const toggleAmbientSound = (e) => {
    e.stopPropagation()
    triggerHaptic(20)
    const muted = festiveAudio.toggleMute()
    setAmbientMuted(muted)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#080414] overflow-hidden text-center select-none touch-manipulation"
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 1. THREE TYPES OF DIWALI FIREWORKS (Anar, Chakri, Aerial Fireworks behind content) */}
      <FestiveFireworksCanvas className="opacity-70" />

      {/* Atmospheric Ambient Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_65%_at_50%_100%,rgba(74,18,38,0.85)_0%,rgba(8,4,20,0.96)_75%)] pointer-events-none -z-10" />

      {/* Ambient Fireworks Sound Controller (Top Right Corner) */}
      <button
        onClick={toggleAmbientSound}
        aria-label={ambientMuted ? 'Unmute Diwali Firecrackers SFX' : 'Mute Diwali Firecrackers SFX'}
        className="absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#140726]/80 backdrop-blur-xl border border-[#e6c887]/30 text-[#e6c887] text-xs font-sans shadow-lg hover:bg-[#e6c887]/15 active:scale-95 transition"
      >
        {ambientMuted ? <VolumeX size={14} className="text-[#e6c887]/70" /> : <Volume2 size={14} className="text-[#e6c887] animate-pulse" />}
        <span className="text-[11px] font-medium hidden xs:inline">{ambientMuted ? 'Crackers Muted' : 'Diwali Ambience'}</span>
      </button>

      {/* ======================================================================
          2. OPENING HEADLINE (Displayed immediately when website opens)
          ====================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl px-4 text-center mb-4 sm:mb-6 z-30"
      >
        <h2 className="font-script gold-text-luxury text-3xl xs:text-4xl sm:text-5xl md:text-6xl leading-tight sm:leading-snug drop-shadow-[0_0_20px_rgba(230,200,135,0.7)] drop-shadow-[0_0_35px_rgba(255,154,60,0.4)]">
          “Tu Phuljhadiyon Wale Tyoharon Jaisi Hai...” ✨
        </h2>
      </motion.div>

      {/* ======================================================================
          3. THE DIYA CARD (Initially unlit; illuminates upon click)
          ====================================================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`relative max-w-sm sm:max-w-md w-full rounded-3xl p-6 sm:p-8 backdrop-blur-2xl border border-[#e6c887]/35 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(230,200,135,0.18)] flex flex-col items-center transition-all duration-700 z-30 ${
          isLit
            ? 'bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,154,60,0.28)_0%,rgba(18,6,36,0.92)_70%)] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_55px_rgba(255,154,60,0.25)] border-[#e6c887]/50'
            : 'bg-[#120624]/85'
        }`}
      >
        {/* Large Clay Diya SVG (Initially completely unlit; flame and halo only appear when isLit is true) */}
        <div className="relative my-2 sm:my-3">
          {/* Floor Reflection when lit */}
          {isLit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-36 sm:w-44 h-7 rounded-full bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,154,60,0.65)_0%,rgba(245,194,107,0.22)_50%,transparent_80%)] blur-md pointer-events-none"
            />
          )}

          <svg
            width="112"
            height="96"
            viewBox="0 0 120 100"
            className="overflow-visible filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.65)]"
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

              {/* Flame Aura Glow Gradient */}
              <radialGradient id="introFlameGlow" cx="50%" cy="40%">
                <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#ff9a3c" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
              </radialGradient>

              {/* Realistic Flame Core Gradient */}
              <linearGradient id="introFlameCore" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ff4514" />
                <stop offset="45%" stopColor="#ffb84d" />
                <stop offset="85%" stopColor="#fffbe6" />
              </linearGradient>
            </defs>

            {/* A. Golden Glowing Halo (Strictly visible ONLY when isLit is true) */}
            {isLit && (
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                cx="60"
                cy="38"
                r="48"
                fill="url(#introFlameGlow)"
              />
            )}

            {/* B. Ignition Spark Burst Animation */}
            {showSparkBurst && (
              <g>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                  const rad = (angle * Math.PI) / 180
                  const dist = 22
                  const x2 = 60 + Math.cos(rad) * dist
                  const y2 = 40 + Math.sin(rad) * dist
                  return (
                    <motion.line
                      key={idx}
                      initial={{ opacity: 1, x2: 60, y2: 40 }}
                      animate={{ opacity: 0, x2, y2 }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                      x1="60"
                      y1="40"
                      stroke="#ffe28a"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )
                })}
              </g>
            )}

            {/* C. The Flame (Strictly visible ONLY when isLit is true) */}
            {isLit ? (
              <motion.g
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flame-2"
              >
                <path d="M60 6 C74 24 76 38 60 50 C44 38 46 24 60 6Z" fill="url(#introFlameCore)" />
                <path d="M60 14 C68 28 69 36 60 46 C51 36 52 28 60 14Z" fill="#fffbe6" opacity="0.85" />
              </motion.g>
            ) : (
              /* D. Unlit dark wick tip (Clean unlit clay diya) */
              <circle cx="60" cy="44" r="2.5" fill="#2d1007" />
            )}

            {/* Diya Wick */}
            <rect x="58" y="44" width="4" height="9" rx="2" fill="#240c06" />

            {/* Terracotta Clay Body */}
            <path d="M8 52 Q60 49 112 52 Q106 90 60 92 Q14 90 8 52Z" fill="url(#introClay)" />

            {/* Golden Ornamental Rim */}
            <path d="M8 52 Q60 59 112 52" stroke="url(#introRim)" strokeWidth="2.5" fill="none" opacity="0.9" />
          </svg>
        </div>

        {/* Card Title */}
        <h1 className="font-script gold-text-luxury text-3xl sm:text-4xl my-2">
          For Radha ❤️
        </h1>

        {/* ====================================================================
            STATE 1: UNLIT - "Tap to light the diya 🪔"
            ==================================================================== */}
        {!isLit && (
          <button
            onClick={handleLightDiya}
            className="btn-primary-luxury text-xs sm:text-sm mt-3 px-6 py-3 active:scale-95 touch-manipulation flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(230,200,135,0.6)] cursor-pointer"
          >
            <Flame size={15} className="text-[#1a082c] animate-pulse" />
            <span>Tap to light the diya 🪔</span>
          </button>
        )}

        {/* ====================================================================
            STATE 2: LIT - Romantic message & Enter button
            ==================================================================== */}
        <AnimatePresence>
          {isLit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center w-full"
            >
              {/* Romantic Message */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.9 }}
                className="font-serif italic text-base sm:text-lg text-[#faf4ea] leading-relaxed my-3 px-2 text-center"
              >
                “Some lights brighten the sky, but you brighten my entire world. ❤️”
              </motion.p>

              {/* Enter Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                onClick={handleEnterUniverse}
                className="btn-primary-luxury text-xs sm:text-sm px-7 py-3 mt-2 active:scale-95 touch-manipulation flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(230,200,135,0.7)] cursor-pointer"
              >
                <span>Enter Radha's World ✨</span>
                <Sparkles size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
