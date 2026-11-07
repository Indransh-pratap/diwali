import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Heart } from 'lucide-react'
import { triggerHaptic } from '../../utils/haptics'

export default function MakeWishModal({
  isOpen,
  onClose,
  onSubmitWish,
  existingWishes = []
}) {
  const [wishText, setWishText] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!wishText.trim()) return
    triggerHaptic(30)
    onSubmitWish(wishText.trim())
    setWishText('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#18082c] via-[#140626] to-[#0c0318] border border-[#e6c887]/40 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#ffd700]/15 border border-[#ffd700]/30 text-[#ffd700] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={12} /> Sacred Sky Lantern
          </div>
          <h3 className="font-script gold-text-luxury text-3xl sm:text-4xl my-1">
            Make A Diwali Wish 🏮✨
          </h3>
          <p className="font-serif italic text-xs sm:text-sm text-[#faf4ea]/85 max-w-sm mx-auto">
            “Write a prayer or secret wish. We will light the flame together and send it into the starlit sky.”
          </p>
        </div>

        {/* Glowing Sky Lantern Preview */}
        <div className="my-3 flex flex-col items-center">
          <div className="relative w-28 h-36 rounded-t-2xl rounded-b-xl bg-gradient-to-b from-[#ff8c00] via-[#ffaa00] to-[#ffd700] p-3 border border-[#fff3b0] shadow-[0_0_35px_rgba(255,165,0,0.7)] flex flex-col items-center justify-between overflow-hidden">
            <div className="w-8 h-1 rounded-full bg-white/60 mb-1" />
            <span className="font-script text-sm text-[#5a1a00] text-center font-bold px-1 line-clamp-3">
              {wishText || 'Your wish glowing within...'}
            </span>
            {/* Glowing Lantern Base Candle Flame */}
            <div className="w-3.5 h-5 rounded-full bg-gradient-to-t from-[#ff4500] via-[#ffff00] to-white shadow-[0_0_15px_#ffff00] animate-bounce" />
          </div>
        </div>

        {/* Wish Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
          <textarea
            rows={3}
            value={wishText}
            onChange={(e) => setWishText(e.target.value)}
            placeholder="Write your heartfelt wish for us... (e.g. May our love stay as warm as this flame, forever.)"
            maxLength={220}
            className="w-full px-4 py-3 rounded-2xl bg-[#120520] border border-[#e6c887]/35 text-xs sm:text-sm text-[#faf4ea] placeholder-[#e6c887]/40 focus:border-[#ffd700] focus:outline-none resize-none"
          />

          <button
            type="submit"
            disabled={!wishText.trim()}
            className={`btn-primary-luxury text-xs sm:text-sm px-6 py-3 w-full justify-center flex items-center gap-2 ${
              !wishText.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Send size={15} /> Release Wish Into The Night Sky 🏮
          </button>
        </form>

        {/* Existing Wishes in this Room */}
        {existingWishes.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#e6c887]/20 flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#e6c887]/80 flex items-center gap-1">
              <Heart size={12} className="text-[#f29bb2]" /> Wishes Floating In Our Sky:
            </span>
            <div className="max-h-36 overflow-y-auto no-scrollbar space-y-2">
              {existingWishes.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-2xl bg-[#120520] border border-[#ffd700]/25 text-xs leading-relaxed"
                >
                  <span className="font-bold text-[#ffd700] block mb-0.5">
                    {w.senderName}:
                  </span>
                  <p className="text-[#faf4ea]/90 font-serif italic">“{w.wishText}”</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
