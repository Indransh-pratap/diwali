import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Heart, Sparkles } from 'lucide-react'
import { photos } from '../data'
import { triggerHaptic } from '../utils/haptics'

export default function Gallery({ selectedIdx, onSelectIdx }) {
  const [activePhoto, setActivePhoto] = useState(null)
  const [likedPhotos, setLikedPhotos] = useState({})
  const [floatingHearts, setFloatingHearts] = useState([])

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const lastTapRef = useRef(0)

  useEffect(() => {
    if (selectedIdx !== undefined && selectedIdx !== null) {
      setActivePhoto(selectedIdx)
    }
  }, [selectedIdx])

  const handleNext = () => {
    triggerHaptic(20)
    setActivePhoto((prev) => (prev + 1) % photos.length)
  }

  const handlePrev = () => {
    triggerHaptic(20)
    setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const handleClose = () => {
    triggerHaptic(15)
    setActivePhoto(null)
    if (onSelectIdx) onSelectIdx(null)
  }

  useEffect(() => {
    if (activePhoto === null) return
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose()
      else if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activePhoto])

  // Mobile Touch Swipe Handlers for Fullscreen Viewer
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }
  }

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current

    // Horizontal swipe (left = next, right = prev)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
    // Vertical swipe down to close
    else if (deltaY > 70 && Math.abs(deltaY) > Math.abs(deltaX)) {
      handleClose()
    }
  }

  // Interactive Double-Tap to Like on Polaroid
  const handlePolaroidClick = (idx, e) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected! Like the photo
      triggerHaptic([30, 50, 40])
      setLikedPhotos((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }))

      const heartId = Date.now()
      const rect = e.currentTarget.getBoundingClientRect()
      setFloatingHearts((prev) => [
        ...prev,
        {
          id: heartId,
          x: e.clientX ? e.clientX - rect.left : rect.width / 2,
          y: e.clientY ? e.clientY - rect.top : rect.height / 2
        }
      ])

      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId))
      }, 1000)

      window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 6 } }))
    } else {
      // Single tap opens lightbox
      setActivePhoto(idx)
    }

    lastTapRef.current = now
  }

  const tilts = [-2, 2, -1.5, 2, -2, 1.5]

  return (
    <section id="gallery" className="relative w-full py-20 sm:py-28 px-3 sm:px-4 overflow-hidden z-10">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Main Heading */}
        <motion.h2
          className="font-script gold-text-luxury text-4xl sm:text-6xl md:text-7xl mb-2 text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Our Memories
        </motion.h2>

        {/* Mobile Interactive Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs sm:text-sm font-sans text-[#f5e4be]/80 mb-10 text-center flex items-center justify-center gap-1.5"
        >
          <Sparkles size={14} className="text-[#e6c887]" />
          <span>Tap to expand, or double-tap with love ❤️</span>
        </motion.p>

        {/* Clean Polaroid Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 w-full justify-items-center">
          {photos.map((p, idx) => {
            const likes = likedPhotos[idx] || 0

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                whileHover={{ rotate: 0, scale: 1.03, y: -6 }}
                className="polaroid-card group relative cursor-pointer bg-[#fff8ef] p-3 pb-5 rounded shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-all duration-300 w-full max-w-[280px] touch-manipulation select-none"
                style={{ transform: `rotate(${tilts[idx % tilts.length]}deg)` }}
                onClick={(e) => handlePolaroidClick(idx, e)}
              >
                {/* Floating Heart Burst on Double Tap */}
                {floatingHearts.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 1, scale: 0.6, y: 0 }}
                    animate={{ opacity: 0, scale: 2.2, y: -80 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="absolute pointer-events-none z-30 text-[#f29bb2]"
                    style={{ left: h.x, top: h.y }}
                  >
                    <Heart size={38} fill="#f29bb2" className="drop-shadow-[0_0_12px_rgba(242,155,178,0.9)]" />
                  </motion.div>
                ))}

                <div className="relative aspect-square w-full bg-[#180728] rounded overflow-hidden flex flex-col items-center justify-center text-[#e6c887]">
                  <img
                    src={p.src}
                    alt={p.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                    onError={(e) => {
                      const img = e.currentTarget
                      if (!img.dataset.triedFallback) {
                        img.dataset.triedFallback = 'true'
                        if (img.src.endsWith('.jpeg')) {
                          img.src = img.src.replace(/\.jpeg$/, '.jpg')
                          return
                        } else if (img.src.endsWith('.jpg')) {
                          img.src = img.src.replace(/\.jpg$/, '.jpeg')
                          return
                        }
                      }
                      img.style.display = 'none'
                      if (img.nextElementSibling) {
                        img.nextElementSibling.style.display = 'flex'
                      }
                    }}
                  />

                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#300f37] to-[#120520]"
                    style={{ display: 'none' }}
                  >
                    <ImageIcon size={32} className="text-[#e6c887]/70 mb-2" />
                    <p className="font-script text-2xl text-[#f5e4be]">{p.caption}</p>
                  </div>

                  {/* Liked Heart Indicator */}
                  {likes > 0 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-[#120726]/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#f29bb2]/40 text-[#f29bb2] text-[11px] font-sans font-medium">
                      <Heart size={12} fill="currentColor" />
                      <span>{likes}</span>
                    </div>
                  )}
                </div>

                <p className="font-script text-2xl text-[#3b1b28] text-center mt-3">
                  {p.caption}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Touch-Friendly Swipe Lightbox Viewer */}
      <AnimatePresence>
        {activePhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-8 bg-[#080414]/94 backdrop-blur-xl touch-manipulation select-none"
          >
            {/* Top Bar with Counter and Close */}
            <div className="absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] inset-x-4 flex items-center justify-between z-50 max-w-xl mx-auto pointer-events-none">
              <span className="text-xs uppercase tracking-[0.2em] text-[#e6c887]/80 bg-[#140726]/80 px-3 py-1 rounded-full border border-[#e6c887]/25 backdrop-blur-md pointer-events-auto">
                {activePhoto + 1} / {photos.length}
              </span>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="w-11 h-11 rounded-full border border-[#e6c887]/30 flex items-center justify-center text-[#e6c887] bg-[#140726]/80 hover:bg-[#e6c887]/15 active:scale-90 transition pointer-events-auto"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-[#e6c887]/35 flex items-center justify-center text-[#e6c887] bg-[#140726]/80 hover:bg-[#e6c887]/20 active:scale-90 transition z-50 shadow-lg"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              aria-label="Next photo"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-[#e6c887]/35 flex items-center justify-center text-[#e6c887] bg-[#140726]/80 hover:bg-[#e6c887]/20 active:scale-90 transition z-50 shadow-lg"
            >
              <ChevronRight size={22} />
            </button>

            {/* Photo Card with Swipe Support */}
            <motion.div
              key={activePhoto}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full flex flex-col items-center text-center p-3 sm:p-5 rounded-3xl bg-[#140726]/95 border border-[#e6c887]/35 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(230,200,135,0.18)]"
            >
              <div className="relative w-full max-h-[58vh] rounded-2xl overflow-hidden bg-[#180728] flex items-center justify-center">
                <img
                  src={photos[activePhoto].src}
                  alt={photos[activePhoto].caption}
                  className="max-h-[58vh] w-auto max-w-full object-contain select-none"
                  onError={(e) => {
                    const img = e.currentTarget
                    if (!img.dataset.triedFallback) {
                      img.dataset.triedFallback = 'true'
                      if (img.src.endsWith('.jpeg')) {
                        img.src = img.src.replace(/\.jpeg$/, '.jpg')
                        return
                      } else if (img.src.endsWith('.jpg')) {
                        img.src = img.src.replace(/\.jpg$/, '.jpeg')
                        return
                      }
                    }
                    img.style.display = 'none'
                    if (img.nextElementSibling) {
                      img.nextElementSibling.style.display = 'flex'
                    }
                  }}
                />
                <div
                  className="w-full h-64 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#300f37] to-[#120520]"
                  style={{ display: 'none' }}
                >
                  <p className="font-script text-3xl text-[#f5e4be]">{photos[activePhoto].caption}</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-script gold-text-luxury text-3xl sm:text-4xl">
                  {photos[activePhoto].caption}
                </p>
                {photos[activePhoto].note && (
                  <p className="font-serif italic text-xs sm:text-sm text-[#faf4ea]/80 mt-1 max-w-[32ch] mx-auto">
                    {photos[activePhoto].note}
                  </p>
                )}
              </div>

              {/* Mobile Swipe Hint */}
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#e6c887]/50 mt-3 sm:hidden">
                Swipe left / right to browse • swipe down to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
