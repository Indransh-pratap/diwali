import { motion } from 'framer-motion'
import { Sparkles, Shield, Heart } from 'lucide-react'
import { CHARACTERS } from './gameConstants'

export default function CharacterAvatar({
  role = 'indransh',
  isCurrentPlayer = false,
  hp = 100,
  maxHp = 100,
  energy = 100,
  shieldActive = false,
  isAttacking = false,
  isHit = false,
  size = 'md', // 'sm' | 'md' | 'lg' | 'arena'
}) {
  const char = CHARACTERS[role] || CHARACTERS.indransh
  const isIndransh = role === 'indransh'
  const isFacingRight = isIndransh

  // Dimensions based on size prop
  const avatarSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    arena: 'w-20 h-20 sm:w-24 sm:h-24'
  }

  // If size is 'arena', render the full 2D character with photo avatar head!
  if (size === 'arena') {
    return (
      <div className="relative flex flex-col items-center select-none pointer-events-none">
        {/* Overhead HP & Energy mini-bar for arena positioning */}
        <div className="w-24 sm:w-28 flex flex-col items-center mb-1">
          <div className="flex items-center justify-between w-full text-[10px] text-[#f5e4be] font-bold px-1 drop-shadow">
            <span>{char.name}</span>
            <span>{Math.round(hp)}%</span>
          </div>
          {/* Health Bar */}
          <div className="w-full h-2 rounded-full bg-[#120520]/80 border border-[#e6c887]/30 overflow-hidden shadow-inner">
            <motion.div
              className={`h-full ${
                hp > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : hp > 25
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                  : 'bg-gradient-to-r from-red-600 to-rose-400'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, Math.min(100, hp))}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
          {/* Energy Bar */}
          <div className="w-full h-1 rounded-full bg-[#120520]/60 border border-[#f29bb2]/20 overflow-hidden mt-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ffd700] to-[#ff9a3c]"
              animate={{ width: `${Math.max(0, Math.min(100, energy))}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        {/* Shield Bubble if active */}
        {shieldActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85], rotate: 360 }}
            transition={{
              scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
              opacity: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
              rotate: { repeat: Infinity, duration: 8, ease: 'linear' }
            }}
            className={`absolute -inset-4 sm:-inset-6 rounded-full border-2 border-dashed z-30 pointer-events-none ${
              isIndransh
                ? 'border-[#e6c887] shadow-[0_0_35px_rgba(230,200,135,0.7)] bg-[#e6c887]/15'
                : 'border-[#f29bb2] shadow-[0_0_35px_rgba(242,155,178,0.7)] bg-[#f29bb2]/15'
            }`}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#120726] p-1 rounded-full border border-current text-[#f5e4be]">
              <Shield size={14} />
            </div>
          </motion.div>
        )}

        {/* 2D Character Body Container with floating animation */}
        <motion.div
          animate={
            isHit
              ? { x: isIndransh ? [-6, 6, -4, 4, 0] : [6, -6, 4, -4, 0], filter: ['brightness(2)', 'brightness(1)'] }
              : isAttacking
              ? { x: isFacingRight ? 12 : -12, scale: [1, 1.05, 1] }
              : { y: [0, -6, 0] }
          }
          transition={
            isHit
              ? { duration: 0.3 }
              : isAttacking
              ? { duration: 0.25 }
              : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
          }
          className="relative flex flex-col items-center"
        >
          {/* REAL PHOTO AVATAR HEAD */}
          <div className="relative z-20">
            {/* Glowing Golden Ring Frame */}
            <div
              className={`rounded-full p-1 bg-gradient-to-tr transition-all duration-300 ${
                isIndransh
                  ? 'from-[#d4af37] via-[#f5e4be] to-[#ff9a3c] shadow-[0_0_25px_rgba(230,200,135,0.7)]'
                  : 'from-[#f29bb2] via-[#ff9a3c] to-[#e06b8b] shadow-[0_0_25px_rgba(242,155,178,0.75)]'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#18082c] border-2 border-[#120726]">
                <img
                  src={char.avatar}
                  alt={char.name}
                  className="w-full h-full object-cover object-center transform hover:scale-110 transition duration-300"
                />
              </div>
            </div>

            {/* Sparkle badge on head */}
            <motion.div
              animate={{ rotate: 360, scale: [0.85, 1.15, 0.85] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className={`absolute -top-1 ${isFacingRight ? '-right-1' : '-left-1'} p-1 rounded-full text-white shadow-md ${
                isIndransh ? 'bg-[#d4af37]' : 'bg-[#e06b8b]'
              }`}
            >
              <Sparkles size={11} />
            </motion.div>
          </div>

          {/* 2D ANIMATED BODY (Traditional Festive Attire) */}
          <div className="relative -mt-2 z-10 flex flex-col items-center">
            {isIndransh ? (
              /* Indransh Festive Royal Kurta Sherwani */
              <svg width="68" height="72" viewBox="0 0 68 72" fill="none" className="drop-shadow-lg">
                {/* Shoulders & Upper Chest */}
                <path
                  d="M14 8C20 4 48 4 54 8L60 28C56 30 46 26 44 32L46 64H22L24 32C22 26 12 30 8 28L14 8Z"
                  fill="url(#goldSherwaniGrad)"
                />
                {/* Traditional Festive Golden Stole (Dupatta) */}
                <path
                  d="M18 10C22 18 24 36 22 62C24 64 28 64 30 62C28 36 28 18 26 10H18Z"
                  fill="url(#stoleGrad)"
                />
                {/* Golden Buttons */}
                <circle cx="34" cy="18" r="2" fill="#ffd700" />
                <circle cx="34" cy="26" r="2" fill="#ffd700" />
                <circle cx="34" cy="34" r="2" fill="#ffd700" />
                <circle cx="34" cy="42" r="2" fill="#ffd700" />
                {/* Glowing Phuljhadi in Right Hand */}
                <path d="M52 30L64 22" stroke="#e6c887" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="64" cy="22" r="4" fill="#ffd700" className="animate-ping" />
                <circle cx="64" cy="22" r="2.5" fill="#ffffff" />

                <defs>
                  <linearGradient id="goldSherwaniGrad" x1="0" y1="0" x2="68" y2="72" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f5e4be" />
                    <stop offset="0.5" stopColor="#d4af37" />
                    <stop offset="1" stopColor="#8c6d1f" />
                  </linearGradient>
                  <linearGradient id="stoleGrad" x1="18" y1="10" x2="30" y2="64" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff4d8d" />
                    <stop offset="1" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
              </svg>
            ) : (
              /* Radha Royal Pink Lehenga & Dupatta */
              <svg width="68" height="72" viewBox="0 0 68 72" fill="none" className="drop-shadow-lg">
                {/* Royal Choli / Blouse */}
                <path
                  d="M16 8C22 4 46 4 52 8L58 26C54 28 46 25 44 30L40 38H28L24 30C22 25 14 28 10 26L16 8Z"
                  fill="url(#pinkCholiGrad)"
                />
                {/* Flared Festive Lehenga Skirt */}
                <path
                  d="M26 36L12 66C22 70 46 70 56 66L42 36H26Z"
                  fill="url(#pinkLehengaGrad)"
                />
                {/* Golden Gota Patti Border at Lehenga Base */}
                <path
                  d="M12 66C22 70 46 70 56 66C46 64 22 64 12 66Z"
                  fill="#ffd700"
                />
                {/* Traditional Jewelry Necklace */}
                <path d="M26 14C30 18 38 18 42 14" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
                {/* Sparkling Flower / Diya Flame in Hand */}
                <circle cx="58" cy="26" r="4" fill="#ff4d8d" className="animate-ping" />
                <circle cx="58" cy="26" r="2.5" fill="#f5e4be" />

                <defs>
                  <linearGradient id="pinkCholiGrad" x1="0" y1="0" x2="68" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f29bb2" />
                    <stop offset="0.5" stopColor="#e06b8b" />
                    <stop offset="1" stopColor="#9d174d" />
                  </linearGradient>
                  <linearGradient id="pinkLehengaGrad" x1="12" y1="36" x2="56" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e06b8b" />
                    <stop offset="0.6" stopColor="#be185d" />
                    <stop offset="1" stopColor="#700936" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {/* Glowing Lotus / Diya Cloud base pedestal */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.65, 0.9, 0.65] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className={`-mt-1.5 w-14 h-4 rounded-full blur-[2px] ${
                isIndransh ? 'bg-[#ffd700]/40' : 'bg-[#f29bb2]/40'
              }`}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  // Standard Circular Portrait Frame for Lobby / Cards / Modals
  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className={`relative rounded-full p-1 bg-gradient-to-tr transition-all duration-300 ${
          isIndransh
            ? 'from-[#d4af37] via-[#f5e4be] to-[#ff9a3c] shadow-[0_0_20px_rgba(230,200,135,0.45)]'
            : 'from-[#f29bb2] via-[#ff9a3c] to-[#e06b8b] shadow-[0_0_20px_rgba(242,155,178,0.55)]'
        }`}
      >
        <div className={`${avatarSizes[size] || avatarSizes.md} rounded-full overflow-hidden bg-[#18082c] border-2 border-[#120726]`}>
          <img
            src={char.avatar}
            alt={char.name}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {shieldActive && (
          <span className="absolute -top-1 -right-1 bg-[#120726] p-1 rounded-full border border-current text-[#ffd700]">
            <Shield size={12} />
          </span>
        )}
      </div>
    </div>
  )
}
