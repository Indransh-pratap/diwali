import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Heart, ArrowUp } from 'lucide-react'
import Fireworks from './Fireworks'

export default function Finale() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 20 } }))
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const handleCelebrateMore = () => {
    window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 16 } }))
  }

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section id="finale" className="relative w-full min-h-[90vh] py-24 px-4 flex flex-col items-center justify-center text-center overflow-hidden z-10">
      <Fireworks rate={1800} className="z-0 opacity-60 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto flex flex-col items-center z-10 px-4">
        {/* Glowing Heart with Radha */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative my-4"
        >
          <div className="absolute inset-0 rounded-full bg-[#f29bb2]/25 blur-3xl animate-pulse" />

          <div className="relative text-[#f5e4be] drop-shadow-[0_0_30px_rgba(245,228,190,0.8)]">
            <Heart
              size={180}
              className="text-[#f29bb2] fill-[#f29bb2]/20 stroke-[#e6c887] stroke-[1.5]"
            />
            <span className="absolute inset-0 flex items-center justify-center font-script text-4xl text-[#fff8ef] drop-shadow-[0_0_12px_rgba(242,155,178,0.85)]">
              Radha
            </span>
          </div>
        </motion.div>

        {/* Short Poetic Lines */}
        <motion.p
          className="font-serif italic text-xl sm:text-2xl text-[#faf4ea]/90 leading-relaxed mt-6 max-w-md"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          “Among a million lights,<br />
          you’ll always be my favourite one.”
        </motion.p>

        {/* Final Blessing */}
        <motion.div
          className="my-6"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.0, duration: 1.0 }}
        >
          <h2 className="font-script gold-text-luxury text-5xl sm:text-7xl leading-tight">
            Happy Diwali, Radha.
          </h2>
          <p className="font-serif italic text-lg sm:text-xl text-[#f29bb2] mt-1.5">
            May every happiness find its way to you. ❤️
          </p>
        </motion.div>

        {/* Clean Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3.5 mt-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.5, duration: 0.7 }}
        >
          <button onClick={handleCelebrateMore} className="btn-primary-luxury text-xs px-5 py-2.5">
            <Sparkles size={15} /> Light Fireworks ✨
          </button>
          <button onClick={handleReplay} className="btn-secondary-luxury text-xs px-5 py-2.5">
            <ArrowUp size={15} /> Watch Again
          </button>
        </motion.div>
      </div>
    </section>
  )
}
