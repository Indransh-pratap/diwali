import { useEffect, useRef } from 'react'
import { festiveAudio } from '../utils/festiveSoundEngine'

export default function FestiveFireworksCanvas({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = null
    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    // Palette: Champagne gold, amber, rose pink, warm yellow, soft lavender
    const aerialHues = [38, 48, 25, 335, 350, 275]

    let aerialParticles = []
    let aerialRockets = []
    let anarParticles = []
    let chakriParticles = []

    // State for Anar fountain and Chakri
    let anarTimer = 0
    let anarActive = false
    let anarDuration = 0
    let chakriTimer = 0
    let chakriActive = false
    let chakriAngle = 0
    let chakriSpinSpeed = 0

    let lastTime = performance.now()
    let lastAerialTime = performance.now()

    // -------------------------------------------------------------------------
    // A. AERIAL FIREWORK HELPERS
    // -------------------------------------------------------------------------
    const launchAerialRocket = (customX, isHeart = false) => {
      const isMobile = W < 640
      const x = customX !== undefined
        ? customX
        : (Math.random() < 0.5 ? Math.random() * (W * 0.3) + W * 0.05 : W * 0.65 + Math.random() * (W * 0.3))

      aerialRockets.push({
        x,
        y: H + 10,
        targetY: H * (0.15 + Math.random() * 0.35),
        vy: -(Math.random() * 2.5 + 7.5),
        hue: aerialHues[Math.floor(Math.random() * aerialHues.length)],
        isHeart,
      })
    }

    const explodeAerial = (x, y, hue, isHeart) => {
      const isMobile = W < 640
      const count = isHeart ? (isMobile ? 65 : 100) : (isMobile ? 45 : 75)

      // Audio cue for distant boom
      festiveAudio.playDistantBoom()

      for (let i = 0; i < count; i++) {
        let vx, vy
        if (isHeart) {
          const t = (Math.PI * 2 * i) / count
          const scale = 16 * Math.pow(Math.sin(t), 3)
          vx = scale * 0.2
          vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.2
        } else {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 3.6 + 1.2
          vx = Math.cos(angle) * speed
          vy = Math.sin(angle) * speed
        }

        aerialParticles.push({
          x,
          y,
          vx,
          vy,
          life: 1.0,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 1.6 + 1.0,
          hue: isHeart ? 340 : hue,
        })
      }
    }

    // -------------------------------------------------------------------------
    // B. ANAR (FOUNTAIN FIREWORK) HELPERS
    // -------------------------------------------------------------------------
    const triggerAnar = () => {
      anarActive = true
      anarDuration = performance.now() + 2400 // bursts for 2.4s
      festiveAudio.playAnarSizzle()
    }

    const emitAnarSparks = (baseX, baseY) => {
      const isMobile = W < 640
      const count = isMobile ? 3 : 5

      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 3.8
        const speedY = -(Math.random() * 7.5 + 6.5)

        anarParticles.push({
          x: baseX + (Math.random() - 0.5) * 6,
          y: baseY,
          vx: spread,
          vy: speedY,
          gravity: 0.14,
          life: 1.0,
          decay: Math.random() * 0.025 + 0.018,
          size: Math.random() * 1.8 + 0.8,
          color: Math.random() < 0.35 ? '#ffffff' : Math.random() < 0.7 ? '#ffe28a' : '#ff9a3c',
        })
      }
    }

    // -------------------------------------------------------------------------
    // C. CHAKRI (SPINNING GROUND FIREWORK) HELPERS
    // -------------------------------------------------------------------------
    const triggerChakri = () => {
      chakriActive = true
      chakriSpinSpeed = 0.35
      festiveAudio.playChakriCrackles()
    }

    const emitChakriSparks = (cx, cy) => {
      // 3 tangential nozzles shooting rotating spiral sparks
      for (let arm = 0; arm < 3; arm++) {
        const offset = (arm * Math.PI * 2) / 3
        const theta = chakriAngle + offset
        const speed = Math.random() * 3.5 + 2.8

        // Tangential velocity vector
        const vx = Math.cos(theta + Math.PI / 2) * speed + (Math.random() - 0.5) * 0.8
        const vy = Math.sin(theta + Math.PI / 2) * speed + (Math.random() - 0.5) * 0.8

        chakriParticles.push({
          x: cx + Math.cos(theta) * 10,
          y: cy + Math.sin(theta) * 10,
          vx,
          vy,
          life: 1.0,
          decay: 0.035 + Math.random() * 0.02,
          size: Math.random() * 1.6 + 0.8,
          color: Math.random() < 0.4 ? '#ffffff' : Math.random() < 0.75 ? '#ffe699' : '#ff9a3c',
        })
      }
    }

    // Listen to global celebrate events
    const handleCelebrate = (e) => {
      const amount = e.detail?.amount || 10
      for (let i = 0; i < Math.min(amount, 8); i++) {
        setTimeout(() => {
          launchAerialRocket((i + 0.5) * (W / 6), i % 2 === 0)
        }, i * 180)
      }
      triggerAnar()
      triggerChakri()
    }
    window.addEventListener('diwali:celebrate', handleCelebrate)

    // Initial triggers after gentle delays
    setTimeout(triggerAnar, 1800)
    setTimeout(triggerChakri, 4000)

    // -------------------------------------------------------------------------
    // MAIN RENDER LOOP
    // -------------------------------------------------------------------------
    const render = (time) => {
      animId = requestAnimationFrame(render)

      if (document.hidden) return

      const dt = time - lastTime
      lastTime = time

      // Soft destination-out fade for luminous trails
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(8, 4, 20, 0.22)'
      ctx.fillRect(0, 0, W, H)

      ctx.globalCompositeOperation = 'lighter'

      // 1. AERIAL FIREWORKS SCHEDULING
      if (time - lastAerialTime > (W < 640 ? 3800 : 2800)) {
        lastAerialTime = time
        launchAerialRocket(undefined, Math.random() < 0.3)
      }

      // 2. ANAR FOUNTAIN SCHEDULING
      if (!anarActive && time > anarTimer) {
        triggerAnar()
        anarTimer = time + 8000 + Math.random() * 5000 // every 8-13 seconds
      }
      if (anarActive) {
        if (time < anarDuration) {
          // Bottom-left and Bottom-right Anar fountains
          const leftAnarX = W * (W < 640 ? 0.08 : 0.12)
          const rightAnarX = W * (W < 640 ? 0.92 : 0.88)
          const groundY = H - 15

          emitAnarSparks(leftAnarX, groundY)
          emitAnarSparks(rightAnarX, groundY)

          // Glowing base indicator for Anar
          ctx.fillStyle = 'rgba(255, 154, 60, 0.4)'
          ctx.beginPath()
          ctx.arc(leftAnarX, groundY, 12, 0, Math.PI * 2)
          ctx.arc(rightAnarX, groundY, 12, 0, Math.PI * 2)
          ctx.fill()
        } else {
          anarActive = false
        }
      }

      // 3. CHAKRI SPINNING SCHEDULING
      if (!chakriActive && time > chakriTimer) {
        triggerChakri()
        chakriTimer = time + 11000 + Math.random() * 6000 // every 11-17 seconds
      }
      if (chakriActive) {
        chakriAngle += chakriSpinSpeed
        chakriSpinSpeed *= 0.995 // slow friction
        if (chakriSpinSpeed < 0.05) {
          chakriActive = false
        } else {
          // Bottom corners for Chakri
          const chakriX = W * (W < 640 ? 0.22 : 0.18)
          const chakriY = H - 28
          emitChakriSparks(chakriX, chakriY)

          // Glowing spinning core
          ctx.fillStyle = '#ffe28a'
          ctx.beginPath()
          ctx.arc(chakriX, chakriY, 5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // 4. DRAW AERIAL ROCKETS
      aerialRockets = aerialRockets.filter((r) => r.y > r.targetY)
      aerialRockets.forEach((r) => {
        r.y += r.vy
        ctx.strokeStyle = `hsla(${r.hue}, 100%, 75%, 0.85)`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(r.x, r.y + 18)
        ctx.lineTo(r.x, r.y)
        ctx.stroke()

        if (r.y <= r.targetY + 8) {
          explodeAerial(r.x, r.y, r.hue, r.isHeart)
        }
      })

      // 5. DRAW AERIAL PARTICLES
      aerialParticles = aerialParticles.filter((p) => p.life > 0.02).slice(-600)
      aerialParticles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.035
        p.vx *= 0.985
        p.vy *= 0.985
        p.life -= p.decay

        ctx.fillStyle = `hsla(${p.hue}, 100%, 72%, ${p.life})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // 6. DRAW ANAR PARTICLES
      anarParticles = anarParticles.filter((p) => p.life > 0.02).slice(-450)
      anarParticles.forEach((p) => {
        const prevX = p.x
        const prevY = p.y
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.vx *= 0.98
        p.life -= p.decay

        ctx.strokeStyle = p.color
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.lineWidth = p.size
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
      })
      ctx.globalAlpha = 1.0

      // 7. DRAW CHAKRI PARTICLES
      chakriParticles = chakriParticles.filter((p) => p.life > 0.02).slice(-350)
      chakriParticles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        p.life -= p.decay

        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1.0
    }

    animId = requestAnimationFrame(render)

    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('diwali:celebrate', handleCelebrate)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-10 ${className}`}
      aria-hidden="true"
    />
  )
}
