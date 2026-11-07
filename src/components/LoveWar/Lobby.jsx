import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Heart, Copy, Check, Users, Play, Crown, Sparkles, Shield } from 'lucide-react'
import { CHARACTERS } from './gameConstants'
import CharacterAvatar from './CharacterAvatar'
import { triggerHaptic } from '../../utils/haptics'

export default function Lobby({
  room,
  roomCode,
  myRole,
  isConnected,
  onCreateRoom,
  onJoinRoom,
  onSetReady,
  onSetMode,
  onStartSolo
}) {
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedRole, setSelectedRole] = useState('indransh')
  const [activeTab, setActiveTab] = useState('create') // 'create' | 'join' | 'solo'

  const handleCopyCode = () => {
    triggerHaptic(20)
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreate = (mode) => {
    triggerHaptic(30)
    onCreateRoom(selectedRole, mode)
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (!joinCodeInput.trim()) return
    triggerHaptic(30)
    onJoinRoom(joinCodeInput.trim().toUpperCase(), selectedRole === 'indransh' ? 'radha' : 'indransh')
  }

  const players = room ? Object.values(room.players || {}) : []
  const indranshPlayer = players.find((p) => p.role === 'indransh')
  const radhaPlayer = players.find((p) => p.role === 'radha')
  const myPlayer = players.find((p) => p.role === myRole) || players[0]
  const isHost = myPlayer?.isHost

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* 1. Header & Romantic Subtitle */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f29bb2]/15 border border-[#f29bb2]/30 text-[#f29bb2] text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-2">
          <Swords size={13} className="text-[#ffd700]" /> Radha vs Indransh ❤️
        </span>
        <h3 className="font-script gold-text-luxury text-3xl xs:text-4xl sm:text-5xl md:text-6xl my-1">
          The Diwali Love War 🪔
        </h3>
        <p className="font-serif italic text-sm sm:text-lg text-[#faf4ea]/85 max-w-md mx-auto mt-1">
          “Two hearts, two players, one unforgettable celebration.”
        </p>
      </div>

      {/* 2. If already in a room */}
      {room ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full rounded-3xl p-5 sm:p-8 bg-[#140726]/90 backdrop-blur-2xl border border-[#e6c887]/35 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col items-center"
        >
          {/* Room Code Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-5 border-b border-[#e6c887]/20 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[#e6c887]/75 font-medium">Room Code:</span>
              <span className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-[#f5e4be] bg-[#1a082c] px-3.5 py-1 rounded-xl border border-[#e6c887]/40 shadow-inner">
                {room.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy Room Code"
                className="p-2 rounded-xl bg-[#e6c887]/15 hover:bg-[#e6c887]/25 text-[#e6c887] transition active:scale-90"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>

            {/* Mode Switcher / Display */}
            <div className="flex items-center gap-2">
              {isHost ? (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1c0830] border border-[#f29bb2]/30 text-xs">
                  <button
                    type="button"
                    onClick={() => onSetMode('pvp')}
                    className={`px-3 py-1 rounded-lg transition ${
                      room.mode === 'pvp' ? 'bg-[#e6c887] text-[#120726] font-bold' : 'text-[#e6c887]/70'
                    }`}
                  >
                    PvP Battle ⚔️
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetMode('coop')}
                    className={`px-3 py-1 rounded-lg transition ${
                      room.mode === 'coop' ? 'bg-[#f29bb2] text-[#120726] font-bold' : 'text-[#f29bb2]/70'
                    }`}
                  >
                    Co-op Mode 🪔
                  </button>
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-[#1c0830] border border-[#f29bb2]/30 text-xs text-[#f29bb2]">
                  Mode: <span className="font-semibold text-[#f5e4be]">{room.mode === 'coop' ? 'Together Forever (Co-op) 🪔' : 'Love Battle (PvP) ⚔️'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Player Cards (Real Photo Avatars with Golden Glowing Borders) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full my-6">
            {/* Indransh Card */}
            <div
              className={`relative p-5 rounded-2xl border transition-all flex flex-col items-center text-center ${
                indranshPlayer
                  ? 'bg-[#18082c]/80 border-[#e6c887]/40 shadow-[0_0_25px_rgba(230,200,135,0.15)]'
                  : 'bg-[#120520]/50 border-dashed border-[#e6c887]/20'
              }`}
            >
              <div className="relative mb-3">
                <CharacterAvatar role="indransh" size="lg" />
                {indranshPlayer?.isHost && (
                  <span className="absolute -top-1 -right-1 bg-[#ffd700] text-[#120726] p-1 rounded-full shadow">
                    <Crown size={14} />
                  </span>
                )}
              </div>
              <h4 className="font-script text-2xl sm:text-3xl text-[#f5e4be]">{CHARACTERS.indransh.name}</h4>
              <p className="text-xs text-[#e6c887]/80">{CHARACTERS.indransh.title}</p>
              <div className="mt-3">
                {indranshPlayer ? (
                  <span
                    className={`text-xs px-3.5 py-1 rounded-full font-medium ${
                      indranshPlayer.ready
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                    }`}
                  >
                    {indranshPlayer.ready ? 'Ready to Battle ❤️' : 'Setting Up...'}
                  </span>
                ) : (
                  <span className="text-xs text-[#e6c887]/50 italic">Waiting for Indransh to join...</span>
                )}
              </div>
            </div>

            {/* Radha Card */}
            <div
              className={`relative p-5 rounded-2xl border transition-all flex flex-col items-center text-center ${
                radhaPlayer
                  ? 'bg-[#18082c]/80 border-[#f29bb2]/40 shadow-[0_0_25px_rgba(242,155,178,0.2)]'
                  : 'bg-[#120520]/50 border-dashed border-[#f29bb2]/20'
              }`}
            >
              <div className="relative mb-3">
                <CharacterAvatar role="radha" size="lg" />
                {radhaPlayer?.isHost && (
                  <span className="absolute -top-1 -right-1 bg-[#ffd700] text-[#120726] p-1 rounded-full shadow">
                    <Crown size={14} />
                  </span>
                )}
              </div>
              <h4 className="font-script text-2xl sm:text-3xl text-[#f29bb2]">{CHARACTERS.radha.name}</h4>
              <p className="text-xs text-[#f29bb2]/80">{CHARACTERS.radha.title}</p>
              <div className="mt-3">
                {radhaPlayer ? (
                  <span
                    className={`text-xs px-3.5 py-1 rounded-full font-medium ${
                      radhaPlayer.ready
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                    }`}
                  >
                    {radhaPlayer.ready ? 'Ready to Battle ❤️' : 'Setting Up...'}
                  </span>
                ) : (
                  <span className="text-xs text-[#f29bb2]/50 italic">Waiting for Radha to join...</span>
                )}
              </div>
            </div>
          </div>

          {/* Ready Button */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => onSetReady(!myPlayer?.ready)}
              className={`px-8 py-3.5 rounded-full font-sans font-semibold text-sm transition-all duration-300 active:scale-95 shadow-lg flex items-center gap-2 ${
                myPlayer?.ready
                  ? 'bg-emerald-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.55)]'
                  : 'btn-primary-luxury text-[#120726]'
              }`}
            >
              <Heart size={16} fill={myPlayer?.ready ? 'currentColor' : 'none'} />
              <span>{myPlayer?.ready ? "Ready! (Waiting for partner)" : "Confirm Ready to Fight! ⚔️"}</span>
            </button>
            <p className="text-[11px] text-[#e6c887]/60 text-center">
              Both players must click ready to start the synchronized countdown.
            </p>
          </div>
        </motion.div>
      ) : (
        /* 3. Room Creation & Join Tabs */
        <div className="w-full rounded-3xl p-5 sm:p-8 bg-[#140726]/90 backdrop-blur-2xl border border-[#e6c887]/35 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col items-center">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-full bg-[#120520] border border-[#e6c887]/25 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-[#f5e4be] to-[#e6c887] text-[#120726] shadow'
                  : 'text-[#e6c887]/70 hover:text-white'
              }`}
            >
              Create Room
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                activeTab === 'join'
                  ? 'bg-gradient-to-r from-[#f5e4be] to-[#e6c887] text-[#120726] shadow'
                  : 'text-[#e6c887]/70 hover:text-white'
              }`}
            >
              Join Room
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('solo')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                activeTab === 'solo'
                  ? 'bg-gradient-to-r from-[#f29bb2] to-[#e06b8b] text-white shadow'
                  : 'text-[#f29bb2]/80 hover:text-white'
              }`}
            >
              Solo Practice 🤖
            </button>
          </div>

          {/* TAB A: CREATE ROOM */}
          {activeTab === 'create' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full max-w-md">
              <p className="text-xs text-[#e6c887]/80 mb-4 text-center">
                Select your character & game mode to create a private room:
              </p>

              {/* Character Selection */}
              <div className="grid grid-cols-2 gap-4 w-full mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedRole('indransh')}
                  className={`p-4 rounded-2xl border flex flex-col items-center transition ${
                    selectedRole === 'indransh'
                      ? 'border-[#e6c887] bg-[#e6c887]/15 shadow-[0_0_20px_rgba(230,200,135,0.25)]'
                      : 'border-[#e6c887]/20 bg-[#120520]/50'
                  }`}
                >
                  <CharacterAvatar role="indransh" size="md" />
                  <span className="font-script text-xl text-[#f5e4be] mt-2">Indransh</span>
                  <span className="text-[10px] text-[#e6c887]/70">Left Player (Golden)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('radha')}
                  className={`p-4 rounded-2xl border flex flex-col items-center transition ${
                    selectedRole === 'radha'
                      ? 'border-[#f29bb2] bg-[#f29bb2]/15 shadow-[0_0_20px_rgba(242,155,178,0.25)]'
                      : 'border-[#f29bb2]/20 bg-[#120520]/50'
                  }`}
                >
                  <CharacterAvatar role="radha" size="md" />
                  <span className="font-script text-xl text-[#f29bb2] mt-2">Radha</span>
                  <span className="text-[10px] text-[#f29bb2]/70">Right Player (Pink)</span>
                </button>
              </div>

              {/* Mode Selection Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  type="button"
                  onClick={() => handleCreate('pvp')}
                  className="btn-primary-luxury text-xs sm:text-sm px-6 py-3 w-full justify-center flex items-center gap-1.5"
                >
                  <Swords size={16} /> Mode 1: Love Battle (PvP)
                </button>
                <button
                  type="button"
                  onClick={() => handleCreate('coop')}
                  className="btn-secondary-luxury text-xs sm:text-sm px-6 py-3 w-full justify-center flex items-center gap-1.5"
                >
                  <Heart size={16} className="text-[#f29bb2]" /> Mode 2: Together (Co-op)
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB B: JOIN ROOM */}
          {activeTab === 'join' && (
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleJoin} className="flex flex-col items-center w-full max-w-sm">
              <p className="text-xs text-[#e6c887]/80 mb-4 text-center">
                Enter the 5-character private room code shared by your partner:
              </p>
              <input
                type="text"
                maxLength={6}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE (e.g. LOVE1)"
                className="w-full text-center tracking-widest font-mono text-2xl uppercase px-4 py-3 rounded-2xl bg-[#120520] border border-[#e6c887]/40 text-[#f5e4be] focus:border-[#e6c887] focus:outline-none mb-4"
              />
              <button
                type="submit"
                className="btn-primary-luxury text-xs sm:text-sm px-8 py-3 w-full justify-center flex items-center gap-1.5"
              >
                <Users size={16} /> Join Private Room
              </button>
            </motion.form>
          )}

          {/* TAB C: SOLO PRACTICE */}
          {activeTab === 'solo' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full max-w-md text-center">
              <p className="text-xs sm:text-sm text-[#faf4ea]/85 mb-4">
                Test all Diwali powers immediately against a playful AI companion:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => onStartSolo('indransh', 'pvp')}
                  className="btn-primary-luxury text-xs px-4 py-3 w-full justify-center flex items-center gap-1.5"
                >
                  <Play size={15} /> Indransh (PvP)
                </button>
                <button
                  type="button"
                  onClick={() => onStartSolo('radha', 'pvp')}
                  className="btn-secondary-luxury text-xs px-4 py-3 w-full justify-center flex items-center gap-1.5"
                >
                  <Play size={15} className="text-[#f29bb2]" /> Radha (PvP)
                </button>
                <button
                  type="button"
                  onClick={() => onStartSolo('indransh', 'coop')}
                  className="btn-primary-luxury text-xs px-4 py-3 w-full justify-center flex items-center gap-1.5 sm:col-span-2"
                >
                  <Heart size={15} className="text-[#f29bb2]" /> Test Co-op Wave Defense 🪔
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
