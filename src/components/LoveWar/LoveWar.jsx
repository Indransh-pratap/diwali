import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, HelpCircle, X, Wifi, WifiOff, Swords } from 'lucide-react'
import { useGameSocket } from './useGameSocket'
import Lobby from './Lobby'
import BattleArena from './BattleArena'
import GameOverModal from './GameOverModal'
import { gameAudio } from './gameAudio'
import { triggerHaptic } from '../../utils/haptics'

export default function LoveWar() {
  const [muted, setMuted] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const {
    isConnected,
    isSoloMode,
    room,
    roomCode,
    myRole,
    myPlayer,
    opponent,
    countdown,
    screenShake,
    bannerMessage,
    waveAlert,
    projectiles,
    stars,
    obstacles,
    createRoom,
    joinRoom,
    setReady,
    setMode,
    move,
    attack,
    hitTarget,
    hitObstacle,
    collectStar,
    restartMatch,
    startSoloPractice
  } = useGameSocket()

  const handleToggleMute = () => {
    triggerHaptic(20)
    const nextMute = !muted
    setMuted(nextMute)
    gameAudio.setMuted(nextMute)
  }

  const isPlaying = room?.status === 'playing' || room?.status === 'ended'

  return (
    <section
      id="love-war"
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 flex flex-col items-center overflow-hidden"
    >
      {/* Decorative Diwali Sparkle & Glow Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#f29bb2]/10 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#ffd700]/10 blur-[140px]" />
      </div>

      {/* Top Status Bar: Server Connection & Audio Controls */}
      <div className="relative z-30 w-full max-w-4xl flex items-center justify-between mb-4 px-2">
        {/* Server Connection Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#140728]/80 backdrop-blur-md border border-[#e6c887]/25 text-[11px] text-[#f5e4be]">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multiplayer Server Online</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{isSoloMode ? 'Solo Practice Active' : 'Connecting to Server...'}</span>
            </>
          )}
        </div>

        {/* Controls: Audio & Rules */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="p-2 rounded-xl bg-[#140728]/80 hover:bg-[#1f0a3d] border border-[#e6c887]/30 text-[#e6c887] text-xs transition flex items-center gap-1.5"
            title="How to Play"
          >
            <HelpCircle size={15} />
            <span className="hidden sm:inline">How to Play</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-[#140728]/80 hover:bg-[#1f0a3d] border border-[#e6c887]/30 text-[#e6c887] transition"
            title={muted ? 'Unmute Game SFX' : 'Mute Game SFX'}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* Synchronized 3-2-1 Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <span className="font-script gold-text-luxury text-8xl sm:text-9xl drop-shadow-[0_0_40px_rgba(255,215,0,0.8)]">
                {countdown}
              </span>
              <span className="text-sm font-semibold tracking-widest text-[#f5e4be] uppercase mt-2">
                Prepare For The Diwali Love War!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dynamic View: Lobby or Active Battle Arena */}
      <div className="relative z-20 w-full flex flex-col items-center">
        {!isPlaying ? (
          <Lobby
            room={room}
            roomCode={roomCode}
            myRole={myRole}
            isConnected={isConnected}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onSetReady={setReady}
            onSetMode={setMode}
            onStartSolo={startSoloPractice}
          />
        ) : (
          <BattleArena
            room={room}
            myRole={myRole}
            myPlayer={myPlayer}
            opponent={opponent}
            screenShake={screenShake}
            bannerMessage={bannerMessage}
            waveAlert={waveAlert}
            projectiles={projectiles}
            stars={stars}
            obstacles={obstacles}
            onMove={move}
            onAttack={attack}
            onCollectStar={collectStar}
            onHitObstacle={hitObstacle}
          />
        )}
      </div>

      {/* Game Over Celebration Modal */}
      <GameOverModal
        room={room}
        myRole={myRole}
        onRestart={restartMatch}
        onBackToLobby={() => window.location.reload()}
      />

      {/* Instructions / Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative max-w-lg w-full bg-[#18082c] p-6 rounded-3xl border border-[#e6c887]/40 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X size={18} />
              </button>

              <h4 className="font-script gold-text-luxury text-3xl mb-1">
                How to Play Radha vs Indransh ❤️
              </h4>
              <p className="text-xs text-[#faf4ea]/80 mb-4">
                The ultimate Diwali love showdown between Indransh and his Queen of Hearts, Radha!
              </p>

              <div className="space-y-4 text-xs text-[#faf4ea]/90 leading-relaxed">
                <div className="p-3 rounded-2xl bg-[#120520] border border-[#e6c887]/20">
                  <h5 className="font-semibold text-[#f5e4be] text-sm mb-1 flex items-center gap-1.5">
                    <Swords size={14} className="text-[#ffd700]" /> Mode 1: Love Battle (PvP)
                  </h5>
                  <p>
                    100 HP each, 90-second match. Launch romantic firework abilities, dodge attacks, activate shields, and collect falling golden stars for bonus score and energy!
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#120520] border border-[#f29bb2]/20">
                  <h5 className="font-semibold text-[#f29bb2] text-sm mb-1 flex items-center gap-1.5">
                    🪔 Mode 2: Together Forever (Co-op)
                  </h5>
                  <p>
                    Defend the sacred Center Diya (100 protection points) against 3 waves of festive Diwali creatures! Coordinate your moves:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-[11px] text-[#faf4ea]/80">
                    <li><strong className="text-[#ffd700]">Ultimate Heart Firework:</strong> Love Bomb + Gussa Mode within 2s clears the entire arena!</li>
                    <li><strong className="text-[#ffd700]">Golden Diya Protection:</strong> Both activating shields together restores +20 Diya protection!</li>
                    <li><strong className="text-[#ffd700]">Double Star Bonus:</strong> Both grabbing stars rewards +50 bonus points!</li>
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-[#120520] border border-[#e6c887]/20">
                  <h5 className="font-semibold text-[#f5e4be] text-sm mb-1">🎮 Controls</h5>
                  <p>
                    <strong>Desktop:</strong> Left/Right Arrow keys or A/D to move. Keys <strong>Q, W, E, R</strong> to unleash abilities.<br/>
                    <strong>Mobile:</strong> Tap the Move Left / Right buttons and touch the circular glowing ability buttons!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
