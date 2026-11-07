import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
export default function Gift() {
  const [open, setOpen] = useState(false)
  const bits = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ id: i, x: (Math.random() - .5) * 700, y: -(Math.random() * 450 + 80), r: Math.random() * 720, heart: i % 3 === 0, c: ['#f5c15d', '#ffe29a', '#ff9fbf', '#ff8a3d'][i % 4], d: Math.random() * .25 })), [])
  return (
    <section className="section overflow-hidden">
      <p className="font-script gold-text text-4xl sm:text-6xl mb-12">There's one more surprise for you...</p>
      <div className="relative">
        {open && bits.map((b) => (
          <motion.span key={b.id} className="absolute left-1/2 top-8 z-10" style={{ color: b.c }} initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }} animate={{ x: b.x, y: [0, b.y, b.y + 520], opacity: [1, 1, 0], rotate: b.r }} transition={{ duration: 2.6, delay: b.d, ease: 'easeOut' }}>
            {b.heart ? <Heart size={18} fill="currentColor" /> : <span className="block h-2.5 w-2.5" style={{ background: b.c }} />}
          </motion.span>
        ))}
        <button onClick={() => setOpen(true)} disabled={open} aria-label="Open the gift" className="relative block h-48 w-48 sm:h-56 sm:w-56 disabled:cursor-default">
          <motion.div className="absolute -inset-6 rounded-full bg-gold/30 blur-3xl" animate={{ opacity: open ? 1 : [.3, .7, .3] }} transition={{ repeat: open ? 0 : Infinity, duration: 2 }} />
          <div className="absolute bottom-0 inset-x-0 h-[68%] rounded-b-lg bg-gradient-to-br from-[#ffd27a] to-[#c98a2b] shadow-[0_0_50px_rgba(245,193,93,.6)]"><div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-[#c2185b]" /></div>
          <motion.div className="absolute top-[18%] -inset-x-2 h-[16%] origin-bottom-left rounded-md bg-gradient-to-br from-[#ffe29a] to-[#d99a3a]" animate={open ? { y: -90, rotate: -28, x: -30 } : { y: [0, -4, 0] }} transition={open ? { duration: .8, type: 'spring' } : { repeat: Infinity, duration: 2 }}>
            <div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-[#c2185b]" />
            <Heart className="absolute -top-5 left-1/2 -translate-x-1/2 text-[#c2185b]" fill="currentColor" size={30} />
          </motion.div>
        </button>
      </div>
      {!open && <p className="mt-10 text-gold/70 text-sm">Tap the gift to open it</p>}
      {open && (
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 1.4 }} className="mt-12 max-w-xl font-serif italic text-2xl sm:text-3xl leading-relaxed text-[#fff1d6]">
          One last thing... I hope every Diwali brings you more happiness than the last. You deserve all the beautiful things in this world. ❤️
        </motion.p>
      )}
    </section>
  )
}
