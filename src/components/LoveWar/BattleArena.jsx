import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Bomb,
  Sparkles,
  Flame,
  Shield,
  ShieldCheck,
  Disc,
  Star,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkle
} from 'lucide-react'
import CharacterAvatar from './CharacterAvatar'
import { CHARACTERS } from './gameConstants'
import { triggerHaptic } from '../../utils/haptics'

const ICON_MAP = {
  Heart,
  Bomb,
  Sparkles,
  Flame,
  Shield,
  ShieldCheck,
  Disc,
  Sparkle
}

export default function BattleArena({
  room,
  myRole,
  myPlayer,
  opponent,
  screenShake,
  bannerMessage,
  waveAlert,
  projectiles,
  stars,
  obstacles,
  onMove,
  onAttack,
  onCollectStar,
  onHitObstacle
}) {
  const [cooldowns, setCooldowns] = useState({})
  const [attackingRole, setAttackingRole] = useState(null)
  const [hitRole, setHitRole] = useState(null)
  const arenaRef = useRef(null)

  const isIndransh = myRole === 'indransh'
  const charConfig = CHARACTERS[myRole] || CHARACTERS.indransh
  const isCoop = room?.mode === 'coop'

  // Keyboard navigation & hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ability hotkeys
      const key = e.key.toUpperCase()
      const ability = charConfig.powers.find((p) => p.hotkey === key)
      if (ability) {
        handleAbilityTrigger(ability)
      }

      // Movement keys
      const currentX = myPlayer?.x || (isIndransh ? 22 : 78)
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        onMove(Math.max(10, currentX - 4))
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        onMove(Math.min(90, currentX + 4))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [myPlayer?.x, myRole, cooldowns, onMove])

  // Ability execution handler
  const handleAbilityTrigger = (ability) => {
    const now = Date.now()
    const lastTrigger = cooldowns[ability.key] || 0
    if (now - lastTrigger < ability.cd) return
    if ((myPlayer?.energy || 0) < ability.energy) return

    triggerHaptic(30)
    setCooldowns((prev) => ({ ...prev, [ability.key]: now }))

    // Animation trigger
    setAttackingRole(myRole)
    setTimeout(() => setAttackingRole(null), 300)

    onAttack(ability.key)
  }

  // Periodic cooldown tick for smooth UI radial progress
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 100)
    return () => clearInterval(interval)
  }, [])

  const getRemainingCooldown = (ability) => {
    const last = cooldowns[ability.key] || 0
    const elapsed = Date.now() - last
    return Math.max(0, ability.cd - elapsed)
  }

  const indranshData = isIndransh ? myPlayer : opponent
  const radhaData = isIndransh ? opponent : myPlayer

  return (
    <div
      ref={arenaRef}
      className={`relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-b from-[#120524] via-[#1a082e] to-[#0c0318] border border-[#e6c887]/35 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col transition-transform duration-200 ${
        screenShake ? 'scale-[1.015] translate-x-1' : ''
      }`}
    >
      {/* Ambient Diwali Glow Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
        <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full bg-[#f29bb2]/20 blur-[100px]" />
        <div className="absolute -top-20 right-1/4 w-96 h-96 rounded-full bg-[#e6c887]/20 blur-[100px]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#ffd700]/10 to-transparent" />
      </div>

      {/* TOP HUD: Health, Match Timer, Energy & Diya Status */}
      <header className="relative z-20 w-full px-3 py-3 sm:px-6 sm:py-4 bg-[#140728]/80 backdrop-blur-md border-b border-[#e6c887]/25 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Player (Indransh) HUD Card */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <CharacterAvatar
            role="indransh"
            size="md"
            hp={indranshData?.hp}
            shieldActive={indranshData?.shieldActive}
          />
          <div className="flex flex-col flex-1 min-w-0 max-w-[140px] sm:max-w-[190px]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#f5e4be] drop-shadow">
              <span className="truncate">Indransh 💛</span>
              <span className="text-[11px] font-mono">{Math.round(indranshData?.hp || 0)} HP</span>
            </div>
            {/* HP Bar */}
            <div className="w-full h-3 rounded-full bg-[#10051e] border border-[#e6c887]/35 overflow-hidden shadow-inner my-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-[#d4af37] via-[#f5e4be] to-[#ff9a3c]"
                animate={{ width: `${Math.max(0, Math.min(100, indranshData?.hp || 0))}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
            {/* Energy Bar & Score */}
            <div className="flex items-center justify-between text-[10px] text-[#e6c887]/80">
              <div className="w-16 sm:w-24 h-1.5 rounded-full bg-[#10051e] overflow-hidden border border-[#ffd700]/30">
                <div
                  className="h-full bg-[#ffd700]"
                  style={{ width: `${Math.max(0, Math.min(100, indranshData?.energy || 0))}%` }}
                />
              </div>
              <span className="font-mono font-medium">Score: {indranshData?.score || 0}</span>
            </div>
          </div>
        </div>

        {/* Center: Match Timer & Co-op Diya Indicator */}
        <div className="flex flex-col items-center flex-shrink-0 px-2 sm:px-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a082e] border border-[#e6c887]/40 shadow-inner">
            <Clock size={13} className="text-[#ffd700]" />
            <span className="font-mono font-bold text-sm sm:text-base text-[#f5e4be] tracking-wider">
              {room?.matchTimeRemaining || 90}s
            </span>
          </div>

          {/* Co-op Mode Sacred Diya Protection HP Bar */}
          {isCoop && (
            <div className="flex flex-col items-center mt-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffd700] flex items-center gap-1">
                Sacred Diya: {Math.round(room?.diyaHp || 100)}% 🪔
              </span>
              <div className="w-24 sm:w-36 h-2 rounded-full bg-[#120520] border border-[#ffd700]/50 overflow-hidden shadow-inner mt-0.5">
                <motion.div
                  className={`h-full ${
                    (room?.diyaHp || 100) > 40
                      ? 'bg-gradient-to-r from-amber-400 to-[#ffd700]'
                      : 'bg-gradient-to-r from-rose-600 to-red-500'
                  }`}
                  animate={{ width: `${Math.max(0, Math.min(100, room?.diyaHp || 100))}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span className="text-[9px] text-[#f29bb2] font-semibold mt-0.5">
                Wave {room?.currentWave || 1} / 3
              </span>
            </div>
          )}
        </div>

        {/* Right Player (Radha) HUD Card */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex flex-col items-end flex-1 min-w-0 max-w-[140px] sm:max-w-[190px]">
            <div className="flex items-center justify-between w-full text-xs font-semibold text-[#f29bb2] drop-shadow">
              <span className="text-[11px] font-mono">{Math.round(radhaData?.hp || 0)} HP</span>
              <span className="truncate">Radha 💗</span>
            </div>
            {/* HP Bar */}
            <div className="w-full h-3 rounded-full bg-[#10051e] border border-[#f29bb2]/35 overflow-hidden shadow-inner my-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-[#f29bb2] via-[#ff9a3c] to-[#e06b8b]"
                animate={{ width: `${Math.max(0, Math.min(100, radhaData?.hp || 0))}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
            {/* Energy Bar & Score */}
            <div className="flex items-center justify-between w-full text-[10px] text-[#f29bb2]/80">
              <span className="font-mono font-medium">Score: {radhaData?.score || 0}</span>
              <div className="w-16 sm:w-24 h-1.5 rounded-full bg-[#10051e] overflow-hidden border border-[#f29bb2]/30">
                <div
                  className="h-full bg-[#f29bb2]"
                  style={{ width: `${Math.max(0, Math.min(100, radhaData?.energy || 0))}%` }}
                />
              </div>
            </div>
          </div>
          <CharacterAvatar
            role="radha"
            size="md"
            hp={radhaData?.hp}
            shieldActive={radhaData?.shieldActive}
          />
        </div>
      </header>

      {/* ARENA STAGE (Floating Projectiles, Avatars & Sacred Diya) */}
      <div className="relative w-full h-[320px] xs:h-[350px] sm:h-[400px] md:h-[440px] overflow-hidden flex items-end justify-center pb-8 select-none">
        {/* Floating Stars in Arena */}
        {stars.map((star) => (
          <motion.button
            key={star.id}
            onClick={() => onCollectStar(star.id)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], opacity: 1, rotate: [0, 180, 360] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            style={{ left: `${star.x}%`, top: `${star.y}%` }}
            className="absolute z-20 cursor-pointer p-2 text-[#ffd700] hover:scale-125 transition drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]"
            title="Collect Golden Star (+20 pts & energy)"
          >
            <Star size={24} fill="#ffd700" className="animate-pulse" />
          </motion.button>
        ))}

        {/* Flying Projectiles */}
        {projectiles.map((proj) => (
          <motion.div
            key={proj.id}
            initial={{
              left: `${proj.startX}%`,
              bottom: '90px',
              scale: 0.6,
              opacity: 1
            }}
            animate={{
              left: proj.direction > 0 ? '78%' : '22%',
              bottom: '100px',
              scale: [0.8, 1.25, 1],
              rotate: proj.abilityKey === 'chakri' ? 720 : 0
            }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="absolute z-25 pointer-events-none -translate-x-1/2 flex items-center justify-center"
          >
            {proj.abilityKey === 'love_bomb' && (
              <div className="p-2 rounded-full bg-gradient-to-r from-[#ff4d8d] to-[#e06b8b] text-white shadow-[0_0_20px_#ff4d8d]">
                <Heart size={20} fill="currentColor" />
              </div>
            )}
            {proj.abilityKey === 'phuljhadi' && (
              <div className="p-1.5 rounded-full bg-gradient-to-r from-[#ffd700] to-[#f5e4be] text-[#120726] shadow-[0_0_15px_#ffd700]">
                <Sparkles size={16} />
              </div>
            )}
            {proj.abilityKey === 'gussa' && (
              <div className="p-2.5 rounded-full bg-gradient-to-r from-[#ff1744] via-[#f50057] to-[#d50000] text-white shadow-[0_0_25px_#ff1744]">
                <Flame size={24} fill="currentColor" />
              </div>
            )}
            {proj.abilityKey === 'anar' && (
              <div className="p-2 rounded-full bg-gradient-to-r from-[#ffd700] to-[#ff9a3c] text-[#120726] shadow-[0_0_20px_#ffd700]">
                <Sparkle size={20} fill="currentColor" />
              </div>
            )}
            {proj.abilityKey === 'chakri' && (
              <div className="p-2 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ffd700] text-[#120726] shadow-[0_0_20px_#f59e0b]">
                <Disc size={22} />
              </div>
            )}
          </motion.div>
        ))}

        {/* Co-op Mode: Sacred Center Diya with Flame */}
        {isCoop && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-15 flex flex-col items-center">
            {/* Sacred Diya Aura Dome */}
            <div className="absolute -inset-10 rounded-full bg-[#ffd700]/15 blur-xl pointer-events-none animate-pulse" />

            {/* Flickering Sacred Flame */}
            <div className="relative mb-0.5">
              <div className="w-4 h-7 sm:w-5 sm:h-9 rounded-full bg-gradient-to-t from-[#ff4d00] via-[#ffd700] to-white shadow-[0_0_25px_#ffd700] animate-bounce" />
            </div>

            {/* Sacred Clay Diya Base */}
            <svg width="60" height="28" viewBox="0 0 60 28" fill="none" className="drop-shadow-lg">
              <path
                d="M4 8C14 26 46 26 56 8C52 14 44 20 30 20C16 20 8 14 4 8Z"
                fill="url(#diyaClayGrad)"
              />
              <path
                d="M10 9C20 16 40 16 50 9C44 14 36 16 30 16C24 16 16 14 10 9Z"
                fill="#ffd700"
                opacity="0.8"
              />
              <defs>
                <linearGradient id="diyaClayGrad" x1="4" y1="8" x2="56" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#b45309" />
                  <stop offset="1" stopColor="#78350f" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[10px] font-script gold-text-luxury mt-1">Sacred Diya</span>
          </div>
        )}

        {/* Co-op Mode: Approaching Diwali Obstacles */}
        {isCoop &&
          obstacles.map((obs) => (
            <motion.div
              key={obs.id}
              onClick={() => onHitObstacle(obs.id, 25)}
              style={{ left: `${obs.x}%`, bottom: `${obs.y || 25}%` }}
              className="absolute z-20 cursor-pointer -translate-x-1/2 flex flex-col items-center group"
            >
              <div className="w-10 h-1.5 rounded-full bg-[#10051e] border border-red-500/40 overflow-hidden mb-1">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400"
                  style={{ width: `${Math.max(0, (obs.hp / (obs.maxHp || 30)) * 100)}%` }}
                />
              </div>
              <div className="p-2 rounded-full bg-gradient-to-tr from-[#991b1b] to-[#dc2626] text-white shadow-[0_0_15px_rgba(220,38,38,0.7)] group-hover:scale-125 transition">
                {obs.type === 'lantern_imp' ? <Flame size={18} /> : <Sparkles size={18} />}
              </div>
            </motion.div>
          ))}

        {/* LEFT PLAYER (Indransh) */}
        <div
          style={{ left: `${indranshData?.x || 22}%` }}
          className="absolute bottom-8 -translate-x-1/2 z-20 transition-all duration-150"
        >
          <CharacterAvatar
            role="indransh"
            size="arena"
            hp={indranshData?.hp}
            energy={indranshData?.energy}
            shieldActive={indranshData?.shieldActive}
            isAttacking={attackingRole === 'indransh'}
            isHit={hitRole === 'indransh'}
          />
        </div>

        {/* RIGHT PLAYER (Radha) */}
        <div
          style={{ left: `${radhaData?.x || 78}%` }}
          className="absolute bottom-8 -translate-x-1/2 z-20 transition-all duration-150"
        >
          <CharacterAvatar
            role="radha"
            size="arena"
            hp={radhaData?.hp}
            energy={radhaData?.energy}
            shieldActive={radhaData?.shieldActive}
            isAttacking={attackingRole === 'radha'}
            isHit={hitRole === 'radha'}
          />
        </div>

        {/* Arena Ground Floor Line */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#14062a] via-[#100424]/90 to-transparent border-t border-[#e6c887]/20 flex items-center justify-center">
          <div className="w-full max-w-md h-0.5 bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent" />
        </div>
      </div>

      {/* SPECIAL COMBO & WAVE ALERT OVERLAY BANNER */}
      <AnimatePresence>
        {(bannerMessage || waveAlert) && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-20 inset-x-4 z-40 flex justify-center pointer-events-none"
          >
            <div className="px-5 py-2.5 rounded-2xl bg-[#140728]/95 backdrop-blur-xl border border-[#ffd700]/60 shadow-[0_10px_35px_rgba(255,215,0,0.35)] text-center text-xs sm:text-sm font-semibold text-[#f5e4be]">
              {bannerMessage || waveAlert}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM CONTROLS BAR: Ability Buttons & Mobile Movement */}
      <footer className="relative z-20 w-full px-3 py-3 sm:px-6 sm:py-4 bg-[#120524]/95 backdrop-blur-md border-t border-[#e6c887]/25 flex flex-col items-center gap-3">
        {/* Ability Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-2xl">
          {charConfig.powers.map((power) => {
            const Icon = ICON_MAP[power.icon] || Sparkles
            const remainingCd = getRemainingCooldown(power)
            const hasEnergy = (myPlayer?.energy || 0) >= power.energy
            const isReady = remainingCd === 0 && hasEnergy

            return (
              <button
                key={power.key}
                type="button"
                onClick={() => handleAbilityTrigger(power)}
                disabled={!isReady}
                className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl border transition-all duration-150 active:scale-95 min-h-[64px] sm:min-h-[72px] ${
                  isReady
                    ? isIndransh
                      ? 'bg-[#1a0830] hover:bg-[#230b42] border-[#e6c887]/50 shadow-[0_0_15px_rgba(230,200,135,0.25)] text-[#f5e4be]'
                      : 'bg-[#1a0830] hover:bg-[#230b42] border-[#f29bb2]/50 shadow-[0_0_15px_rgba(242,155,178,0.25)] text-[#f29bb2]'
                    : 'bg-[#10041e]/70 border-[#e6c887]/15 text-[#e6c887]/40 cursor-not-allowed opacity-60'
                }`}
              >
                {/* Hotkey Badge (Desktop) */}
                <span className="absolute top-1 left-2 text-[9px] font-mono font-bold opacity-60">
                  {power.hotkey}
                </span>

                {/* Energy Badge */}
                <span className="absolute top-1 right-2 text-[9px] font-mono text-[#ffd700]">
                  ⚡{power.energy}
                </span>

                <Icon size={18} className="my-0.5" />
                <span className="text-[10px] sm:text-xs font-semibold truncate max-w-[85px] sm:max-w-none text-center">
                  {power.name}
                </span>

                {/* Cooldown Sweep Overlay */}
                {remainingCd > 0 && (
                  <div className="absolute inset-0 rounded-2xl bg-black/75 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-[#ffd700]">
                      {(remainingCd / 1000).toFixed(1)}s
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Movement Controls Bar (Touch & Click Friendly) */}
        <div className="flex items-center justify-between w-full max-w-md pt-1">
          <button
            type="button"
            onClick={() => onMove(Math.max(10, (myPlayer?.x || 50) - 6))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18082c] hover:bg-[#200b3b] border border-[#e6c887]/30 text-xs font-semibold text-[#f5e4be] active:scale-90 transition"
          >
            <ArrowLeft size={14} /> Move Left
          </button>

          <span className="text-[10px] text-[#e6c887]/60 text-center hidden xs:inline">
            A/D or Arrows to move • Q/W/E/R to attack
          </span>

          <button
            type="button"
            onClick={() => onMove(Math.min(90, (myPlayer?.x || 50) + 6))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18082c] hover:bg-[#200b3b] border border-[#e6c887]/30 text-xs font-semibold text-[#f5e4be] active:scale-90 transition"
          >
            Move Right <ArrowRight size={14} />
          </button>
        </div>
      </footer>
    </div>
  )
}
