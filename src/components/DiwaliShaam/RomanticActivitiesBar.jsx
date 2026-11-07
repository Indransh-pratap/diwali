import { Heart, Coffee, Sparkles, Flame } from 'lucide-react'
import { triggerHaptic } from '../../utils/haptics'

export default function RomanticActivitiesBar({
  handsHeld = { indransh: false, radha: false },
  myRole = 'indransh',
  onSendHeart,
  onShareChai,
  onOpenWishModal,
  onToggleHoldHands,
  onTriggerFirework
}) {
  const isMyHandHeld = handsHeld[myRole]
  const areBothHeld = handsHeld.indransh && handsHeld.radha

  return (
    <div className="relative z-30 w-full max-w-xl mx-auto px-2 py-2">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-3xl bg-[#140728]/90 backdrop-blur-xl border border-[#e6c887]/35 shadow-[0_15px_45px_rgba(0,0,0,0.85)]">
        {/* A. Send Heart */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(25)
            onSendHeart()
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-[#1f0933] hover:bg-[#2d0e4a] border border-[#ff4d8d]/40 text-[#ff4d8d] hover:text-white transition active:scale-95 text-xs font-semibold shadow-sm"
          title="Send a floating romantic heart"
        >
          <Heart size={14} fill="currentColor" />
          <span>Send Heart</span>
        </button>

        {/* B. Share Chai */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(25)
            onShareChai()
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-[#1f0933] hover:bg-[#2d0e4a] border border-[#d97706]/40 text-[#ffd700] hover:text-white transition active:scale-95 text-xs font-semibold shadow-sm"
          title="Share a steaming cup of cutting chai"
        >
          <Coffee size={14} />
          <span>Share Chai ☕</span>
        </button>

        {/* C. Make a Wish (Sky Lantern) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(25)
            onOpenWishModal()
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-[#1f0933] hover:bg-[#2d0e4a] border border-[#ffd700]/40 text-[#f5e4be] hover:text-[#ffd700] transition active:scale-95 text-xs font-semibold shadow-sm"
          title="Release a glowing wish lantern into the sky"
        >
          <Sparkles size={14} className="text-[#ffd700]" />
          <span>Make a Wish 🏮</span>
        </button>

        {/* D. Hold Hands */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(30)
            onToggleHoldHands()
          }}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-2xl border transition active:scale-95 text-xs font-semibold shadow-sm ${
            areBothHeld
              ? 'bg-gradient-to-r from-[#ffd700] via-[#ff4d8d] to-[#ffd700] text-[#120726] border-white font-bold animate-pulse shadow-[0_0_20px_#ffd700]'
              : isMyHandHeld
              ? 'bg-[#2b1042] border-[#ffd700] text-[#ffd700]'
              : 'bg-[#1f0933] hover:bg-[#2d0e4a] border-[#e6c887]/40 text-[#f5e4be]'
          }`}
          title="Hold hands under the starlit sky"
        >
          <span className="text-sm">🤝</span>
          <span>{areBothHeld ? 'Holding Hands ❤️' : isMyHandHeld ? 'Reaching Out...' : 'Hold Hands'}</span>
        </button>

        {/* E. Watch Fireworks (Full width on mobile grid, flex item on desktop) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(35)
            onTriggerFirework()
          }}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#e6c887] via-[#ffd700] to-[#e6c887] text-[#120726] hover:brightness-110 transition active:scale-95 text-xs font-bold shadow-[0_0_15px_rgba(255,215,0,0.4)]"
          title="Trigger a synchronized Heart Firework across the skyline"
        >
          <Flame size={14} />
          <span>Watch Fireworks 🎆</span>
        </button>
      </div>
    </div>
  )
}
