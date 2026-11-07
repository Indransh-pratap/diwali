import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Heart, Sparkles } from 'lucide-react'

const notes = ['You are my favourite kind of magic.', 'A thousand tiny reasons to smile — starting with this one.', 'My favourite place will always be beside you.', 'You make ordinary days feel like celebrations.', 'You are loved more than these stars can count.']
export default function MagicMoments() {
  const [note, setNote] = useState(null)
  const [found, setFound] = useState([])
  const collect = (i) => setFound((all) => all.includes(i) ? all : [...all, i])
  return <section className="section overflow-hidden">
    <p className="font-script gold-text text-5xl sm:text-7xl">Tiny surprises, just for you</p>
    <div className="relative mt-10 flex flex-wrap justify-center gap-4 max-w-xl">
      {[0, 1, 2, 3, 4].map((i) => <motion.button key={i} onClick={() => collect(i)} aria-label="Collect a glowing heart" whileHover={{ scale: 1.25 }} whileTap={{ scale: .85 }} animate={found.includes(i) ? { opacity: 0, scale: 1.8 } : { y: [0, -10, 0] }} transition={{ repeat: found.includes(i) ? 0 : Infinity, duration: 1.7 + i * .15 }} className="text-blush drop-shadow-[0_0_12px_rgba(255,159,191,.9)]"><Heart fill="currentColor" size={34} /></motion.button>)}
    </div>
    <p className="mt-3 text-xs uppercase tracking-[.28em] text-gold/70">Collect 5 hearts · {found.length}/5</p>
    <AnimatePresence>{found.length === 5 && <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-6 max-w-md font-serif text-2xl italic text-[#fff1d6]">Secret unlocked: you are, and always will be, my favourite person. ❤️</motion.p>}</AnimatePresence>
    <div className="mt-12 flex flex-wrap justify-center gap-4">
      <button onClick={() => setNote(notes[Math.floor(Math.random() * notes.length)])} className="btn"><Sparkles size={17} />A sweet little message</button>
      <button onClick={() => setNote('This gift box contains one promise: I will always cheer for your happiness. ❤️')} className="rounded-full border border-gold/45 px-5 py-3 text-gold transition hover:bg-gold/10"><Gift size={18} className="mr-2 inline" />Mystery gift</button>
    </div>
    <AnimatePresence>{note && <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 font-script text-3xl text-blush">{note}</motion.p>}</AnimatePresence>
  </section>
}
