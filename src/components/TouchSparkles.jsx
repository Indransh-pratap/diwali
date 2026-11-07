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

    // Sparkle colors: warm Diwali gold, amber, and rose pink
    const colors = [
      '#f5e4be',
      '#e6c887',
      '#d4af37',
      '#ffb84d',
      '#ff9a3c',
      '#f29bb2',
      '#ffffff'
    ]

    const addSparkle = (x, y, count = 1, isBurst = false) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = isBurst
          ? Math.random() * 3.8 + 1.2
          : Math.random() * 1.6 + 0.4

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + (isBurst ? -0.5 : 0.2),
          size: Math.random() * (isBurst ? 3.5 : 2.5) + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.025 + 0.02,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.2
        })
      }

      // Limit particle count to protect mobile performance
      if (particles.length > 120) {
        particles = particles.slice(-120)
      }

      if (!animId) {
        animId = requestAnimationFrame(render)
      }
    }

    const handlePointerDown = (e) => {
      addSparkle(e.clientX, e.clientY, 10, true)
    }

    const handlePointerMove = (e) => {
      // Add subtle trailing sparkles when dragging/moving finger
      if (Math.random() < 0.65) {
        addSparkle(e.clientX, e.clientY, 2, false)
      }
    }

    const handleTouchStart = (e) => {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i]
        addSparkle(touch.clientX, touch.clientY, 12, true)
      }
    }

    const handleTouchMove = (e) => {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i]
        if (Math.random() < 0.7) {
          addSparkle(touch.clientX, touch.clientY, 2, false)
        }
      }
    }

    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    const render = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy += 0.03 // soft gravity
        p.alpha -= p.decay
        p.rotation += p.rotSpeed

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        // Draw a sparkling 4-point star
        ctx.fillStyle = p.color
        ctx.beginPath()
        const s = p.size
        ctx.moveTo(0, -s * 1.8)
        ctx.quadraticCurveTo(0, 0, s * 1.8, 0)
        ctx.quadraticCurveTo(0, 0, 0, s * 1.8)
        ctx.quadraticCurveTo(0, 0, -s * 1.8, 0)
        ctx.quadraticCurveTo(0, 0, 0, -s * 1.8)
        ctx.fill()

        ctx.restore()
      }

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
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
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
