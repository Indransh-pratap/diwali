import { useEffect, useRef } from 'react'

export default function TouchSparkles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    let animId = null
    let particles = []

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', resize)

    const colors = [
      '#f5e4be',
      '#e6c887',
      '#d4af37',
      '#ffb84d',
      '#ff9a3c',
      '#f29bb2',
      '#ffffff'
    ]

    const isMobile = window.innerWidth < 768

    const addSparkle = (x, y, count = 1, isBurst = false) => {
      const maxParticles = isMobile ? 30 : 60
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = isBurst
          ? Math.random() * (isMobile ? 2.5 : 3.5) + 0.8
          : Math.random() * 1.2 + 0.3

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + (isBurst ? -0.4 : 0.15),
          size: Math.random() * (isBurst ? 2.5 : 1.8) + 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.035 + 0.025
        })
      }

      if (particles.length > maxParticles) {
        particles = particles.slice(-maxParticles)
      }

      if (!animId) {
        animId = requestAnimationFrame(render)
      }
    }

    const handlePointerDown = (e) => {
      addSparkle(e.clientX, e.clientY, isMobile ? 5 : 8, true)
    }

    const handlePointerMove = (e) => {
      // Very light trailing sparkler on pointer move (throttled to keep 60fps)
      if (Math.random() < (isMobile ? 0.08 : 0.2)) {
        addSparkle(e.clientX, e.clientY, 1, false)
      }
    }

    // Unified pointer events only (avoids duplicate touchstart + pointerdown triggers)
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    const render = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.95
        p.vy += 0.03
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        // Fast high-performance diamond star without canvas matrix save/restore
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        const s = p.size
        ctx.beginPath()
        ctx.moveTo(p.x, p.y - s * 1.5)
        ctx.lineTo(p.x + s * 0.6, p.y)
        ctx.lineTo(p.x, p.y + s * 1.5)
        ctx.lineTo(p.x - s * 0.6, p.y)
        ctx.closePath()
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (particles.length > 0) {
        animId = requestAnimationFrame(render)
      } else {
        animId = null
      }
    }

    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      aria-hidden="true"
    />
  )
}
