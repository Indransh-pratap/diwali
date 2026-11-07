
import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { MUSIC_SRC } from '../data'

export default function MusicPlayer({ isStarted }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef(null)
  const webAudioRef = useRef(null)

  const wasPlayingRef = useRef(false)
  const hasStartedAudioRef = useRef(false)
  const startingRef = useRef(false)
  const fadeIntervalRef = useRef(null)

  // Music starting position: 1 minute 43 seconds (103 seconds)
  const START_TIME = 103
  const TARGET_VOLUME = 0.55

  // Clear previous fade animation
  const clearFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }
  }

  // Smooth volume fade helper
  const fadeVolume = (audio, target, duration, onEnd) => {
    clearFade()

    const stepTime = 50
    const steps = duration / stepTime
    const delta = (target - audio.volume) / steps

    fadeIntervalRef.current = setInterval(() => {
      const nextVol = audio.volume + delta

      if (
        (delta > 0 && nextVol >= target) ||
        (delta < 0 && nextVol <= target)
      ) {
        audio.volume = target
        clearFade()
        if (onEnd) onEnd()
      } else {
        audio.volume = Math.max(0, Math.min(1, nextVol))
      }
    }, stepTime)
  }

  // Generated romantic ambient soundscape
  const initGeneratedAmbient = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return null

      const ctx = new AudioCtx()

      const master = ctx.createGain()
      master.gain.setValueAtTime(0.001, ctx.currentTime)
      master.connect(ctx.destination)

      // Soft drone chords
      const freqs = [130.81, 196.0, 261.63]

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator()
        osc.type = i === 1 ? 'sine' : 'triangle'
        osc.frequency.setValueAtTime(f, ctx.currentTime)

        const flt = ctx.createBiquadFilter()
        flt.type = 'lowpass'
        flt.frequency.setValueAtTime(420, ctx.currentTime)

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.05, ctx.currentTime)

        osc.connect(flt)
        flt.connect(gain)
        gain.connect(master)

        osc.start()
      })

      // Gentle musical chimes
      const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]

      let chimeInterval = null

      const triggerChime = () => {
        try {
          const now = ctx.currentTime

          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          const filter = ctx.createBiquadFilter()

          const note = scale[Math.floor(Math.random() * scale.length)]

          osc.type = 'sine'
          osc.frequency.setValueAtTime(note, now)

          filter.type = 'lowpass'
          filter.frequency.setValueAtTime(1400, now)

          gain.gain.setValueAtTime(0.0001, now)
          gain.gain.linearRampToValueAtTime(0.04, now + 0.1)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8)

          osc.connect(filter)
          filter.connect(gain)
          gain.connect(master)

          osc.start(now)
          osc.stop(now + 2.9)
        } catch (e) {
          console.error('Chime error:', e)
        }
      }

      return {
        play: () => {
          if (ctx.state === 'suspended') ctx.resume()

          master.gain.cancelScheduledValues(ctx.currentTime)
          master.gain.setTargetAtTime(0.28, ctx.currentTime, 0.5)

          if (!chimeInterval) {
            chimeInterval = setInterval(triggerChime, 2500)
          }
        },

        pause: () => {
          master.gain.cancelScheduledValues(ctx.currentTime)
          master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2)

          clearInterval(chimeInterval)
          chimeInterval = null
        }
      }
    } catch (e) {
      console.error('Web Audio initialization failed:', e)
      return null
    }
  }

  // Wait until audio metadata is available
  const waitForMetadata = (audio) => {
    if (audio.readyState >= 1) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      audio.addEventListener('loadedmetadata', resolve, { once: true })
      audio.addEventListener('error', reject, { once: true })
      audio.load()
    })
  }

  // Main music play function
  const playMusic = async () => {
    if (startingRef.current) return

    startingRef.current = true

    const audio = audioRef.current

    try {
      if (audio && MUSIC_SRC) {
        audio.volume = 0

        // Load audio before seeking
        await waitForMetadata(audio)

        // Start from 1:43 only on the first play
        if (!hasStartedAudioRef.current) {
          if (audio.duration > START_TIME) {
            audio.currentTime = START_TIME
          } else {
            console.warn(
              'Audio is shorter than 1:43. Starting from the beginning.'
            )
            audio.currentTime = 0
          }

          hasStartedAudioRef.current = true
        }

        await audio.play()

        setIsPlaying(true)

        // Smooth cinematic fade-in
        fadeVolume(audio, TARGET_VOLUME, 3000)

      } else {
        throw new Error('Music file not available')
      }

    } catch (error) {
      console.warn('Audio playback fallback:', error)

      if (!webAudioRef.current) {
        webAudioRef.current = initGeneratedAmbient()
      }

      if (webAudioRef.current) {
        webAudioRef.current.play()
        setIsPlaying(true)
      }

    } finally {
      startingRef.current = false
    }
  }

  // Start music on first website interaction
  useEffect(() => {
    if (isStarted && !isPlaying) {
      playMusic()
    }
  }, [isStarted])

  // Toggle play / pause
  const toggleMusic = () => {
    const audio = audioRef.current

    if (isPlaying) {
      clearFade()

      if (audio && !audio.paused) {
        fadeVolume(audio, 0, 500, () => {
          audio.pause()
          setIsPlaying(false)
        })
      } else if (webAudioRef.current) {
        webAudioRef.current.pause()
        setIsPlaying(false)
      }

    } else {
      playMusic()
    }
  }

  // Handle browser tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      const audio = audioRef.current

      if (document.hidden) {
        if (isPlaying) {
          wasPlayingRef.current = true

          clearFade()

          if (audio && !audio.paused) {
            audio.pause()
          }

          if (webAudioRef.current) {
            webAudioRef.current.pause()
          }

          setIsPlaying(false)
        }
      } else {
        if (wasPlayingRef.current) {
          wasPlayingRef.current = false
          playMusic()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      )
    }
  }, [isPlaying])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearFade()

      if (audioRef.current) {
        audioRef.current.pause()
      }

      if (webAudioRef.current) {
        webAudioRef.current.pause()
      }
    }
  }, [])

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
      />

      <button
        type="button"
        onClick={toggleMusic}
        aria-label={
          isPlaying
            ? 'Pause romantic music'
            : 'Play romantic music'
        }
        className="
          fixed
          bottom-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]
          right-4 sm:right-6
          z-50
          flex items-center gap-2.5
          px-4 py-2.5
          rounded-full
          bg-[#120726]/85
          backdrop-blur-[14px]
          border border-[#e6c887]/35
          shadow-[0_10px_35px_rgba(0,0,0,0.65),0_0_20px_rgba(230,200,135,0.18)]
          cursor-pointer
          min-h-[44px]
          transition-transform
          hover:scale-105
          select-none
        "
      >
        {/* Animated Equalizer */}
        <div
          className="flex h-4 items-end gap-[3px] w-4"
          aria-hidden="true"
        >
          {[0, 0.25, 0.5].map((delay, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-[#e6c887]"
              style={{
                height: isPlaying ? undefined : '3px',
                animation: isPlaying
                  ? `barDance ${0.75 + i * 0.15}s ease-in-out infinite alternate`
                  : 'none',
                animationDelay: `${delay}s`
              }}
            />
          ))}
        </div>

        <span className="
          text-xs font-sans font-medium
          uppercase tracking-wider
          text-[#e6c887]
        ">
          {isPlaying ? 'Music' : 'Muted'}
        </span>

        {isPlaying ? (
          <Volume2 size={16} className="text-[#e6c887]" />
        ) : (
          <VolumeX size={16} className="text-[#e6c887]/70" />
        )}

        <style>{`
          @keyframes barDance {
            0% { height: 3px; }
            100% { height: 16px; }
          }
        `}</style>
      </button>
    </>
  )
}
