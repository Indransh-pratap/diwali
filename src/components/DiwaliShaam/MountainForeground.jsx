import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, Coffee } from 'lucide-react'

export default function MountainForeground({
  handsHeld = { indransh: false, radha: false },
  isChaiShared = false,
  heartEvent = null,
  onCharacterClick = null
}) {
  const [headTurn, setHeadTurn] = useState(false)
  const [shoulderLean, setShoulderLean] = useState(false)

  // Periodic subtle romantic idle behaviors
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly turn heads toward each other
      if (Math.random() < 0.45) {
        setHeadTurn(true)
        setTimeout(() => setHeadTurn(false), 3800)
      }
      // Randomly lean closer / rest head on shoulder
      if (Math.random() < 0.3) {
        setShoulderLean(true)
        setTimeout(() => setShoulderLean(false), 5000)
      }
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  const areBothHoldingHands = handsHeld.indransh && handsHeld.radha

  return (
    <div className="absolute inset-x-0 bottom-0 h-[280px] sm:h-[340px] md:h-[380px] pointer-events-none select-none z-10 overflow-hidden flex flex-col justify-end">
      {/* 1. Fireflies (Jugnu) drifting across the grass */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [(i * 65) % 360, ((i * 65) % 360) + (i % 2 === 0 ? 40 : -40), (i * 65) % 360],
              y: [20 + (i * 22) % 180, 40 + (i * 22) % 180, 20 + (i * 22) % 180],
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.3, 0.8]
            }}
            transition={{
              repeat: Infinity,
              duration: 4.5 + (i % 3) * 1.5,
              ease: 'easeInOut'
            }}
            className="absolute w-2 h-2 rounded-full bg-[#adff2f] shadow-[0_0_12px_#adff2f]"
            style={{
              left: `${(i * 9) + 4}%`,
              bottom: `${(i * 6) + 10}%`
            }}
          />
        ))}
      </div>

      {/* 2. Floating Heart Effect (when Send Heart is clicked) */}
      <AnimatePresence>
        {heartEvent && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0, y: 0, x: heartEvent.senderRole === 'indransh' ? -60 : 60 }}
            animate={{
              scale: [0.8, 1.4, 1.2],
              opacity: [0.8, 1, 0],
              y: -140,
              x: heartEvent.senderRole === 'indransh' ? 50 : -50
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute left-1/2 bottom-36 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"
          >
            <div className="p-3 rounded-full bg-gradient-to-tr from-[#ff1493] via-[#ff69b4] to-[#ffd700] text-white shadow-[0_0_30px_#ff1493]">
              <Heart size={32} fill="currentColor" />
            </div>
            <span className="text-[11px] font-script gold-text-luxury mt-1 drop-shadow">
              {heartEvent.senderName} sent love ❤️
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Mountain Hill Base SVG with Soft Green Grass & Wildflowers */}
      <div className="relative w-full flex flex-col items-center">
        <svg
          viewBox="0 0 1200 240"
          preserveAspectRatio="none"
          className="w-full h-44 sm:h-56 md:h-64 drop-shadow-[0_-15px_35px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#245437" />
              <stop offset="35%" stopColor="#1a3f29" />
              <stop offset="75%" stopColor="#132e1e" />
              <stop offset="100%" stopColor="#0b1b11" />
            </linearGradient>

            <linearGradient id="blanketGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7a1a38" />
              <stop offset="50%" stopColor="#942245" />
              <stop offset="100%" stopColor="#7a1a38" />
            </linearGradient>
          </defs>

          {/* Hill Curved Crest */}
          <path
            d="M0 120 Q 300 70, 600 85 T 1200 95 L 1200 240 L 0 240 Z"
            fill="url(#hillGrad)"
          />

          {/* Foreground Grass Blades & Flowers Layer */}
          <path
            d="M100 110 Q 105 90, 110 112 M115 112 Q 122 88, 126 114 M180 105 Q 185 85, 190 107 M240 100 Q 248 80, 252 103 M800 102 Q 806 82, 810 104 M880 105 Q 888 84, 894 107 M1020 112 Q 1025 90, 1030 114"
            stroke="#34784e"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Wildflowers */}
          <circle cx="120" cy="88" r="3.5" fill="#ffd700" />
          <circle cx="186" cy="85" r="3.5" fill="#f29bb2" />
          <circle cx="808" cy="82" r="3.5" fill="#ffd700" />
          <circle cx="890" cy="84" r="3.5" fill="#f29bb2" />

          {/* Cozy Ethnic Picnic Blanket at Hill Top */}
          <ellipse
            cx="600"
            cy="118"
            rx="195"
            ry="38"
            fill="url(#blanketGrad)"
            stroke="#ffd700"
            strokeWidth="2.5"
            strokeDasharray="6 3"
          />
        </svg>

        {/* 4. The Cozy Blanket Props: Clay Diyas & Steaming Chai */}
        <div className="absolute bottom-10 inset-x-0 flex justify-center pointer-events-auto">
          <div className="relative w-80 sm:w-96 flex items-center justify-between px-6">
            {/* Left Clay Diya (Warm Golden Halos) */}
            <div className="relative flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#ffd700]/30 blur-[6px] absolute -top-3 animate-pulse" />
              <div className="w-2.5 h-4 rounded-full bg-gradient-to-t from-[#ff4d00] via-[#ffd700] to-white shadow-[0_0_12px_#ffd700] animate-bounce" />
              <div className="w-7 h-3 rounded-full bg-[#994714] border border-[#d97706]/60 shadow-md" />
            </div>

            {/* Steaming Chai Cups on Wooden Tray */}
            <div className="relative flex items-center gap-3 bg-[#3f2117]/85 px-3 py-1 rounded-xl border border-[#d4af37]/40 shadow-lg">
              {/* Chai Cup 1 (Indransh) */}
              <motion.div
                animate={isChaiShared ? { y: [-4, 0], scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.6 }}
                className="relative flex flex-col items-center"
              >
                {/* Steam wisps */}
                <motion.div
                  animate={{ y: [-2, -12], opacity: [0.7, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                  className="w-1.5 h-3 rounded-full bg-white/40 blur-[1px] -top-2 absolute"
                />
                <div className="w-4 h-5 rounded-b-md bg-[#c27847] border border-[#f5e4be]/50 shadow-inner flex items-center justify-center">
                  <div className="w-2.5 h-1 rounded-full bg-[#78350f]" />
                </div>
              </motion.div>

              {/* Chai Cup 2 (Radha) */}
              <motion.div
                animate={isChaiShared ? { y: [-4, 0], scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.6 }}
                className="relative flex flex-col items-center"
              >
                {/* Steam wisps */}
                <motion.div
                  animate={{ y: [-2, -12], opacity: [0.7, 0] }}
                  transition={{ repeat: Infinity, duration: 2.1, ease: 'easeOut', delay: 0.4 }}
                  className="w-1.5 h-3 rounded-full bg-white/40 blur-[1px] -top-2 absolute"
                />
                <div className="w-4 h-5 rounded-b-md bg-[#c27847] border border-[#f5e4be]/50 shadow-inner flex items-center justify-center">
                  <div className="w-2.5 h-1 rounded-full bg-[#78350f]" />
                </div>
              </motion.div>
            </div>

            {/* Right Clay Diya */}
            <div className="relative flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#ffd700]/30 blur-[6px] absolute -top-3 animate-pulse" />
              <div className="w-2.5 h-4 rounded-full bg-gradient-to-t from-[#ff4d00] via-[#ffd700] to-white shadow-[0_0_12px_#ffd700] animate-bounce" />
              <div className="w-7 h-3 rounded-full bg-[#994714] border border-[#d97706]/60 shadow-md" />
            </div>
          </div>
        </div>

        {/* 5. THE COUPLE (Indransh & Radha Sitting Side by Side) */}
        <div className="absolute bottom-14 inset-x-0 flex justify-center pointer-events-auto">
          <div className="relative flex items-end justify-center gap-1 sm:gap-2">
            {/* INDRANSH (Left Player) */}
            <motion.div
              animate={
                shoulderLean
                  ? { rotate: 3, x: 5 }
                  : { y: [0, -2.5, 0] }
              }
              transition={{ repeat: shoulderLean ? 0 : Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="relative flex flex-col items-center select-none"
            >
              {/* Photo Avatar Head (Authentic photo crop) */}
              <div className="relative z-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-[#d4af37] via-[#f5e4be] to-[#ff9a3c] shadow-[0_0_20px_rgba(230,200,135,0.65)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#18082c] border border-[#120726]">
                    <motion.img
                      animate={headTurn ? { rotate: 8, scale: 1.05 } : { rotate: 0, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      src="/assets/photos/indransh_avatar_facing_right.png"
                      alt="Indransh"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>

              {/* Seated 2D Body (Pink Shirt & White Trousers - matching photo) */}
              <div className="relative -mt-2 z-10 flex flex-col items-center">
                <svg width="64" height="74" viewBox="0 0 64 74" fill="none">
                  {/* Pink Shirt Upper Torso & Back */}
                  <path
                    d="M12 6 C 20 2, 44 2, 52 6 L 56 34 C 52 38, 44 38, 38 38 L 26 38 C 20 38, 12 38, 8 34 Z"
                    fill="url(#indShirtGrad)"
                  />
                  {/* Collar */}
                  <path d="M24 6 L 32 16 L 40 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

                  {/* Sitting Folded Legs (White Trousers draped toward hill edge) */}
                  <path
                    d="M10 36 C 8 48, 14 66, 26 68 C 34 68, 36 56, 38 46 L 46 64 C 50 68, 56 66, 54 52 L 52 36 Z"
                    fill="url(#indTrouserGrad)"
                  />
                  {/* Feet resting naturally at edge */}
                  <ellipse cx="26" cy="69" rx="7" ry="3.5" fill="#fdfbf7" />
                  <ellipse cx="50" cy="67" rx="7" ry="3.5" fill="#fdfbf7" />

                  <defs>
                    <linearGradient id="indShirtGrad" x1="12" y1="6" x2="52" y2="38" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f8bbd0" />
                      <stop offset="0.6" stopColor="#f48fb1" />
                      <stop offset="1" stopColor="#ec407a" />
                    </linearGradient>
                    <linearGradient id="indTrouserGrad" x1="10" y1="36" x2="54" y2="68" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="1" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Character Name Tag */}
              <span className="font-script gold-text-luxury text-sm -mt-1 drop-shadow">Indransh</span>
            </motion.div>

            {/* HAND-HOLDING UNION (Center Glow when both hold hands) */}
            <div className="relative pb-6 z-25 flex flex-col items-center">
              <AnimatePresence>
                {areBothHoldingHands ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.25, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="flex flex-col items-center"
                  >
                    <div className="p-1.5 rounded-full bg-gradient-to-tr from-[#ffd700] via-[#ff4d8d] to-[#ffd700] text-[#120726] shadow-[0_0_20px_#ffd700]">
                      <Heart size={15} fill="currentColor" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-[#ffd700] whitespace-nowrap bg-black/60 px-2 py-0.5 rounded-full border border-[#ffd700]/40 mt-1">
                      Hands Held ❤️
                    </span>
                  </motion.div>
                ) : (
                  <div className="w-4 h-4 opacity-0" />
                )}
              </AnimatePresence>
            </div>

            {/* RADHA (Right Player) */}
            <motion.div
              animate={
                shoulderLean
                  ? { rotate: -4, x: -6 }
                  : { y: [0, -2.5, 0] }
              }
              transition={{ repeat: shoulderLean ? 0 : Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.3 }}
              className="relative flex flex-col items-center select-none"
            >
              {/* Photo Avatar Head (Authentic photo crop) */}
              <div className="relative z-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-[#f29bb2] via-[#ff9a3c] to-[#e06b8b] shadow-[0_0_20px_rgba(242,155,178,0.7)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#18082c] border border-[#120726]">
                    <motion.img
                      animate={headTurn ? { rotate: -8, scale: 1.05 } : { rotate: 0, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      src="/assets/photos/radha_avatar.png"
                      alt="Radha"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>

              {/* Seated 2D Body (Festive Pink Kurta & Flowing Dupatta) */}
              <div className="relative -mt-2 z-10 flex flex-col items-center">
                <svg width="64" height="74" viewBox="0 0 64 74" fill="none">
                  {/* Pink Kurta Upper Body */}
                  <path
                    d="M14 6 C 22 2, 42 2, 50 6 L 54 36 C 48 40, 40 40, 32 40 C 24 40, 16 40, 10 36 Z"
                    fill="url(#radKurtaGrad)"
                  />
                  {/* Golden Embroidery Motifs */}
                  <circle cx="32" cy="14" r="1.5" fill="#ffd700" />
                  <circle cx="32" cy="22" r="1.5" fill="#ffd700" />
                  <circle cx="32" cy="30" r="1.5" fill="#ffd700" />

                  {/* Flowing Pink Festive Dupatta draped on shoulder */}
                  <path
                    d="M14 8 C 10 20, 8 45, 12 62 C 16 66, 22 62, 20 48 C 18 32, 20 18, 18 8 Z"
                    fill="url(#radDupattaGrad)"
                  />

                  {/* Sitting Legs & Flared Hem draped toward hill edge */}
                  <path
                    d="M12 38 C 14 52, 22 66, 34 68 C 44 68, 52 56, 52 42 L 52 38 Z"
                    fill="url(#radKurtaGrad)"
                  />
                  {/* Bare feet resting naturally */}
                  <ellipse cx="34" cy="69" rx="6.5" ry="3.5" fill="#fed7aa" />

                  <defs>
                    <linearGradient id="radKurtaGrad" x1="14" y1="6" x2="50" y2="68" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f43f5e" />
                      <stop offset="0.6" stopColor="#e11d48" />
                      <stop offset="1" stopColor="#9f1239" />
                    </linearGradient>
                    <linearGradient id="radDupattaGrad" x1="14" y1="8" x2="20" y2="62" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#fda4af" />
                      <stop offset="1" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Character Name Tag */}
              <span className="font-script text-[#f29bb2] text-sm -mt-1 drop-shadow">Radha</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
