import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Heart, ChevronDown } from 'lucide-react'
import Fireworks from './Fireworks'
import SurpriseModal from './SurpriseModal'

export default function Hero() {
  const [surpriseOpen, setSurpriseOpen] = useState(false)

  const handleEnterUniverse = () => {
    const el = document.getElementById('diyas')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="relative w-full h-[100dvh] flex flex-col justify-between items-center text-center px-4 pt-[calc(env(safe-area-inset-top,0px)+4.8rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] overflow-hidden z-10 box-border">
      {/* Background fireworks (subtle, corner-biased) */}
      <Fireworks rate={3200} className="z-0 opacity-45 pointer-events-none" />

      {/* Glowing Moon with Soft Floating Clouds */}
      <div className="absolute top-[8%] right-[8%] sm:right-[15%] w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fffbf0_0%,#f5e4be_45%,#d4af37_85%,transparent_100%)] shadow-[0_0_50px_rgba(245,228,190,0.45)] pointer-events-none -z-10 animate-float-slow">
        <div className="absolute -bottom-2 -left-4 w-28 sm:w-36 h-6 rounded-full bg-[#18092e]/60 blur-md pointer-events-none" />
      </div>

      {/* Clean Palace Silhouette along bottom */}
      <div className="absolute bottom-0 inset-x-0 h-36 sm:h-48 pointer-events-none -z-10 flex items-end justify-center overflow-hidden opacity-75">
        <svg
          viewBox="0 0 1200 320"
          className="w-full h-full object-cover object-bottom"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#070310">
            <path d="M120 140 C120 100 150 70 170 40 C190 70 220 100 220 140 L225 155 L115 155 Z" />
            <rect x="135" y="155" width="70" height="165" />
            <path d="M500 120 C500 60 560 20 600 0 C640 20 700 60 700 120 L710 140 L490 140 Z" />
            <rect x="495" y="140" width="210" height="180" />
            <path d="M980 140 C980 100 1010 70 1030 40 C1050 70 1080 100 1080 140 L1085 155 L975 155 Z" />
            <rect x="995" y="155" width="70" height="165" />
            <path d="M220 180 Q360 160 500 180 V320 H220 Z" />
            <path d="M700 180 Q840 160 980 180 V320 H700 Z" />
            <path d="M0 200 H135 V320 H0 Z" />
            <path d="M1065 200 H1200 V320 H1065 Z" />
          </g>

          {/* Warm glowing palace windows */}
          <g fill="#ffb84d" filter="drop-shadow(0 0 8px #ff9a3c)">
            <path d="M155 175 C155 165 160 160 170 160 C180 160 185 165 185 175 V205 H155 Z" opacity="0.85" />
            <path d="M535 160 C535 145 545 135 560 135 C575 135 585 145 585 160 V205 H535 Z" opacity="0.9" />
            <path d="M615 160 C615 145 625 135 640 135 C655 135 665 145 665 160 V205 H615 Z" opacity="0.9" />
            <path d="M575 80 C575 70 585 62 600 62 C615 62 625 70 625 80 V105 H575 Z" opacity="0.95" />
            <path d="M1015 175 C1015 165 1020 160 1030 160 C1040 160 1045 165 1045 175 V205 H1015 Z" opacity="0.85" />
          </g>
        </svg>
      </div>

      {/* Center Cinematic Content with Plentiful Breathing Space */}
      <div className="relative my-auto flex flex-col items-center max-w-[92vw]">
        {/* Single Main Heading (Clean, Calligraphic, No clutter) */}
        <motion.h1
          className="hero-script-heading my-3"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          Happy Diwali, Radha <span className="inline-heartbeat">❤️</span>
        </motion.h1>

        {/* Short, Poetic Single Subtitle */}
        <motion.p
          className="font-serif italic text-base sm:text-xl text-[#faf4ea]/85 max-w-[34ch] leading-relaxed mt-2"
          style={{ textWrap: 'balance' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.8 }}
        >
          Wishing You a very very Happy Diwalii ...<br />
          Radha.......<span className="text-[#f5e4be] font-medium"></span>.
        </motion.p>

        {/* Clean, Minimal Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3.5 mt-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2 }}
        >
          <button
            onClick={handleEnterUniverse}
            className="btn-primary-luxury text-xs sm:text-sm px-6 py-2.5"
          >
            <Sparkles size={15} /> Enter Our Universe
          </button>

          <button
            onClick={() => setSurpriseOpen(true)}
            className="btn-secondary-luxury text-xs sm:text-sm px-6 py-2.5"
          >
            <Heart size={15} className="text-[#f29bb2]" fill="currentColor" /> A Little Surprise
          </button>
        </motion.div>
      </div>

      {/* Minimal Bottom Cue */}
      <motion.button
        onClick={handleEnterUniverse}
        aria-label="Scroll down"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="text-[#e6c887]/60 hover:text-[#f5e4be] transition mb-1"
      >
        <ChevronDown size={22} className="animate-bounce" />
      </motion.button>

      {/* Surprise Letter Modal */}
      <SurpriseModal isOpen={surpriseOpen} onClose={() => setSurpriseOpen(false)} />
    </section>
  )
}
