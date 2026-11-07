// Procedural Web Audio Sound Effects for Radha vs Indransh Love War

class GameAudioEngine {
  constructor() {
    this.ctx = null
    this.muted = false
    this.volume = 0.4
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }
      return this.ctx
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return null
      this.ctx = new AudioCtx()
      return this.ctx
    } catch {
      return null
    }
  }

  setMuted(muted) {
    this.muted = muted
  }

  // 1. Attack Hit Impact
  playHitSound() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.15)

    gain.gain.setValueAtTime(0.25 * this.volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  }

  // 2. Heart Magic / Radha's Smile
  playHeartMagicSound() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)

      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + 0.55)
    })
  }

  // 3. Firework / Gussa / Anar Blast
  playFireworkBlastSound() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, now)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.3 * this.volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + 0.25)
  }

  // 4. Chakri Spinning Whoosh
  playChakriSpinSound() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.linearRampToValueAtTime(580, now + 0.25)
    osc.frequency.linearRampToValueAtTime(240, now + 0.5)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, now)

    gain.gain.setValueAtTime(0.12 * this.volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.55)
  }

  // 5. Shield Activate
  playShieldSound() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(260, now)
    osc.frequency.linearRampToValueAtTime(440, now + 0.3)

    gain.gain.setValueAtTime(0.18 * this.volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.5)
  }

  // 6. Victory Fanfare
  playVictorySound() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.18 },
      { f: 1046.5, d: 0.5 }
    ]

    let t = now
    melody.forEach((note) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(note.f, t)

      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.24 * this.volume, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + note.d + 0.05)
      t += note.d * 0.95
    })
  }
}

export const gameAudio = new GameAudioEngine()
