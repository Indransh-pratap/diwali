import { useEffect, useRef } from 'react'

export default function PetalsCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let w = 0, h = 0

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Reduced for ultra-smooth mobile performance: 3 on mobile, 6 on desktop
    const count = window.innerWidth < 640 ? 3 : 6
    const petals = Array.from({ length: count }, () => createPetal(true))

    function createPetal(init = false) {
      return {
        x: Math.random() * w,
        y: init ? Math.random() * h : -20,
        size: Math.random() * 6 + 6,
        speedY: Math.random() * 0.5 + 0.25,
        speedX: Math.random() * 0.3 - 0.15,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.015 + 0.008,
        color: Math.random() < 0.3
          ? 'rgba(230, 200, 135, 0.45)' // subtle gold dust
          : 'rgba(242, 155, 178, 0.35)', // soft rose petal
      }
    }

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, w, h)

      petals.forEach((p, idx) => {
        p.y += p.speedY
        p.swayAngle += p.swaySpeed
        p.x += Math.sin(p.swayAngle) * 0.4 + p.speedX
        p.rotation += p.rotSpeed

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size * 0.45, p.size, Math.PI / 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()

        if (p.y > h + 25) {
          petals[idx] = createPetal(false)
        }
      })

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[4]"
      aria-hidden="true"
    />
  )
}
