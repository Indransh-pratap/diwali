import { useEffect, useRef } from 'react'

export default function CitySkylineCanvas({
  activeWishes = [],
  triggerSpecialFirework = null,
  onFireworkExplode = null
}) {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const stateRef = useRef({
    particles: [],
    rockets: [],
    anars: [],
    chakris: [],
    lanterns: [],
    cityBuildings: [],
    distantMountains: [],
    stars: [],
    skyFlashes: [],
    lastTime: 0,
    width: 0,
    height: 0
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const state = stateRef.current

    // Resize handler
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      state.width = rect.width
      state.height = rect.height
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      initBackground(state.width, state.height)
    }

    const initBackground = (w, h) => {
      // 1. Stars in the upper sky
      state.stars = []
      const starCount = Math.floor(w * 0.12)
      for (let i = 0; i < starCount; i++) {
        state.stars.push({
          x: Math.random() * w,
          y: Math.random() * (h * 0.55),
          r: Math.random() * 1.2 + 0.4,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2
        })
      }

      // 2. Distant Mountains (2 layers)
      state.distantMountains = []
      // Layer 1 (Far)
      const m1 = []
      for (let x = 0; x <= w + 40; x += 35) {
        const y = h * 0.52 + Math.sin(x * 0.003) * 35 + Math.cos(x * 0.008) * 20
        m1.push({ x, y })
      }
      state.distantMountains.push({ points: m1, color: '#0d061c', alpha: 0.9 })

      // Layer 2 (Mid-distance)
      const m2 = []
      for (let x = 0; x <= w + 40; x += 30) {
        const y = h * 0.58 + Math.sin(x * 0.005 + 1) * 30 + Math.sin(x * 0.012) * 15
        m2.push({ x, y })
      }
      state.distantMountains.push({ points: m2, color: '#130826', alpha: 1 })

      // 3. Sprawling City Buildings & Skyline
      state.cityBuildings = []
      let curX = 0
      const horizonY = h * 0.65

      while (curX < w) {
        const bw = Math.floor(Math.random() * 32 + 20)
        const bh = Math.floor(Math.random() * 85 + 40)
        const by = horizonY - bh

        // Window grid
        const windows = []
        const cols = Math.floor(bw / 7)
        const rows = Math.floor(bh / 9)

        for (let r = 1; r < rows - 1; r++) {
          for (let c = 1; c < cols - 1; c++) {
            if (Math.random() < 0.65) {
              windows.push({
                x: curX + c * 7,
                y: by + r * 9,
                color: Math.random() < 0.4 ? '#ffe79a' : Math.random() < 0.7 ? '#ffc857' : '#ffd700',
                glow: Math.random() < 0.2
              })
            }
          }
        }

        // Rooftop Diya or Ladi (string lights)
        const hasDiya = Math.random() < 0.45
        const hasAnar = Math.random() < 0.12
        const isTemple = Math.random() < 0.08

        state.cityBuildings.push({
          x: curX,
          y: by,
          w: bw,
          h: bh,
          windows,
          hasDiya,
          hasAnar,
          isTemple,
          shikharHeight: isTemple ? Math.floor(Math.random() * 25 + 15) : 0
        })

        curX += bw + Math.floor(Math.random() * 4)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Firework Color Palettes
    const PALETTES = [
      ['#ffd700', '#ffb703', '#ffffff', '#fb8500'], // Golden Luxury
      ['#ff4d8d', '#f72585', '#ffd700', '#ffffff'], // Romantic Pink & Gold
      ['#7209b7', '#b5179e', '#f72585', '#4cc9f0'], // Mystic Purple & Rose
      ['#06d6a0', '#118ab2', '#ffd166', '#ffffff'], // Emerald Sparkle
      ['#ff0055', '#ff5400', '#ffbd00', '#ffffff']  // Sunset Flame
    ]

    // Spawn a rocket from the city
    const launchRocket = (targetX = null, targetY = null, type = 'normal') => {
      const startX = targetX !== null ? targetX : Math.random() * (state.width * 0.75) + state.width * 0.12
      const startY = state.height * 0.64
      const destY = targetY !== null ? targetY : Math.random() * (state.height * 0.38) + state.height * 0.08
      const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)]

      state.rockets.push({
        x: startX,
        y: startY,
        startX,
        destY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(Math.random() * 3 + 6.5),
        palette,
        type, // 'normal' | 'heart' | 'chrysanthemum'
        trail: []
      })
    }

    // Explode a rocket into particles
    const explodeRocket = (rocket) => {
      const count = rocket.type === 'heart' ? 75 : 65
      const palette = rocket.palette

      // Trigger Sky Ambient Flash
      state.skyFlashes.push({
        x: rocket.x,
        y: rocket.y,
        color: palette[0],
        alpha: 0.35,
        radius: Math.random() * 120 + 90
      })

      if (onFireworkExplode) onFireworkExplode(rocket.type)

      if (rocket.type === 'heart') {
        // Parametric Heart Formula
        for (let i = 0; i < count; i++) {
          const t = (Math.PI * 2 * i) / count
          const hx = 16 * Math.pow(Math.sin(t), 3)
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))

          state.particles.push({
            x: rocket.x,
            y: rocket.y,
            vx: hx * 0.22 + (Math.random() - 0.5) * 0.3,
            vy: hy * 0.22 + (Math.random() - 0.5) * 0.3,
            color: Math.random() < 0.6 ? '#ff4d8d' : '#ffd700',
            alpha: 1,
            decay: Math.random() * 0.012 + 0.012,
            size: Math.random() * 2.5 + 1.5,
            gravity: 0.03
          })
        }
      } else {
        // Classic spherical burst
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 3.5 + 1.2
          state.particles.push({
            x: rocket.x,
            y: rocket.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: palette[Math.floor(Math.random() * palette.length)],
            alpha: 1,
            decay: Math.random() * 0.014 + 0.01,
            size: Math.random() * 2.8 + 1.2,
            gravity: 0.04
          })
        }
      }
    }

    // Spawn an Anar fountain from rooftop
    const launchAnar = (x, y) => {
      for (let i = 0; i < 18; i++) {
        state.anars.push({
          x: x + (Math.random() - 0.5) * 4,
          y,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -(Math.random() * 3.5 + 2.5),
          alpha: 1,
          decay: Math.random() * 0.04 + 0.02,
          color: Math.random() < 0.8 ? '#ffd700' : '#ffffff',
          size: Math.random() * 2 + 1
        })
      }
    }

    // Periodic organic spawners
    let rocketTimer = 0
    let anarTimer = 0

    // Main 60fps Animation Loop
    const render = (time) => {
      const dt = Math.min((time - state.lastTime) / 1000, 0.1) || 0.016
      state.lastTime = time
      const w = state.width
      const h = state.height

      // 1. Midnight Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7)
      skyGrad.addColorStop(0, '#06020f')
      skyGrad.addColorStop(0.35, '#120524')
      skyGrad.addColorStop(0.7, '#240b3b')
      skyGrad.addColorStop(1, '#3a1250')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, w, h)

      // 2. Stars
      state.stars.forEach((s) => {
        s.phase += s.twinkleSpeed
        const a = s.alpha + Math.sin(s.phase) * 0.25
        ctx.fillStyle = `rgba(255, 248, 220, ${Math.max(0.1, Math.min(1, a))})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // 3. Sky Flashes (from large firework detonations)
      for (let i = state.skyFlashes.length - 1; i >= 0; i--) {
        const f = state.skyFlashes[i]
        f.alpha -= dt * 1.2
        if (f.alpha <= 0) {
          state.skyFlashes.splice(i, 1)
          continue
        }

        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius)
        grad.addColorStop(0, f.color)
        grad.addColorStop(1, 'transparent')
        ctx.save()
        ctx.globalAlpha = f.alpha * 0.4
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 4. Distant Mountains
      state.distantMountains.forEach((m) => {
        ctx.save()
        ctx.fillStyle = m.color
        ctx.globalAlpha = m.alpha
        ctx.beginPath()
        ctx.moveTo(0, h)
        m.points.forEach((p, idx) => {
          if (idx === 0) ctx.lineTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.lineTo(w, h)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      })

      // 5. City Atmospheric Warm Haze / Glow
      const cityHaze = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.68)
      cityHaze.addColorStop(0, 'rgba(255, 180, 50, 0)')
      cityHaze.addColorStop(1, 'rgba(255, 170, 40, 0.18)')
      ctx.fillStyle = cityHaze
      ctx.fillRect(0, h * 0.5, w, h * 0.2)

      // 6. City Buildings & Windows
      state.cityBuildings.forEach((b) => {
        // Building Base Silhouette
        ctx.fillStyle = '#0f051c'
        ctx.fillRect(b.x, b.y, b.w, b.h + 20)

        // Temple Shikhar / Dome
        if (b.isTemple) {
          ctx.beginPath()
          ctx.moveTo(b.x + b.w * 0.5, b.y - b.shikharHeight)
          ctx.lineTo(b.x, b.y)
          ctx.lineTo(b.x + b.w, b.y)
          ctx.closePath()
          ctx.fillStyle = '#16082b'
          ctx.fill()

          // Golden Kalash pin at temple tip
          ctx.fillStyle = '#ffd700'
          ctx.beginPath()
          ctx.arc(b.x + b.w * 0.5, b.y - b.shikharHeight, 2, 0, Math.PI * 2)
          ctx.fill()
        }

        // Windows
        b.windows.forEach((win) => {
          ctx.fillStyle = win.color
          ctx.fillRect(win.x, win.y, 4, 5)
        })

        // Rooftop Diya
        if (b.hasDiya) {
          const flameA = 0.7 + Math.sin(time * 0.008 + b.x) * 0.3
          ctx.fillStyle = `rgba(255, 180, 50, ${flameA})`
          ctx.beginPath()
          ctx.arc(b.x + b.w * 0.5, b.y - 1, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // 7. Rockets Animation
      for (let i = state.rockets.length - 1; i >= 0; i--) {
        const r = state.rockets[i]
        r.x += r.vx
        r.y += r.vy
        r.vy += 0.05 // slight drag

        // Rocket Trail
        r.trail.push({ x: r.x, y: r.y, alpha: 1 })
        if (r.trail.length > 8) r.trail.shift()

        ctx.strokeStyle = '#ffd700'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        r.trail.forEach((t, idx) => {
          if (idx === 0) ctx.moveTo(t.x, t.y)
          else ctx.lineTo(t.x, t.y)
        })
        ctx.stroke()

        // Rocket spark head
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(r.x, r.y, 1.8, 0, Math.PI * 2)
        ctx.fill()

        if (r.y <= r.destY || r.vy >= -1) {
          explodeRocket(r)
          state.rockets.splice(i, 1)
        }
      }

      // 8. Firework Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.vx *= 0.985
        p.vy *= 0.985
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          state.particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 9. Anar Fountain Sparks
      for (let i = state.anars.length - 1; i >= 0; i--) {
        const a = state.anars[i]
        a.x += a.vx
        a.y += a.vy
        a.vy += 0.12 // gravity
        a.alpha -= a.decay

        if (a.alpha <= 0) {
          state.anars.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = a.alpha
        ctx.fillStyle = a.color
        ctx.shadowColor = a.color
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 10. Sky Lanterns (Wishes Rising)
      activeWishes.forEach((wObj, idx) => {
        const lX = ((idx * 67 + 25) % (w * 0.7)) + w * 0.15
        const lY = Math.max(h * 0.08, h * 0.5 - (time * 0.018 + idx * 80) % (h * 0.45))
        const sway = Math.sin(time * 0.002 + idx) * 8

        // Lantern Warm Glow
        const lGrad = ctx.createRadialGradient(lX + sway, lY, 2, lX + sway, lY, 16)
        lGrad.addColorStop(0, 'rgba(255, 215, 0, 0.95)')
        lGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.6)')
        lGrad.addColorStop(1, 'rgba(255, 69, 0, 0)')

        ctx.fillStyle = lGrad
        ctx.beginPath()
        ctx.arc(lX + sway, lY, 16, 0, Math.PI * 2)
        ctx.fill()

        // Paper Lantern Rect
        ctx.fillStyle = '#ffb703'
        ctx.fillRect(lX + sway - 5, lY - 6, 10, 12)
        ctx.fillStyle = '#fff3b0'
        ctx.fillRect(lX + sway - 3, lY - 4, 6, 8)
      })

      // Spawner timers
      rocketTimer += dt
      if (rocketTimer > 2.8) {
        rocketTimer = 0
        const isHeart = Math.random() < 0.28
        launchRocket(null, null, isHeart ? 'heart' : 'normal')
      }

      anarTimer += dt
      if (anarTimer > 1.6) {
        anarTimer = 0
        const b = state.cityBuildings.find((item) => item.hasAnar)
        if (b) launchAnar(b.x + b.w * 0.5, b.y)
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [activeWishes])

  // External trigger for synchronized Heart firework
  useEffect(() => {
    if (!triggerSpecialFirework) return
    const state = stateRef.current
    if (!state.width) return

    // Launch massive centered heart rocket
    state.rockets.push({
      x: state.width * 0.5,
      y: state.height * 0.65,
      startX: state.width * 0.5,
      destY: state.height * 0.18,
      vx: 0,
      vy: -8.5,
      palette: ['#ff4d8d', '#ffd700', '#ffffff'],
      type: 'heart',
      trail: []
    })
  }, [triggerSpecialFirework])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 1 }}
    />
  )
}
