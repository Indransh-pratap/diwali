import { useEffect, useRef } from 'react'

const hues = [38, 48, 335, 355, 25, 280] // Warm gold, amber, rose, magenta

export default function Fireworks({ rate = 2200, className = '' }) {
  const ref = useRef()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement || document.body
    let W = 0, H = 0, particles = [], rockets = [], raf, last = 0, visible = true, celebration = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = parent.clientWidth || window.innerWidth
      H = parent.clientHeight || window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const explode = (x, y, heart = false) => {
      const hue = hues[Math.floor(Math.random() * hues.length)]
      const count = heart ? 110 : 64
      for (let i = 0; i < count; i++) {
        let hx, hy
        if (heart) {
          const t = (Math.PI * 2 * i) / count
          const scale = 16 * Math.pow(Math.sin(t), 3)
          hx = scale * 0.22
          hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.22
        } else {
          const a = Math.random() * Math.PI * 2
          const speed = Math.random() * 3.8 + 1.2
          hx = Math.cos(a) * speed
          hy = Math.sin(a) * speed
        }

        particles.push({
          x,
          y,
          vx: hx,
          vy: hy,
          life: 1,
          hue: heart ? 340 : hue,
          size: heart ? 2.2 : Math.random() * 1.6 + 1,
        })
      }
    }

    const launch = (customX, heart = false) => {
      let x = customX
      if (x === undefined) {
        // Bias heavily toward left or right sides so center text remains legible
        const isLeft = Math.random() < 0.5
        x = isLeft ? Math.random() * (W * 0.28) + W * 0.04 : W * 0.68 + Math.random() * (W * 0.28)
      }
      rockets.push({
        x,
        y: H + 8,
        targetY: H * (0.12 + Math.random() * 0.32),
        vy: -(7.5 + Math.random() * 2.5),
        hue: hues[Math.floor(Math.random() * hues.length)],
        heart,
      })
    }

    const celebrate = (e) => {
      celebration += e.detail?.amount || 12
      for (let i = 0; i < 4; i++) {
        setTimeout(() => launch((i + 0.5) * (W / 4), i === 1 || i === 3), i * 160)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('diwali:celebrate', celebrate)

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(parent)

    const draw = (time) => {
      raf = requestAnimationFrame(draw)
      if (!visible || document.hidden) return

      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(8, 4, 20, 0.2)'
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      if (time - last > rate) {
        last = time
        launch(undefined, Math.random() < 0.3)
      }

      if (celebration > 0 && Math.random() < 0.18) {
        launch(undefined, Math.random() < 0.4)
        celebration--
      }

      rockets = rockets.filter((r) => r.y > r.targetY)
      rockets.forEach((r) => {
        r.y += r.vy
        ctx.strokeStyle = `hsla(${r.hue},100%,75%,0.85)`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(r.x, r.y + 24)
        ctx.lineTo(r.x, r.y)
        ctx.stroke()
        if (r.y <= r.targetY + 8) {
          explode(r.x, r.y, r.heart)
        }
      })

      particles = particles.filter((p) => p.life > 0.02).slice(-800)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.038
        p.vx *= 0.985
        p.vy *= 0.985
        p.life -= 0.012
        ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.life})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('diwali:celebrate', celebrate)
    }
  }, [rate])

  return (
    <canvas
      ref={ref}
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
