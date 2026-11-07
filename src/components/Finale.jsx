import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Heart, ArrowUp } from 'lucide-react'
import Fireworks from './Fireworks'
import { triggerHaptic } from '../utils/haptics'

export default function Finale() {
  const [tapCount, setTapCount] = useState(0)
  const [floatingHearts, setFloatingHearts] = useState([])
  const [isBeating, setIsBeating] = useState(false)

  const sweetLoveMessages = [
    'Tap the heart to send love ❤️',
    'Forever your favourite light ✨',
    'My heart beats for you, Radha 🪔',
    'You are the magic in my ordinary days 🌸',
    'Happy Diwali, meri jaan ❤️',
    'A million wishes, all for your smile ✨'
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 20 } }))
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const handleHeartTap = (e) => {
    triggerHaptic([40, 60, 40])
    setIsBeating(true)
    setTimeout(() => setIsBeating(false), 500)

    setTapCount((prev) => prev + 1)
    window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 8 } }))

    const heartId = Date.now()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2

    setFloatingHearts((prev) => [...prev.slice(-15), { id: heartId, x, y }])
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId))
    }, 1200)
  }

  const handleCelebrateMore = () => {
    triggerHaptic(50)
    window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 20 } }))
  }

  const handleReplay = () => {
    triggerHaptic(20)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section id="finale" className="relative w-full min-h-screen py-24 sm:py-32 px-4 sm:px-6 flex flex-col items-center justify-center text-center overflow-hidden z-10">
      {/* Decorative Fireworks on the sides */}
      <Fireworks rate={2000} className="z-0 opacity-55 pointer-events-none" />

      <div className="relative max-w-2xl w-full mx-auto flex flex-col items-center z-10 px-2 sm:px-4">
        {/* ====================================================================
            1. PROMINENT CENTER HEART ANIMATION
            ==================================================================== */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative my-2 sm:my-4 cursor-pointer select-none touch-manipulation flex flex-col items-center"
          onClick={handleHeartTap}
        >
          {/* Floating Hearts Array */}
          {floatingHearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, scale: 0.6, y: 0 }}
              animate={{ opacity: 0, scale: 2.2, y: -120 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute pointer-events-none z-30 text-[#f29bb2]"
              style={{ left: h.x, top: h.y }}
            >
              <Heart size={40} fill="#f29bb2" className="drop-shadow-[0_0_15px_rgba(242,155,178,0.95)]" />
            </motion.div>
          ))}

          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-[#f29bb2]/20 blur-3xl animate-pulse pointer-events-none" />

          {/* Scaled Heart Vector */}
          <motion.div
            animate={{ scale: isBeating ? [1, 1.18, 0.98, 1.12, 1] : 1 }}
            transition={{ duration: 0.45 }}
            className="relative w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 flex items-center justify-center text-[#f5e4be] drop-shadow-[0_0_30px_rgba(245,228,190,0.8)]"
          >
            <Heart
              className="w-full h-full text-[#f29bb2] fill-[#f29bb2]/25 stroke-[#e6c887] stroke-[1.5] transition-colors group-hover:fill-[#f29bb2]/40"
            />
            <span className="absolute inset-0 flex items-center justify-center font-script text-3xl xs:text-4xl sm:text-5xl text-[#fff8ef] drop-shadow-[0_0_12px_rgba(242,155,178,0.85)]">
              Radha
            </span>
          </motion.div>
        </motion.div>

        {/* ====================================================================
            2. INTERACTIVE LOVE COUNTER (Spaced comfortably below heart)
            ==================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 mb-5 sm:mb-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#140726]/85 border border-[#f29bb2]/40 text-xs sm:text-sm text-[#f29bb2] shadow-[0_0_15px_rgba(242,155,178,0.2)]">
            <Heart size={13} fill="currentColor" className="animate-pulse" />
            <span>{sweetLoveMessages[tapCount % sweetLoveMessages.length]}</span>
            {tapCount > 0 && <span className="font-semibold ml-1 font-mono">({tapCount})</span>}
          </div>
        </motion.div>

        {/* ====================================================================
            3. ROMANTIC QUOTE (Sufficient vertical spacing)
            ==================================================================== */}
        <motion.p
          className="font-serif italic text-base sm:text-xl md:text-2xl text-[#faf4ea]/90 leading-relaxed my-4 sm:my-6 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          “Among a million lights,<br />
          you’ll always be my favourite one.”
        </motion.p>

        {/* ====================================================================
            4. MAIN DIWALI HEADING (Prominent, large, no overlap)
            ==================================================================== */}
        <motion.div
          className="my-4 sm:my-6 w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.9 }}
        >
          <h2 className="font-script gold-text-luxury text-4xl xs:text-5xl sm:text-6xl md:text-7xl leading-tight sm:leading-snug">
            Happy Diwali, Radha.
          </h2>
        </motion.div>

        {/* ====================================================================
            5. DEDICATED WISH / MESSAGE CARD (Positioned below heading with ample space)
            ==================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="relative w-full max-w-xl mx-auto my-6 sm:my-8 p-6 sm:p-8 rounded-3xl bg-[#140726]/85 backdrop-blur-2xl border border-[#e6c887]/35 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(230,200,135,0.18)] text-center"
        >
          {/* Card Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f29bb2]/15 border border-[#f29bb2]/30 text-[#f29bb2] text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold mb-3">
            <Sparkles size={12} className="text-[#e6c887]" /> A Diwali Wish For You
          </span>

          {/* Heartfelt Wish Message */}
          <p className="font-serif italic text-base sm:text-xl text-[#faf4ea] leading-relaxed my-2 px-1">
            May every happiness find its way to you, Radha. May this festival of lights fill your life with eternal warmth, peace, laughter, and endless smiles. ❤️
          </p>

          <p className="font-script text-xl sm:text-2xl text-[#e6c887] mt-3">
            Forever and always in my heart 🪔
          </p>
        </motion.div>

        {/* ====================================================================
            6. ACTION BUTTONS (Positioned below wish card, stacking vertically on mobile)
            ==================================================================== */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-6 sm:mt-8 w-full sm:w-auto px-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <button
            onClick={handleCelebrateMore}
            className="btn-primary-luxury text-xs sm:text-sm px-7 py-3 min-h-[46px] w-full sm:w-auto touch-manipulation active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> Light Fireworks ✨
          </button>
          <button
            onClick={handleReplay}
            className="btn-secondary-luxury text-xs sm:text-sm px-7 py-3 min-h-[46px] w-full sm:w-auto touch-manipulation active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowUp size={16} /> Watch Again
          </button>
        </motion.div>
      </div>
    </section>
  )
}
