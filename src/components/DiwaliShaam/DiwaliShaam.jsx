import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Sparkles, Users, Heart, Share2, Copy, Check } from 'lucide-react'
import CitySkylineCanvas from './CitySkylineCanvas'
import MountainForeground from './MountainForeground'
import RomanticActivitiesBar from './RomanticActivitiesBar'
import ShaamChat from './ShaamChat'
import MakeWishModal from './MakeWishModal'
import { useShaamSocket } from './useShaamSocket'
import { shaamAudio } from './shaamAudio'
import { triggerHaptic } from '../../utils/haptics'

export default function DiwaliShaam() {
  const [ambientAudioOn, setAmbientAudioOn] = useState(false)
  const [isWishModalOpen, setIsWishModalOpen] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)

  const {
    isConnected,
    roomCode,
    myRole,
    messages,
    wishes,
    handsHeld,
    partnerTyping,
    isChaiShared,
    heartEvent,
    specialFireworkTrigger,
    bannerToast,
    createRoom,
    joinRoom,
    sendMessage,
    sendTyping,
    sendReaction,
    sendHeart,
    shareChai,
    toggleHoldHands,
    makeWish,
    triggerFirework
  } = useShaamSocket()

  const handleToggleAmbientAudio = () => {
    triggerHaptic(20)
    const nextState = !ambientAudioOn
    setAmbientAudioOn(nextState)
    shaamAudio.setMuted(!nextState)
  }

  const handleCopyCode = () => {
    if (roomCode) {
      triggerHaptic(20)
      navigator.clipboard.writeText(roomCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleCreateRoom = (role) => {
    triggerHaptic(30)
    createRoom(role)
    setShowConnectModal(false)
  }

  const handleJoinSubmit = (e) => {
    e.preventDefault()
    if (!joinCodeInput.trim()) return
    triggerHaptic(30)
    joinRoom(joinCodeInput.trim().toUpperCase(), 'radha')
    setShowConnectModal(false)
  }

  return (
    <section
      id="shaam"
      className="relative w-full min-h-screen py-16 sm:py-24 px-3 sm:px-6 flex flex-col items-center justify-between overflow-hidden bg-[#06020f] select-none"
    >
      {/* 1. Cinematic City Skyline Canvas with Layered Fireworks & Sky Lanterns */}
      <CitySkylineCanvas
        activeWishes={wishes}
        triggerSpecialFirework={specialFireworkTrigger}
      />

      {/* 2. Top Header Bar: Ambient Audio Toggle & Room Invitation Status */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between mb-4 px-2">
        {/* Private Room Status Badge */}
        {roomCode ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#140728]/85 backdrop-blur-md border border-[#e6c887]/30 text-[11px] text-[#f5e4be] shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold tracking-wider">Room: {roomCode}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1 hover:text-[#ffd700] transition active:scale-90"
              title="Copy Room Code"
            >
              {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f29bb2]/15 hover:bg-[#f29bb2]/25 border border-[#f29bb2]/35 text-[#f29bb2] text-xs font-semibold tracking-wide transition shadow-lg active:scale-95"
          >
            <Users size={13} />
            <span>Invite Radha to this little evening ❤️</span>
          </button>
        )}

        {/* Ambient Soundscape Control */}
        <button
          type="button"
          onClick={handleToggleAmbientAudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border transition shadow-lg active:scale-95 text-xs ${
            ambientAudioOn
              ? 'bg-[#ffd700]/20 border-[#ffd700]/40 text-[#ffd700]'
              : 'bg-[#140728]/80 border-[#e6c887]/25 text-[#e6c887]/70 hover:text-white'
          }`}
          title={ambientAudioOn ? 'Mute Mountain Ambience' : 'Listen to Mountain Breeze & City Fireworks'}
        >
          {ambientAudioOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span className="hidden sm:inline">
            {ambientAudioOn ? 'Mountain Breeze On' : 'Play Shaam Ambience'}
          </span>
        </button>
      </div>

      {/* 3. Section Title & Poetic Typography */}
      <div className="relative z-30 text-center max-w-2xl mx-auto my-2 px-4">
        <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#ffd700]/15 border border-[#ffd700]/30 text-[#ffd700] text-[11px] sm:text-xs font-semibold tracking-widest uppercase mb-2">
          <Sparkles size={13} /> The Diwali Shaam ✨
        </span>

        <h2 className="font-script gold-text-luxury text-4xl xs:text-5xl sm:text-6xl md:text-7xl my-1 leading-tight drop-shadow-[0_4px_25px_rgba(255,215,0,0.35)]">
          The Diwali Shaam
        </h2>

        {/* Main Quote */}
        <p className="font-serif italic text-base sm:text-xl md:text-2xl text-[#faf4ea] my-2 leading-relaxed drop-shadow">
          “Tu, main, ye thandi hawa...<br className="hidden xs:inline" />
          aur saamne jagmagati ek poori duniya.”
        </p>

        {/* Tagline & Subtitle */}
        <p className="text-xs sm:text-sm text-[#e6c887]/85 max-w-lg mx-auto font-sans leading-normal">
          Somewhere between a million lights, I found my favourite place — beside you.
        </p>
      </div>

      {/* 4. Active Romantic Toast Banner */}
      <AnimatePresence>
        {bannerToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 inset-x-4 z-50 flex justify-center pointer-events-none"
          >
            <div className="px-5 py-2.5 rounded-2xl bg-[#18082c]/95 backdrop-blur-xl border border-[#ffd700]/60 shadow-[0_10px_35px_rgba(255,215,0,0.4)] text-center text-xs sm:text-sm font-semibold text-[#f5e4be]">
              {bannerToast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Middle Space: Interactive Conversation Panel */}
      <div className="relative z-25 w-full flex flex-col items-center my-4 px-2">
        <ShaamChat
          messages={messages}
          myRole={myRole}
          partnerTyping={partnerTyping}
          isConnected={isConnected}
          onSendMessage={sendMessage}
          onSendTyping={sendTyping}
          onSendReaction={sendReaction}
        />
      </div>

      {/* 6. Romantic Activities Floating Bar */}
      <div className="relative z-25 w-full mt-2 mb-36 sm:mb-48 md:mb-52">
        <RomanticActivitiesBar
          handsHeld={handsHeld}
          myRole={myRole}
          onSendHeart={sendHeart}
          onShareChai={shareChai}
          onOpenWishModal={() => setIsWishModalOpen(true)}
          onToggleHoldHands={toggleHoldHands}
          onTriggerFirework={triggerFirework}
        />
      </div>

      {/* 7. Scenic Mountain Hill Foreground: Couple Sitting Looking at City */}
      <MountainForeground
        handsHeld={handsHeld}
        isChaiShared={isChaiShared}
        heartEvent={heartEvent}
      />

      {/* 8. Make a Wish Modal (Sky Lantern) */}
      <MakeWishModal
        isOpen={isWishModalOpen}
        onClose={() => setIsWishModalOpen(false)}
        onSubmitWish={makeWish}
        existingWishes={wishes}
      />

      {/* 9. Room Connection Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative max-w-md w-full bg-[#18082c] p-6 rounded-3xl border border-[#e6c887]/40 shadow-2xl flex flex-col items-center text-center"
            >
              <h4 className="font-script gold-text-luxury text-3xl mb-1">
                A Private Evening Together ❤️
              </h4>
              <p className="text-xs text-[#faf4ea]/85 mb-5 font-serif italic">
                “Connect two devices to chat in real time, hold hands and make wishes under the stars.”
              </p>

              {/* Create Room Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full mb-4">
                <button
                  type="button"
                  onClick={() => handleCreateRoom('indransh')}
                  className="btn-primary-luxury text-xs px-3 py-3 w-full justify-center flex flex-col items-center gap-1"
                >
                  <span className="font-bold">Play as Indransh</span>
                  <span className="text-[10px] opacity-75">Create Room</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateRoom('radha')}
                  className="btn-secondary-luxury text-xs px-3 py-3 w-full justify-center flex flex-col items-center gap-1"
                >
                  <span className="font-bold">Play as Radha</span>
                  <span className="text-[10px] opacity-75">Create Room</span>
                </button>
              </div>

              {/* Join Room Form */}
              <form onSubmit={handleJoinSubmit} className="flex flex-col gap-2 w-full pt-3 border-t border-[#e6c887]/20">
                <span className="text-[11px] text-[#e6c887]/80">Or enter room code from partner:</span>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="w-full text-center font-mono tracking-widest uppercase px-3 py-2 rounded-xl bg-[#120520] border border-[#e6c887]/30 text-[#f5e4be] focus:border-[#ffd700] focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  className="btn-primary-luxury text-xs px-4 py-2.5 w-full justify-center"
                >
                  Join Evening
                </button>
              </form>

              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="text-xs text-[#e6c887]/60 hover:text-white mt-4 underline"
              >
                Close & Enjoy Solo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
