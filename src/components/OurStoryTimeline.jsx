import { motion } from 'framer-motion'
import { Heart, Image as ImageIcon } from 'lucide-react'
import { storyTimeline, photos } from '../data'

export default function OurStoryTimeline({ onSelectPhoto }) {
  const shortStories = [
    { title: 'Our First Memory', subtitle: 'The day my whole world quietly changed.' },
    { title: 'The Smiles', subtitle: 'The silly late-night talks and laughs that became precious.' },
    { title: 'The Little Things', subtitle: 'The kindness in your eyes and the peace in your presence.' },
    { title: 'Forever Us', subtitle: 'Holding your hand, knowing I am right where I belong.' },
  ]

  const tilts = [-2, 2, -1.5, 2]

  return (
    <section id="story" className="relative w-full py-28 px-4 overflow-hidden z-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Single Main Heading */}
        <motion.h2
          className="font-script gold-text-luxury text-5xl sm:text-7xl mb-16 text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          A Little Story Called Us
        </motion.h2>

        {/* 4 Clean Visual Memory Cards with Minimal Text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 w-full">
          {shortStories.map((item, idx) => {
            const photo = photos[idx] || photos[0]

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => onSelectPhoto && onSelectPhoto(idx)}
                className="group cursor-pointer flex flex-col items-center"
              >
                {/* Polaroid Frame */}
                <div
                  className="bg-[#fff8ef] p-3 pb-5 rounded shadow-[0_15px_40px_rgba(0,0,0,0.65)] transition-transform duration-300 w-full max-w-[280px]"
                  style={{ transform: `rotate(${tilts[idx % tilts.length]}deg)` }}
                >
                  <div className="relative aspect-square w-full bg-[#180728] rounded overflow-hidden flex flex-col items-center justify-center text-[#e6c887]">
                    {photo && photo.src ? (
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}

                    {/* Minimal romantic placeholder */}
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#300f37] to-[#120520]"
                      style={{ display: photo && photo.src ? 'none' : 'flex' }}
                    >
                      <Heart size={28} className="text-[#f29bb2]/70 mb-2" fill="currentColor" />
                      <p className="font-script text-2xl text-[#f5e4be]">{item.title}</p>
                    </div>
                  </div>

                  <p className="font-script text-2xl text-[#3b1b28] text-center mt-3">
                    {photo ? photo.caption : item.title}
                  </p>
                </div>

                {/* Minimal subtitle under card */}
                <p className="font-serif italic text-base sm:text-lg text-[#faf4ea]/80 text-center mt-4 max-w-[26ch]">
                  {item.subtitle}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
