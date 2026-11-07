import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import Letter from './Letter'
import MagicMoments from './MagicMoments'

const promises = ['I will celebrate your little wins.', 'I will save the soft moments too.', 'I will remind you how loved you are.', 'I will always wish for your happiness.']
export default function WishesPage() {
  const [active, setActive] = useState(null)
  return <main className="pt-16"><section className="section min-h-[70svh]"><p className="text-[10px] uppercase tracking-[.4em] text-gold/65">Four things I want you to know</p><h1 className="mt-5 font-script gold-text text-6xl sm:text-8xl">Made of wishes</h1><div className="mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">{promises.map((p, i) => <motion.button key={p} onClick={() => setActive(i)} whileHover={{ y: -7 }} className={`min-h-36 rounded-3xl border p-6 text-left transition ${active === i ? 'border-gold bg-gold/15' : 'border-white/10 bg-white/5'}`}><Heart className="mb-3 text-blush" fill="currentColor" size={19} /><p className="font-serif text-2xl italic text-[#fff1d6]">{p}</p>{active === i && <p className="mt-3 text-xs uppercase tracking-[.2em] text-gold">Always.</p>}</motion.button>)}</div><button onClick={() => window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 10 } }))} className="btn mt-9"><Sparkles size={18} />Seal this promise in the sky</button></section><Letter /><MagicMoments /></main>
}
