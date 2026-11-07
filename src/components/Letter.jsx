import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { letter } from '../data'
export default function Letter() {
  const [open, setOpen] = useState(false)
  return (
    <section className="section">
      <h2 className="font-script gold-text text-5xl sm:text-7xl mb-10">A Letter for You 💌</h2>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Close the letter' : 'Open the letter'} className="relative w-[18rem] h-44 sm:w-[24rem] sm:h-56 [perspective:900px]">
        <div className="absolute inset-0 rounded-md bg-gradient-to-br from-[#e8a0b4] to-[#c9677f] shadow-[0_15px_50px_rgba(0,0,0,.6)]" />
        <motion.div className="absolute inset-x-0 top-0 h-1/2 origin-top rounded-t-md bg-gradient-to-b from-[#f4b6c7] to-[#d97d96]" style={{ clipPath: 'polygon(0 0,100% 0,50% 100%)', transformStyle: 'preserve-3d' }} animate={{ rotateX: open ? 180 : 0, zIndex: open ? 0 : 3 }} transition={{ duration: .8 }} />
        <div className="absolute inset-0 rounded-md" style={{ clipPath: 'polygon(0 100%,50% 40%,100% 100%)', background: 'linear-gradient(#d97d96,#b95770)' }} />
        <motion.div className="absolute left-1/2 top-1/2 z-[4] -translate-x-1/2 -translate-y-1/2 text-gold" animate={{ scale: open ? 0 : [1, 1.2, 1] }} transition={open ? {} : { repeat: Infinity, duration: 1.6 }}><Heart fill="currentColor" size={34} /></motion.div>
      </button>
      {!open && <p className="mt-6 text-gold/70 text-sm">Tap the envelope to open</p>}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 60, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 1 }}
            className="mt-8 max-w-xl rounded-md bg-[#fff6e6] px-6 py-8 sm:px-12 sm:py-12 text-left text-[#4a2a1a] shadow-[0_0_60px_rgba(245,193,93,.35)]">
            {letter.map((l, n) => (
              <motion.p key={n} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .6 + n * .7 }} className={`${n === 0 || n === letter.length - 1 ? 'font-script text-3xl sm:text-4xl' : 'font-serif text-xl sm:text-2xl'} mb-4 leading-relaxed`}>{l}</motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
