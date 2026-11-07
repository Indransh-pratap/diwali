// Procedural Web Audio Ambient Engine for "THE DIWALI SHAAM"
// Mountain breeze, distant fireworks, night ambience, chimes & clinks

class ShaamAudioEngine {
  constructor() {
    this.ctx = null
    this.muted = true // starts muted to respect autoplay policy
    this.volume = 0.5
    this.breezeNode = null
    this.breezeGain = null
    this.isPlayingAmbience = false
    this.cricketTimer = null
    this.fireworkTimer = null
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
    if (this.muted) {
      this.stopAmbience()
    } else {
      this.startAmbience()
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol))
    if (this.breezeGain && this.ctx) {
      this.breezeGain.gain.setValueAtTime(0.08 * this.volume, this.ctx.currentTime)
    }
  }

  // Continuous Gentle Mountain Breeze
  startAmbience() {
    if (this.isPlayingAmbience || this.muted) return
    const ctx = this.init()
    if (!ctx) return

    try {
      // 1. Pink Noise Generator for Mountain Breeze
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05
        b6 = white * 0.115926
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      // Lowpass Filter for soft muffled wind sound
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(320, ctx.currentTime)

      // Slow LFO to simulate gentle mountain wind gusts
      const lfo = ctx.createOscillator()
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime) // slow breath
      const lfoGain = ctx.createGain()
      lfoGain.gain.setValueAtTime(140, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime)

      whiteNoise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      whiteNoise.start()
      lfo.start()

      this.breezeNode = whiteNoise
      this.breezeGain = gain
      this.isPlayingAmbience = true

      // Random gentle crickets / firefly chimes
      this.cricketTimer = setInterval(() => {
        if (!this.muted && Math.random() < 0.45) {
          this.playFireflyChime()
        }
      }, 4000)

      // Random gentle distant fireworks thuds
      this.fireworkTimer = setInterval(() => {
        if (!this.muted && Math.random() < 0.6) {
          this.playDistantFirework()
        }
      }, 5000)
    } catch (e) {
      console.warn('Ambience init error:', e)
    }
  }

  stopAmbience() {
    this.isPlayingAmbience = false
    if (this.breezeNode) {
      try {
        this.breezeNode.stop()
        this.breezeNode.disconnect()
      } catch {}
      this.breezeNode = null
    }
    if (this.cricketTimer) clearInterval(this.cricketTimer)
    if (this.fireworkTimer) clearInterval(this.fireworkTimer)
  }

  // Soft Distant Firework Boom
  playDistantFirework() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(95, now)
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.35)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(220, now)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.12 * this.volume, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.5)
  }

  // Delicate Firefly / Star Chime
  playFireflyChime() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const freqs = [1760, 2093, 2637] // A6, C7, E7
    const freq = freqs[Math.floor(Math.random() * freqs.length)]

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.03 * this.volume, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.65)
  }

  // Chai Cup Clink & Steam
  playChaiClink() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1480, now)
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.18)

    gain.gain.setValueAtTime(0.15 * this.volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.25)
  }

  // Romantic Heart Flutter Chime
  playHeartFlutter() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const chord = [523.25, 659.25, 783.99, 1046.50] // C major celestial

    chord.forEach((f, idx) => {
      const t = now + idx * 0.06
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, t)

      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.1 * this.volume, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + 0.55)
    })
  }

  // Sky Lantern Ascending Harmonic Chord
  playWishAscend() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const chord = [440, 554.37, 659.25, 880] // A major warmth

    chord.forEach((f) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now)
      osc.frequency.linearRampToValueAtTime(f * 1.08, now + 1.2) // slight rising pitch

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.09 * this.volume, now + 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 1.35)
    })
  }

  // Hand Holding Warm Resonance
  playHoldHandsChord() {
    if (this.muted) return
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime
    const chord = [329.63, 392.00, 493.88, 659.25] // E minor emotional warmth

    chord.forEach((f) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.12 * this.volume, now + 0.2)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 1.9)
    })
  }
}

export const shaamAudio = new ShaamAudioEngine()
