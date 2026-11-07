import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Sparkles } from 'lucide-react'
import { letter } from '../data'
import { triggerHaptic } from '../utils/haptics'

export default function SurpriseModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const handleClose = () => {
    triggerHaptic(15)
    onClose()
  }

  const handleSeal = () => {
    triggerHaptic(50)
    window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 16 } }))
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 touch-manipulation">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-[#080414]/92 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-xl w-full rounded-3xl bg-[#140726]/95 border border-[#e6c887]/40 p-5 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(230,200,135,0.2)] z-10 max-h-[88vh] overflow-y-auto overscroll-contain"
        >
          {/* Close button - thumb friendly */}
          <button
            onClick={handleClose}
            aria-label="Close letter"
            className="absolute top-4 right-4 w-11 h-11 rounded-full border border-[#e6c887]/30 flex items-center justify-center text-[#e6c887] hover:bg-[#e6c887]/15 active:scale-90 transition"
          >
            <X size={18} />
          </button>

          {/* Letter Header */}
          <div className="text-center mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f29bb2]/15 border border-[#f29bb2]/30 text-[#f29bb2] text-[10px] tracking-[0.25em] uppercase font-semibold">
              <Heart size={12} fill="currentColor" /> A Letter From My Heart
            </span>
            <h3 className="font-script gold-text-luxury text-4xl sm:text-5xl mt-3">
              To Meri Radha
            </h3>
          </div>

          {/* Letter Body */}
          <div className="space-y-4 font-serif text-[#faf4ea]/95 text-base sm:text-xl leading-relaxed italic border-y border-[#e6c887]/20 py-5 my-4">
            {letter.map((para, i) => (
              <p
                key={i}
                className={
                  i === 0 || i === letter.length - 1
                    ? 'font-script text-2xl sm:text-3xl text-[#e6c887] not-italic'
                    : ''
                }
              >
                {para}
              </p>
            ))}
          </div>

          {/* Footer Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-2">
            <p className="font-script text-2xl text-[#f29bb2]">Always & Forever yours ❤️</p>
            <button
              onClick={handleSeal}
              className="btn-primary-luxury text-xs sm:text-sm px-6 py-2.5 active:scale-95 w-full sm:w-auto"
            >
              <Sparkles size={16} /> Seal With A Wish
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
