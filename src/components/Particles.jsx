import { useEffect, useRef } from 'react'
export default function Particles() {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d')
    let W, H, raf
    const rs = () => { W = c.width = innerWidth; H = c.height = innerHeight }
    rs(); addEventListener('resize', rs)
    const mk = (init) => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 20, r: Math.random() * 2 + .5, s: Math.random() * .5 + .15, t: Math.random() * 6, heart: Math.random() < .12, star: Math.random() < .35 })
    let ps = Array.from({ length: Math.min(90, Math.floor(innerWidth / 8)) }, () => mk(true))
    const loop = () => {
      x.clearRect(0, 0, W, H)
      ps.forEach((p, i) => {
        p.y -= p.s; p.t += .03; p.x += Math.sin(p.t) * .3
        const a = .4 + Math.sin(p.t * 2) * .35
        if (p.heart) { x.fillStyle = `rgba(255,159,191,${a})`; x.font = `${p.r * 6 + 6}px serif`; x.fillText('♥', p.x, p.y) }
        else { x.fillStyle = p.star ? `rgba(255,255,255,${a * .8})` : `rgba(245,193,93,${a})`; x.shadowColor = '#f5c15d'; x.shadowBlur = p.star ? 0 : 8; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); x.shadowBlur = 0 }
        if (p.y < -20) ps[i] = mk(false)
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', rs) }
  }, [])
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />
}
