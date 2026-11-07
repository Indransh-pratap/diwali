import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react'
import Gallery from './Gallery'

const chapters = [
  { label: 'Chapter 01', title: 'The beginning', body: 'Every beautiful story has a first little moment. Put yours here — the day, the place, the detail you will never forget.', tone: 'from-[#3d1a59] to-[#16102d]' },
  { label: 'Chapter 02', title: 'The smiles', body: 'The silly laughs, late replies, tiny conversations and everything that somehow became precious.', tone: 'from-[#642347] to-[#28122d]' },
  { label: 'Chapter 03', title: 'Us, always', body: 'Not a perfect story. A real one — and my favourite one, because it has you in every page.', tone: 'from-[#5a3c21] to-[#1e1427]' },
]
export default function StoryPage() {
  const [current, setCurrent] = useState(0)
  const next = (n) => setCurrent((current + n + chapters.length) % chapters.length)
  const c = chapters[current]
  return <main className="pt-16"><section className="section min-h-[70svh] overflow-hidden">
    <p className="text-[10px] uppercase tracking-[.4em] text-gold/65">Our very own little book</p>
    <div className="mt-7 grid max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#1a0c2b]/60 shadow-[0_25px_100px_rgba(0,0,0,.45)] md:grid-cols-2">
      <div className="p-7 text-left sm:p-12"><p className="text-xs tracking-[.3em] text-blush">{c.label}</p><AnimatePresence mode="wait"><motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><h1 className="mt-6 font-script gold-text text-6xl sm:text-8xl">{c.title}</h1><p className="mt-7 max-w-md font-serif text-2xl italic leading-relaxed text-[#fff1d6]">{c.body}</p></motion.div></AnimatePresence><div className="mt-10 flex gap-3"><button onClick={() => next(-1)} className="rounded-full border border-gold/40 p-3 text-gold"><ArrowLeft /></button><button onClick={() => next(1)} className="btn p-3"><ArrowRight /></button></div></div>
      <div className={`relative min-h-72 bg-gradient-to-br ${c.tone} p-8`}><motion.div key={current} initial={{ rotate: -9, opacity: 0 }} animate={{ rotate: 5, opacity: 1 }} className="absolute inset-10 grid place-items-center border border-gold/30 bg-black/10"><Heart size={110} fill="#f5c15d" className="text-gold opacity-80 drop-shadow-[0_0_30px_rgba(245,193,93,.75)]" /></motion.div><p className="absolute bottom-7 left-0 right-0 text-center font-script text-4xl text-gold/80">You + me</p></div>
    </div>
  </section><Gallery /></main>
}
