import { useEffect, useRef } from 'react'

export default function CitySkylineCanvas({
  activeWishes = [],
  triggerSpecialFirework = null,
  onFireworkExplode = null
}) {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const isVisibleRef = useRef(false)
  const bgCanvasRef = useRef(null)

  const stateRef = useRef({
    particles: [],
    rockets: [],
    anars: [],
    cityBuildings: [],
    distantMountains: [],
    stars: [],
    skyFlashes: [],
    lastTime: 0,
    width: 0,
    height: 0,
    dpr: 1
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    const state = stateRef.current

    // Offscreen Canvas for pre-rendering static skyline & mountains
    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement('canvas')
    }
    const bgCanvas = bgCanvasRef.current
    const bgCtx = bgCanvas.getContext('2d')

    // Resize handler with mobile-optimized DPR
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      const isMobile = window.innerWidth < 768
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2)
      state.dpr = dpr
      state.width = rect.width
      state.height = rect.height

      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      bgCanvas.width = canvas.width
      bgCanvas.height = canvas.height
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      initBackground(state.width, state.height, isMobile)
      prerenderStaticSkyline(state.width, state.height)
    }

    const initBackground = (w, h, isMobile) => {
      // 1. Stars in upper sky (reduced count on mobile)
      state.stars = []
      const starDensity = isMobile ? 0.06 : 0.11
      const starCount = Math.floor(w * starDensity)
      for (let i = 0; i < starCount; i++) {
        state.stars.push({
          x: Math.random() * w,
          y: Math.random() * (h * 0.52),
          r: Math.random() * 1.1 + 0.4,
          alpha: Math.random() * 0.6 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2
        })
      }

      // 2. Distant Mountains (2 layers)
      state.distantMountains = []
      // Layer 1 (Far)
      const m1 = []
      const step1 = isMobile ? 45 : 35
      for (let x = 0; x <= w + 45; x += step1) {
        const y = h * 0.52 + Math.sin(x * 0.003) * 32 + Math.cos(x * 0.008) * 18
        m1.push({ x, y })
      }
      state.distantMountains.push({ points: m1, color: '#0d061c', alpha: 0.9 })

      // Layer 2 (Mid-distance)
      const m2 = []
      const step2 = isMobile ? 40 : 30
      for (let x = 0; x <= w + 40; x += step2) {
        const y = h * 0.58 + Math.sin(x * 0.005 + 1) * 28 + Math.sin(x * 0.012) * 14
        m2.push({ x, y })
      }
      state.distantMountains.push({ points: m2, color: '#130826', alpha: 1 })

      // 3. Sprawling City Buildings & Skyline
      state.cityBuildings = []
      let curX = 0
      const horizonY = h * 0.65

      while (curX < w) {
        const bw = Math.floor(Math.random() * 30 + (isMobile ? 24 : 20))
        const bh = Math.floor(Math.random() * (isMobile ? 65 : 85) + 38)
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
                color: Math.random() < 0.4 ? '#ffe79a' : Math.random() < 0.7 ? '#ffc857' : '#ffd700'
              })
            }
          }
        }

        const hasDiya = Math.random() < 0.4
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
          shikharHeight: isTemple ? Math.floor(Math.random() * 22 + 12) : 0
        })

        curX += bw + Math.floor(Math.random() * 4)
      }
    }

    // Pre-render static elements (mountains + haze + buildings + windows) onto offscreen canvas
    const prerenderStaticSkyline = (w, h) => {
      bgCtx.clearRect(0, 0, w, h)

      // 1. Distant Mountains
      state.distantMountains.forEach((m) => {
        bgCtx.save()
        bgCtx.fillStyle = m.color
        bgCtx.globalAlpha = m.alpha
        bgCtx.beginPath()
        bgCtx.moveTo(0, h)
        m.points.forEach((p, idx) => {
          if (idx === 0) bgCtx.lineTo(p.x, p.y)
          else bgCtx.lineTo(p.x, p.y)
        })
        bgCtx.lineTo(w, h)
        bgCtx.closePath()
        bgCtx.fill()
        bgCtx.restore()
      })

      // 2. City Atmospheric Warm Haze
      const cityHaze = bgCtx.createLinearGradient(0, h * 0.5, 0, h * 0.68)
      cityHaze.addColorStop(0, 'rgba(255, 180, 50, 0)')
      cityHaze.addColorStop(1, 'rgba(255, 170, 40, 0.16)')
      bgCtx.fillStyle = cityHaze
      bgCtx.fillRect(0, h * 0.5, w, h * 0.2)

      // 3. City Buildings & Windows
      state.cityBuildings.forEach((b) => {
        bgCtx.fillStyle = '#0f051c'
        bgCtx.fillRect(b.x, b.y, b.w, b.h + 20)

        // Temple Shikhar
        if (b.isTemple) {
          bgCtx.beginPath()
          bgCtx.moveTo(b.x + b.w * 0.5, b.y - b.shikharHeight)
          bgCtx.lineTo(b.x, b.y)
          bgCtx.lineTo(b.x + b.w, b.y)
          bgCtx.closePath()
          bgCtx.fillStyle = '#16082b'
          bgCtx.fill()

          // Golden Kalash pin
          bgCtx.fillStyle = '#ffd700'
          bgCtx.beginPath()
          bgCtx.arc(b.x + b.w * 0.5, b.y - b.shikharHeight, 2, 0, Math.PI * 2)
          bgCtx.fill()
        }

        // Windows (all drawn once into cache)
        b.windows.forEach((win) => {
          bgCtx.fillStyle = win.color
          bgCtx.fillRect(win.x, win.y, 4, 5)
        })
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Firework Palettes
    const PALETTES = [
      ['#ffd700', '#ffb703', '#ffffff', '#fb8500'],
      ['#ff4d8d', '#f72585', '#ffd700', '#ffffff'],
      ['#a855f7', '#ec4899', '#f59e0b', '#ffffff'],
      ['#06d6a0', '#118ab2', '#ffd166', '#ffffff'],
      ['#ff0055', '#ff5400', '#ffbd00', '#ffffff']
    ]

    const launchRocket = (targetX = null, targetY = null, type = 'normal') => {
      const isMobile = state.width < 640
      const startX = targetX !== null ? targetX : Math.random() * (state.width * 0.75) + state.width * 0.12
      const startY = state.height * 0.64
      const destY = targetY !== null ? targetY : Math.random() * (state.height * 0.36) + state.height * 0.08
      const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)]

      state.rockets.push({
        x: startX,
        y: startY,
        startX,
        destY,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 2.5 + (isMobile ? 5.5 : 6.5)),
        palette,
        type,
        trail: []
      })
    }

    const explodeRocket = (rocket) => {
      const isMobile = state.width < 640
      const count = rocket.type === 'heart' ? (isMobile ? 36 : 65) : (isMobile ? 28 : 55)
      const palette = rocket.palette

      // Sky Ambient Flash
      state.skyFlashes.push({
        x: rocket.x,
        y: rocket.y,
        color: palette[0],
        alpha: 0.3,
        radius: isMobile ? 80 : 120
      })

      if (onFireworkExplode) onFireworkExplode(rocket.type)

      if (rocket.type === 'heart') {
        for (let i = 0; i < count; i++) {
          const t = (Math.PI * 2 * i) / count
          const hx = 16 * Math.pow(Math.sin(t), 3)
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))

          state.particles.push({
            x: rocket.x,
            y: rocket.y,
            vx: hx * (isMobile ? 0.18 : 0.22) + (Math.random() - 0.5) * 0.2,
            vy: hy * (isMobile ? 0.18 : 0.22) + (Math.random() - 0.5) * 0.2,
            color: Math.random() < 0.6 ? '#ff4d8d' : '#ffd700',
            alpha: 1,
            decay: Math.random() * 0.014 + 0.012,
            size: isMobile ? 2 : 2.5,
            gravity: 0.025
          })
        }
      } else {
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * (isMobile ? 2.8 : 3.5) + 1.0
          state.particles.push({
            x: rocket.x,
            y: rocket.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: palette[Math.floor(Math.random() * palette.length)],
            alpha: 1,
            decay: Math.random() * 0.016 + 0.012,
            size: isMobile ? 1.8 : 2.4,
            gravity: 0.035
          })
        }
      }
    }

    const launchAnar = (x, y) => {
      const isMobile = state.width < 640
      const count = isMobile ? 8 : 15
      for (let i = 0; i < count; i++) {
        state.anars.push({
          x: x + (Math.random() - 0.5) * 3,
          y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(Math.random() * 3 + 2.2),
          alpha: 1,
          decay: Math.random() * 0.045 + 0.025,
          color: Math.random() < 0.8 ? '#ffd700' : '#ffffff',
          size: Math.random() * 1.8 + 1
        })
      }
    }

    let rocketTimer = 0
    let anarTimer = 0

    // Animation Loop with zero-shadowBlur high-speed rendering
    const render = (time) => {
      if (!isVisibleRef.current || document.hidden) {
        animFrameRef.current = requestAnimationFrame(render)
        return
      }

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

      // 3. Sky Flashes (from explosions)
      for (let i = state.skyFlashes.length - 1; i >= 0; i--) {
        const f = state.skyFlashes[i]
        f.alpha -= dt * 1.3
        if (f.alpha <= 0) {
          state.skyFlashes.splice(i, 1)
          continue
        }

        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius)
        grad.addColorStop(0, f.color)
        grad.addColorStop(1, 'transparent')
        ctx.globalAlpha = f.alpha * 0.35
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // 4. Blit Pre-rendered Static Mountains & City Buildings
      if (bgCanvas) {
        ctx.drawImage(bgCanvas, 0, 0, w, h)
      }

      // 5. Rooftop Diyas Flickering (dynamic flame top)
      state.cityBuildings.forEach((b) => {
        if (b.hasDiya) {
          const flameA = 0.65 + Math.sin(time * 0.008 + b.x) * 0.35
          ctx.fillStyle = `rgba(255, 180, 50, ${flameA})`
          ctx.beginPath()
          ctx.arc(b.x + b.w * 0.5, b.y - 1, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // 6. Rockets Animation
      for (let i = state.rockets.length - 1; i >= 0; i--) {
        const r = state.rockets[i]
        r.x += r.vx
        r.y += r.vy
        r.vy += 0.04

        r.trail.push({ x: r.x, y: r.y })
        if (r.trail.length > 5) r.trail.shift()

        ctx.strokeStyle = '#ffd700'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        r.trail.forEach((t, idx) => {
          if (idx === 0) ctx.moveTo(t.x, t.y)
          else ctx.lineTo(t.x, t.y)
        })
        ctx.stroke()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(r.x, r.y, 1.5, 0, Math.PI * 2)
        ctx.fill()

        if (r.y <= r.destY || r.vy >= -1) {
          explodeRocket(r)
          state.rockets.splice(i, 1)
        }
      }

      // 7. Firework Particles (High performance two-pass glow, no shadowBlur)
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

        // Soft Outer Halo
        ctx.globalAlpha = p.alpha * 0.35
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fill()

        // Brilliant Center Core
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // 8. Anar Fountain Sparks (High speed alpha particles)
      for (let i = state.anars.length - 1; i >= 0; i--) {
        const a = state.anars[i]
        a.x += a.vx
        a.y += a.vy
        a.vy += 0.12
        a.alpha -= a.decay

        if (a.alpha <= 0) {
          state.anars.splice(i, 1)
          continue
        }

        ctx.globalAlpha = a.alpha
        ctx.fillStyle = a.color
        ctx.beginPath()
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // 9. Sky Lanterns (Wishes Rising)
      activeWishes.forEach((wObj, idx) => {
        const lX = ((idx * 67 + 25) % (w * 0.7)) + w * 0.15
        const lY = Math.max(h * 0.08, h * 0.5 - (time * 0.016 + idx * 80) % (h * 0.45))
        const sway = Math.sin(time * 0.002 + idx) * 7

        const lGrad = ctx.createRadialGradient(lX + sway, lY, 2, lX + sway, lY, 15)
        lGrad.addColorStop(0, 'rgba(255, 215, 0, 0.95)')
        lGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.5)')
        lGrad.addColorStop(1, 'rgba(255, 69, 0, 0)')

        ctx.fillStyle = lGrad
        ctx.beginPath()
        ctx.arc(lX + sway, lY, 15, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffb703'
        ctx.fillRect(lX + sway - 5, lY - 6, 10, 12)
        ctx.fillStyle = '#fff3b0'
        ctx.fillRect(lX + sway - 3, lY - 4, 6, 8)
      })

      // Spawner timers
      const isMobile = w < 640
      rocketTimer += dt
      if (rocketTimer > (isMobile ? 3.4 : 2.8)) {
        rocketTimer = 0
        const isHeart = Math.random() < 0.28
        launchRocket(null, null, isHeart ? 'heart' : 'normal')
      }

      anarTimer += dt
      if (anarTimer > (isMobile ? 2.2 : 1.6)) {
        anarTimer = 0
        const b = state.cityBuildings.find((item) => item.hasAnar)
        if (b) launchAnar(b.x + b.w * 0.5, b.y)
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    // IntersectionObserver: Only render when section is visible in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting && !animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(render)
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(canvas)

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [activeWishes])

  // External trigger for synchronized Heart firework
  useEffect(() => {
    if (!triggerSpecialFirework) return
    const state = stateRef.current
    if (!state.width) return

    state.rockets.push({
      x: state.width * 0.5,
      y: state.height * 0.65,
      startX: state.width * 0.5,
      destY: state.height * 0.18,
      vx: 0,
      vy: -(state.width < 640 ? 7 : 8.5),
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
