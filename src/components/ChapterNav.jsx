import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Sparkles, BookHeart, Stars, Camera, Heart } from 'lucide-react'
import { triggerHaptic } from '../utils/haptics'

const navItems = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'diyas', label: 'Diyas', icon: Sparkles },
  { id: 'story', label: 'Story', icon: BookHeart },
  { id: 'sky', label: 'Sky', icon: Stars },
  { id: 'gallery', label: 'Memories', icon: Camera },
  { id: 'finale', label: 'Forever', icon: Heart },
]

export default function ChapterNav() {
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35
      const sections = navItems.map((item) => document.getElementById(item.id)).filter(Boolean)

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i]
        if (sec.offsetTop <= scrollPos) {
          setActiveSection(sec.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    triggerHaptic(20)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      aria-label="Navigation"
      className="fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-40 -translate-x-1/2 w-max max-w-[96vw] select-none touch-manipulation"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-[#100620]/85 backdrop-blur-[16px] border border-[#e6c887]/30 shadow-[0_8px_30px_rgba(0,0,0,0.65),0_0_15px_rgba(230,200,135,0.12)] overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeSection === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              aria-label={item.label}
              className={`relative flex items-center justify-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3.5 min-w-[38px] sm:min-w-[42px] min-h-[44px] rounded-full text-[11px] font-sans font-medium uppercase tracking-[0.08em] transition-all duration-200 active:scale-90 ${
                isActive ? 'text-[#1a082c] font-semibold' : 'text-[#e6c887]/70 hover:text-[#faf4ea]'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeNavChapter"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f5e4be] to-[#e6c887] shadow-[0_0_14px_rgba(230,200,135,0.55)]"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                />
              )}
              <Icon size={15} className="relative z-10 flex-shrink-0" />
              <span className="relative z-10 hidden sm:inline">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
