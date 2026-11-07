import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { quotes } from '../data'
export default function Quotes() {
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false)
  useEffect(() => { if (hold) return; const t = setTimeout(() => setI((v) => (v + 1) % quotes.length), 7000); return () => clearTimeout(t) }, [i, hold])
  const go = (d) => { setHold(true); setI((v) => (v + d + quotes.length) % quotes.length) }
  return (
    <section className="section">
      <h2 className="font-script gold-text text-5xl sm:text-7xl mb-12">Words for You</h2>
      <div className="flex items-center gap-2 sm:gap-6 max-w-4xl w-full">
        <button onClick={() => go(-1)} aria-label="Previous quote" className="text-gold p-2 shrink-0"><ChevronLeft size={32} /></button>
        <div className="min-h-[14rem] flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.blockquote key={i} initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }} transition={{ duration: .9 }}
              className="font-serif italic text-2xl sm:text-4xl leading-relaxed text-[#fff1d6]">“{quotes[i]}”</motion.blockquote>
          </AnimatePresence>
        </div>
        <button onClick={() => go(1)} aria-label="Next quote" className="text-gold p-2 shrink-0"><ChevronRight size={32} /></button>
      </div>
      <div className="mt-10 flex gap-3">
        {quotes.map((_, n) => <button key={n} aria-label={`Quote ${n + 1}`} onClick={() => { setHold(true); setI(n) }} className={`h-2 rounded-full transition-all ${n === i ? 'w-8 bg-gold' : 'w-2 bg-gold/30'}`} />)}
      </div>
    </section>
  )
}
