import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Heart, Sparkles, RotateCcw, X, Image as ImageIcon } from 'lucide-react'
import CharacterAvatar from './CharacterAvatar'
import { CHARACTERS, ENDINGS } from './gameConstants'
import { triggerHaptic } from '../../utils/haptics'

export default function GameOverModal({
  room,
  myRole,
  onRestart,
  onBackToLobby
}) {
  const [showPhotoModal, setShowPhotoModal] = useState(false)

  if (!room || room.status !== 'ended') return null

  const winner = room.winner // 'indransh' | 'radha' | 'draw' | 'coop_win' | 'coop_defeat'
  const isCoop = room.mode === 'coop'

  // Determine Personalized Ending Message
  let endingMessage = room.endingMessage
  if (!endingMessage) {
    if (winner === 'radha') endingMessage = ENDINGS.radha_win
    else if (winner === 'indransh') endingMessage = ENDINGS.indransh_win
    else if (winner === 'coop_win') endingMessage = ENDINGS.coop_win
    else if (winner === 'coop_defeat') endingMessage = ENDINGS.coop_defeat
    else endingMessage = ENDINGS.draw
  }

  const players = Object.values(room.players || {})
  const indranshPlayer = players.find((p) => p.role === 'indransh')
  const radhaPlayer = players.find((p) => p.role === 'radha')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#18082c] via-[#140626] to-[#0d031a] border border-[#e6c887]/40 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col items-center text-center"
      >
        {/* Celebration Badges / Header */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd700]/15 border border-[#ffd700]/30 text-[#ffd700] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={13} />
          {isCoop
            ? winner === 'coop_win' ? 'Diwali Victory! 🪔✨' : 'Diwali Journey ✨'
            : winner === 'draw' ? 'Two Hearts United ❤️' : 'Match Concluded ⚔️'}
        </span>

        {/* Avatars Display */}
        <div className="relative my-4 flex items-center justify-center gap-4">
          {winner === 'indransh' && (
            <div className="relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffd700] text-[#120726] p-1.5 rounded-full shadow-lg z-10">
                <Crown size={18} />
              </span>
              <CharacterAvatar role="indransh" size="lg" />
            </div>
          )}

          {winner === 'radha' && (
            <div className="relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f29bb2] text-[#120726] p-1.5 rounded-full shadow-lg z-10">
                <Crown size={18} />
              </span>
              <CharacterAvatar role="radha" size="lg" />
            </div>
          )}

          {(winner === 'draw' || isCoop) && (
            <div className="flex items-center gap-3 sm:gap-4">
              <CharacterAvatar role="indransh" size="md" />
              <div className="p-2.5 rounded-full bg-gradient-to-r from-[#ffd700] to-[#f29bb2] text-[#120726] shadow-md animate-pulse">
                <Heart size={20} fill="currentColor" />
              </div>
              <CharacterAvatar role="radha" size="md" />
            </div>
          )}
        </div>

        {/* Winner Name */}
        <h3 className="font-script gold-text-luxury text-3xl sm:text-4xl my-1">
          {isCoop
            ? winner === 'coop_win' ? 'Together Forever ❤️' : 'United in Love'
            : winner === 'radha' ? 'Radha Wins! 👑' : winner === 'indransh' ? 'Indransh Wins! 💛' : 'A Perfect Draw! ✨'}
        </h3>

        {/* Exact Personalized Ending Quote */}
        <div className="my-3 px-4 py-3 rounded-2xl bg-[#120520]/80 border border-[#e6c887]/25 w-full">
          <p className="font-serif italic text-sm sm:text-base text-[#faf4ea] leading-relaxed">
            “{endingMessage}”
          </p>
        </div>

        {/* Scores & Stats Bar */}
        <div className="grid grid-cols-2 gap-3 w-full my-3 text-xs">
          <div className="p-2.5 rounded-xl bg-[#1a082e] border border-[#e6c887]/20 flex flex-col items-center">
            <span className="text-[#e6c887]/80">Indransh Score</span>
            <span className="text-base font-bold font-mono text-[#f5e4be]">{indranshPlayer?.score || 0}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#1a082e] border border-[#f29bb2]/20 flex flex-col items-center">
            <span className="text-[#f29bb2]/80">Radha Score</span>
            <span className="text-base font-bold font-mono text-[#f29bb2]">{radhaPlayer?.score || 0}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20)
              setShowPhotoModal(true)
            }}
            className="btn-secondary-luxury text-xs px-4 py-2.5 w-full justify-center flex items-center gap-1.5"
          >
            <ImageIcon size={14} /> View Our Photo ❤️
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(30)
              onRestart()
            }}
            className="btn-primary-luxury text-xs px-6 py-2.5 w-full justify-center flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Play Again
          </button>
        </div>
      </motion.div>

      {/* Sweet Memory Modal: Full Couple Photo */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative max-w-sm w-full bg-[#18082c] p-4 rounded-3xl border border-[#e6c887]/40 shadow-2xl flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X size={18} />
              </button>
              <h4 className="font-script gold-text-luxury text-2xl my-1">Indransh & Radha ❤️</h4>
              <p className="text-[11px] font-serif italic text-[#e6c887]/80 mb-3">
                “Forever together, lighting up every Diwali.”
              </p>
              <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden border border-[#e6c887]/30 shadow-lg">
                <img
                  src="/assets/photos/couple.jpeg"
                  alt="Indransh and Radha"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
