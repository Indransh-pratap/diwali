import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Flame } from 'lucide-react'
import { triggerHaptic } from '../utils/haptics'

export default function Sparkler({ side = 'left', label = 'Phuljhadi' }) {
  const [isLit, setIsLit] = useState(false)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])

  const isLeft = side === 'left'
  const tiltDeg = isLeft ? -10 : 10

  const toggleSparkler = () => {
    if (!isLit) {
      triggerHaptic(45)
      setIsLit(true)
      window.dispatchEvent(new CustomEvent('diwali:celebrate', { detail: { amount: 10 } }))
    } else {
      triggerHaptic(20)
      setIsLit(false)
    }
  }

  // Realistic Golden Sparkler Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = (canvas.width = 220)
    const H = (canvas.height = 240)
    const tipX = W / 2
    const tipY = 85 // location of the burning tip on the canvas

    const palette = [
      '#ffffff', // white-hot core
      '#fff8e7',
      '#ffe28a', // brilliant gold
      '#f5c26b',
      '#ffb84d', // warm amber
      '#ff9a3c',
      '#ff5722', // fiery orange spark
      '#ff3d00',
    ]

    const createSpark = () => {
      const angle = Math.random() * Math.PI * 2
      // Varied burst speeds: some fast flying sparks, some soft close sparks
      const speed = Math.random() < 0.25 ? Math.random() * 5 + 3.5 : Math.random() * 3.2 + 1.2
      return {
        x: tipX + (Math.random() - 0.5) * 4,
        y: tipY + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8, // slight upward ejection
        gravity: 0.08 + Math.random() * 0.05,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 1.0,
        decay: Math.random() * 0.035 + 0.02,
        length: Math.random() * 6 + 3,
        size: Math.random() * 1.8 + 0.8,
        twinkle: Math.random() * 0.4 + 0.8,
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, W, H)

      if (isLit) {
        // Emit 4-7 new sparks each frame
        const count = window.innerWidth < 640 ? 4 : 6
        for (let i = 0; i < count; i++) {
          particlesRef.current.push(createSpark())
        }

        // Limit particles to maintain 60 FPS
        if (particlesRef.current.length > 90) {
          particlesRef.current = particlesRef.current.slice(-90)
        }

        // Draw burning tip radiant core flare
        const flicker = Math.random() * 4
        const glowRadius = 14 + flicker

        const coreGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, glowRadius * 2.2)
        coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        coreGlow.addColorStop(0.2, 'rgba(255, 226, 138, 0.85)')
        coreGlow.addColorStop(0.5, 'rgba(255, 154, 60, 0.45)')
        coreGlow.addColorStop(1, 'rgba(255, 87, 34, 0)')

        ctx.fillStyle = coreGlow
        ctx.beginPath()
        ctx.arc(tipX, tipY, glowRadius * 2.2, 0, Math.PI * 2)
        ctx.fill()

        // White-hot center dot
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(tipX, tipY, 3.5 + Math.random() * 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Update & draw flying sparks
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]

        const prevX = p.x
        const prevY = p.y

        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.vx *= 0.96
        p.vy *= 0.96
        p.life -= p.decay

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life * p.twinkle)
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size

        // Draw spark trail streak
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()

        // Draw bright head
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.85, 0, Math.PI * 2)
        ctx.fill()

        // Occasional star flare on spark tip
        if (p.size > 1.8 && Math.random() < 0.2) {
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(p.x - 3, p.y)
          ctx.lineTo(p.x + 3, p.y)
          ctx.moveTo(p.x, p.y - 3)
          ctx.lineTo(p.x, p.y + 3)
          ctx.stroke()
        }

        ctx.restore()
      }

      if (isLit || particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, W, H)
        animRef.current = null
      }
    }

    if (isLit || particlesRef.current.length > 0) {
      animRef.current = requestAnimationFrame(render)
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isLit])

  return (
    <div
      onClick={toggleSparkler}
      role="button"
      tabIndex={0}
      aria-label={`${label} (${isLit ? 'Lit - tap to extinguish' : 'Unlit - tap to light'})`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleSparkler()
        }
      }}
      className="relative flex flex-col items-center cursor-pointer select-none touch-manipulation group p-1 transition-transform active:scale-95 focus:outline-none"
    >
      {/* Status Label (Tap to light / Lit ✨) */}
      <motion.div
        animate={isLit ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-1 z-20"
      >
        {isLit ? (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-sans font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#ff9a3c]/25 border border-[#ffb84d]/70 text-[#ffe28a] shadow-[0_0_15px_rgba(255,154,60,0.6)] backdrop-blur-sm">
            <Sparkles size={11} className="text-[#ffd13b] animate-spin-slow" /> Lit ✨
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-sans font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#140726]/85 border border-[#e6c887]/35 text-[#f5e4be]/85 group-hover:border-[#e6c887] group-hover:text-white transition shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <Flame size={11} className="text-[#ff9a3c] animate-pulse" /> Tap to light
          </span>
        )}
      </motion.div>

      {/* Sparkler Container with SVG and Particle Canvas */}
      <div
        className="relative w-24 sm:w-28 h-48 sm:h-56 flex items-center justify-center"
        style={{ transform: `rotate(${tiltDeg}deg)` }}
      >
        {/* Particle Canvas positioned directly over the burning tip */}
        <canvas
          ref={canvasRef}
          className="absolute -top-10 sm:-top-8 left-1/2 -translate-x-1/2 pointer-events-none z-30"
          style={{ width: '220px', height: '240px' }}
        />

        {/* Ambient Ground / Wall Glow when lit */}
        {isLit && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 sm:w-44 h-32 sm:h-44 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(255,154,60,0.4)_0%,rgba(230,200,135,0.18)_50%,transparent_75%)] blur-lg pointer-events-none animate-pulse" />
        )}

        {/* Realistic Phuljhadi Stick SVG */}
        <svg
          viewBox="0 0 40 180"
          className="w-full h-full overflow-visible filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Metal handle gradient */}
            <linearGradient id={`sparklerHandle-${side}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7a7885" />
              <stop offset="45%" stopColor="#d1d0db" />
              <stop offset="70%" stopColor="#8c8a99" />
              <stop offset="100%" stopColor="#555361" />
            </linearGradient>

            {/* Unlit chemical pyrotechnic coating */}
            <linearGradient id={`sparklerCoat-${side}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3d3745" />
              <stop offset="35%" stopColor="#635970" />
              <stop offset="65%" stopColor="#4c4357" />
              <stop offset="100%" stopColor="#2b2633" />
            </linearGradient>

            {/* Burning chemical coating (incandescent glow) */}
            <linearGradient id={`sparklerCoatLit-${side}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9e3e18" />
              <stop offset="40%" stopColor="#ff9a3c" />
              <stop offset="70%" stopColor="#cf6430" />
              <stop offset="100%" stopColor="#5c1f09" />
            </linearGradient>

            {/* Glowing tip radial gradient */}
            <radialGradient id={`sparklerTipLit-${side}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#ffe28a" />
              <stop offset="70%" stopColor="#ff9a3c" />
              <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Lower Bare Metal Wire (The Handle) */}
          <rect
            x="19"
            y="98"
            width="2.5"
            height="74"
            rx="1.2"
            fill={`url(#sparklerHandle-${side})`}
          />

          {/* Upper Coated Pyrotechnic Compound (The Sparkler Body) */}
          <rect
            x="17"
            y="30"
            width="6.5"
            height="70"
            rx="3"
            fill={isLit ? `url(#sparklerCoatLit-${side})` : `url(#sparklerCoat-${side})`}
            stroke="#201a29"
            strokeWidth="0.5"
          />

          {/* Sparkler Texture Marks (Flecked sparkling compound) */}
          <g opacity={isLit ? 0.9 : 0.45} stroke={isLit ? '#fff1cc' : '#c9a66b'} strokeWidth="0.8">
            <line x1="18" y1="38" x2="21" y2="38" />
            <line x1="19" y1="46" x2="22" y2="46" />
            <line x1="18" y1="54" x2="21" y2="54" />
            <line x1="19" y1="62" x2="22" y2="62" />
            <line x1="18" y1="70" x2="21" y2="70" />
            <line x1="19" y1="78" x2="22" y2="78" />
            <line x1="18" y1="86" x2="21" y2="86" />
            <line x1="19" y1="94" x2="22" y2="94" />
          </g>

          {/* Sparkler Burning Tip */}
          {isLit ? (
            <g className="animate-pulse">
              {/* Outer tip flare */}
              <circle cx="20.25" cy="28" r="9" fill={`url(#sparklerTipLit-${side})`} />
              {/* Hot core tip */}
              <circle cx="20.25" cy="28" r="3.5" fill="#ffffff" />
            </g>
          ) : (
            /* Unlit black match tip */
            <circle cx="20.25" cy="29" r="2.5" fill="#1c1624" stroke="#4a3e5c" strokeWidth="0.8" />
          )}
        </svg>
      </div>
    </div>
  )
}
