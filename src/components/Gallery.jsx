import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { photos } from '../data'

export default function Gallery({ selectedIdx, onSelectIdx }) {
  const [activePhoto, setActivePhoto] = useState(null)

  useEffect(() => {
    if (selectedIdx !== undefined && selectedIdx !== null) {
      setActivePhoto(selectedIdx)
    }
  }, [selectedIdx])

  const handleNext = () => setActivePhoto((prev) => (prev + 1) % photos.length)
  const handlePrev = () => setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length)

  useEffect(() => {
    if (activePhoto === null) return
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setActivePhoto(null)
        if (onSelectIdx) onSelectIdx(null)
      } else if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activePhoto])

  const tilts = [-2, 2, -1.5, 2, -2, 1.5]

  return (
    <section id="gallery" className="relative w-full py-28 px-4 overflow-hidden z-10">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Single Main Heading */}
        <motion.h2
          className="font-script gold-text-luxury text-5xl sm:text-7xl mb-14 text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Our Memories
        </motion.h2>

        {/* Clean Polaroid Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 w-full">
          {photos.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              whileHover={{ rotate: 0, scale: 1.03, y: -6 }}
              className="polaroid-card group relative cursor-pointer bg-[#fff8ef] p-3 pb-5 rounded shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-all duration-300"
              style={{ transform: `rotate(${tilts[idx % tilts.length]}deg)` }}
              onClick={() => setActivePhoto(idx)}
            >
              <div className="relative aspect-square w-full bg-[#180728] rounded overflow-hidden flex flex-col items-center justify-center text-[#e6c887]">
                <img
                  src={p.src}
                  alt={p.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
              </div>

              <p className="font-script text-2xl text-[#3b1b28] text-center mt-3">
                {p.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Clean Lightbox Viewer */}
      <AnimatePresence>
        {activePhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setActivePhoto(null)
              if (onSelectIdx) onSelectIdx(null)
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#080414]/92 backdrop-blur-lg"
          >
            <button
              onClick={() => {
                setActivePhoto(null)
                if (onSelectIdx) onSelectIdx(null)
              }}
              aria-label="Close"
              className="absolute top-5 right-5 w-10 h-10 rounded-full border border-[#e6c887]/30 flex items-center justify-center text-[#e6c887] hover:bg-[#e6c887]/15 transition z-50"
            >
              <X size={20} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              aria-label="Previous"
              className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#e6c887]/30 flex items-center justify-center text-[#e6c887] hover:bg-[#e6c887]/15 transition z-50"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              aria-label="Next"
              className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#e6c887]/30 flex items-center justify-center text-[#e6c887] hover:bg-[#e6c887]/15 transition z-50"
            >
              <ChevronRight size={22} />
            </button>

            <motion.div
              key={activePhoto}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full flex flex-col items-center text-center p-4 rounded-3xl bg-[#140726]/90 border border-[#e6c887]/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
            >
              <div className="relative w-full max-h-[60vh] rounded-2xl overflow-hidden bg-[#180728] flex items-center justify-center">
                <img
                  src={photos[activePhoto].src}
                  alt={photos[activePhoto].caption}
                  className="max-h-[60vh] w-auto max-w-full object-contain"
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

              <p className="font-script gold-text-luxury text-3xl sm:text-4xl mt-3">
                {photos[activePhoto].caption}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
