// Procedural Web Audio Engine for Festive Diwali Soundscape
// Generates 100% original, copyright-free Diwali sounds (crackers, anar, chakri, aerial thuds, lighting chime)

class FestiveSoundEngine {
  constructor() {
    this.ctx = null
    this.ambientGain = null
    this.isMuted = false
    this.volume = 0.35 // Atmospheric, non-intrusive volume
    this.ambientInterval = null
    this.isRunning = false
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
      this.ambientGain = this.ctx.createGain()
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime)
      this.ambientGain.connect(this.ctx.destination)

      return this.ctx
    } catch (e) {
      console.warn('Web Audio Context not available:', e)
      return null
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol))
    if (this.ambientGain && this.ctx && !this.isMuted) {
      this.ambientGain.gain.cancelScheduledValues(this.ctx.currentTime)
      this.ambientGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1)
    }
  }

  setMuted(muted) {
    this.isMuted = muted
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.cancelScheduledValues(this.ctx.currentTime)
      this.ambientGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.1)
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted)
    return this.isMuted
  }

  // 1. GENTLE DIYA LIGHTING SOUND: Friction spark strike + magical warm chime
  playLightingSound() {
    const ctx = this.init()
    if (!ctx) return

    const now = ctx.currentTime

    // A. Match Strike / Spark Friction (Short filtered noise burst)
    try {
      const bufferSize = ctx.sampleRate * 0.08
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(2400, now)
      filter.Q.setValueAtTime(2.5, now)

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.001, now)
      noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.01)
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(this.ambientGain || ctx.destination)

      noise.start(now)
      noise.stop(now + 0.09)
    } catch (e) {}

    // B. Warm Golden Harmonic Chime (Diya coming to life)
    try {
      const freqs = [392.0, 523.25, 659.25, 783.99] // G4, C5, E5, G5 (warm Diwali harmony)
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + 0.04)

        const startT = now + 0.04 + i * 0.03
        gain.gain.setValueAtTime(0.0001, startT)
        gain.gain.linearRampToValueAtTime(0.12 / (i + 1), startT + 0.06)
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + 1.8)

        osc.connect(gain)
        gain.connect(this.ambientGain || ctx.destination)

        osc.start(startT)
        osc.stop(startT + 1.9)
      })
    } catch (e) {}
  }

  // 2. DISTANT DIWALI CRACKER: Soft pop cluster in the distance
  playDistantCracker() {
    const ctx = this.init()
    if (!ctx || this.isMuted) return

    const now = ctx.currentTime
    const popCount = Math.floor(Math.random() * 3) + 2 // 2 to 4 rapid soft pops

    for (let p = 0; p < popCount; p++) {
      const popTime = now + p * (0.04 + Math.random() * 0.06)
      const bufferSize = Math.floor(ctx.sampleRate * 0.06)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(800 + Math.random() * 1200, popTime)
      filter.Q.setValueAtTime(2.0, popTime)

      const gain = ctx.createGain()
      const popVol = (Math.random() * 0.08 + 0.04) * this.volume
      gain.gain.setValueAtTime(popVol, popTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.07)

      source.connect(filter)
      filter.connect(gain)
      gain.connect(this.ambientGain || ctx.destination)

      source.start(popTime)
      source.stop(popTime + 0.08)
    }
  }

  // 3. DISTANT AERIAL FIREWORK THUD: Warm low-passed muffled explosion
  playDistantBoom() {
    const ctx = this.init()
    if (!ctx || this.isMuted) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // Pitch drops from 120Hz to 38Hz (distant sub-bass boom)
    osc.frequency.setValueAtTime(110 + Math.random() * 20, now)
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.7)

    const boomVol = (0.12 + Math.random() * 0.08) * this.volume
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(boomVol, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85)

    osc.connect(gain)
    gain.connect(this.ambientGain || ctx.destination)

    osc.start(now)
    osc.stop(now + 0.9)
  }

  // 4. ANAR FOUNTAIN SIZZLE: Whispering golden spark spray
  playAnarSizzle() {
    const ctx = this.init()
    if (!ctx || this.isMuted) return

    const now = ctx.currentTime
    const duration = 2.2
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate
      // Envelope: ramp up, steady sizzle, then gentle taper
      let env = 1
      if (t < 0.4) env = t / 0.4
      else if (t > 1.6) env = (duration - t) / 0.6
      data[i] = (Math.random() * 2 - 1) * env
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(3600, now)
    filter.Q.setValueAtTime(1.8, now)

    const gain = ctx.createGain()
    const fizzVol = 0.09 * this.volume
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(fizzVol, now + 0.4)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.ambientGain || ctx.destination)

    source.start(now)
    source.stop(now + duration + 0.1)
  }

  // 5. CHAKRI SPINNING CRACKLES: Swirling spatial crackle
  playChakriCrackles() {
    const ctx = this.init()
    if (!ctx || this.isMuted) return

    const now = ctx.currentTime
    const duration = 2.0
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate
      // Rapid flutter modulation to mimic spinning ground wheel
      const mod = 0.5 + 0.5 * Math.sin(t * Math.PI * 18)
      data[i] = (Math.random() * 2 - 1) * mod
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(2800, now)

    const gain = ctx.createGain()
    const chakriVol = 0.08 * this.volume
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(chakriVol, now + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.ambientGain || ctx.destination)

    source.start(now)
    source.stop(now + duration + 0.1)
  }

  // Randomized Festive Ambient Loop: triggers natural occasional sounds
  startFestiveAmbience() {
    if (this.isRunning) return
    this.isRunning = true
    this.init()

    const triggerNext = () => {
      if (!this.isRunning) return

      // Randomly select one subtle festive sound effect
      const rand = Math.random()
      if (rand < 0.38) {
        this.playDistantCracker()
      } else if (rand < 0.65) {
        this.playDistantBoom()
      } else if (rand < 0.85) {
        this.playAnarSizzle()
      } else {
        this.playChakriCrackles()
      }

      // Next sound in 4.5 to 8.5 seconds (natural, gentle spacing)
      const nextDelay = 4500 + Math.random() * 4000
      this.ambientInterval = setTimeout(triggerNext, nextDelay)
    }

    // First sound after a gentle 1.5s delay
    this.ambientInterval = setTimeout(triggerNext, 1500)
  }

  stopFestiveAmbience() {
    this.isRunning = false
    if (this.ambientInterval) {
      clearTimeout(this.ambientInterval)
      this.ambientInterval = null
    }
  }
}

export const festiveAudio = new FestiveSoundEngine()
