import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { MUSIC_SRC, MUSIC_START_TIME } from '../data'
import { triggerHaptic } from '../utils/haptics'

export default function MusicPlayer({ isStarted = true }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef(null)
  const webAudioRef = useRef(null)

  const wasPlayingRef = useRef(false)
  const hasStartedAudioRef = useRef(false)
  const userMutedRef = useRef(false)
  const startingRef = useRef(false)
  const fadeIntervalRef = useRef(null)

  const START_TIME = MUSIC_START_TIME || 103
  const TARGET_VOLUME = 0.55

  // Clear previous fade animation
  const clearFade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }
  }, [])

  // Smooth volume fade helper
  const fadeVolume = useCallback((audio, target, duration, onEnd) => {
    clearFade()

    const stepTime = 40
    const steps = Math.max(1, duration / stepTime)
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
  }, [clearFade])

  // Seek to chorus start time (1:43 / 103s) safely
  const seekToStartTime = useCallback((audio) => {
    if (hasStartedAudioRef.current) return
    try {
      if (audio.duration && audio.duration > START_TIME) {
        audio.currentTime = START_TIME
        hasStartedAudioRef.current = true
      } else if (audio.readyState >= 1) {
        audio.currentTime = START_TIME
        hasStartedAudioRef.current = true
      }
    } catch (err) {
      console.warn('Seek deferred:', err)
    }
  }, [START_TIME])

  // Setup metadata listener to ensure correct start time
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleMetadata = () => {
      seekToStartTime(audio)
    }

    audio.addEventListener('loadedmetadata', handleMetadata)
    audio.addEventListener('canplay', handleMetadata)

    if (audio.readyState >= 1) {
      seekToStartTime(audio)
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleMetadata)
      audio.removeEventListener('canplay', handleMetadata)
    }
  }, [seekToStartTime])

  // Generated romantic ambient fallback if MP3 fails
  const initGeneratedAmbient = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return null

      const ctx = new AudioCtx()

      const master = ctx.createGain()
      master.gain.setValueAtTime(0.0001, ctx.currentTime)
      master.connect(ctx.destination)

      const freqs = [130.81, 196.0, 261.63]

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator()
        osc.type = i === 1 ? 'sine' : 'triangle'
        osc.frequency.setValueAtTime(f, ctx.currentTime)

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(420, ctx.currentTime)

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.05, ctx.currentTime)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(master)

        osc.start()
      })

      const scale = [261.63, 293.66, 329.63, 392, 440, 523.25]

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
        play: async () => {
          if (ctx.state === 'suspended') {
            await ctx.resume()
          }

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

  // Main play function
  const playMusic = useCallback(async () => {
    if (startingRef.current || userMutedRef.current) return

    const audio = audioRef.current
    if (!audio || !MUSIC_SRC) return

    if (!audio.paused && isPlaying) return

    startingRef.current = true

    try {
      seekToStartTime(audio)

      // Start at gentle volume and quickly fade up so sound is heard immediately
      if (!audio.volume || audio.volume < 0.2) {
        audio.volume = 0.2
      }

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        await playPromise
      }

      // Stop fallback if real music plays
      if (webAudioRef.current) {
        webAudioRef.current.pause()
      }

      setIsPlaying(true)
      userMutedRef.current = false
      fadeVolume(audio, TARGET_VOLUME, 1200)

    } catch (error) {
      // Browser autoplay policy might block unmuted audio without a user gesture.
      // This is expected and handled seamlessly by the global interaction listeners.
      console.log('Autoplay deferred until user interaction:', error?.name || error)
    } finally {
      startingRef.current = false
    }
  }, [fadeVolume, isPlaying, seekToStartTime])

  // 1. Attempt autoplay immediately when website opens
  useEffect(() => {
    playMusic()
  }, [playMusic])

  // 2. Global first-interaction fallback (touch, click, scroll, keypress anywhere on screen)
  useEffect(() => {
    if (isPlaying) return

    const handleUserInteraction = () => {
      if (userMutedRef.current) return
      const audio = audioRef.current
      if (audio && audio.paused) {
        playMusic()
      }
    }

    const events = [
      'pointerdown',
      'touchstart',
      'touchend',
      'click',
      'keydown',
      'scroll',
      'wheel'
    ]

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, {
        capture: true,
        passive: true
      })
      document.addEventListener(evt, handleUserInteraction, {
        capture: true,
        passive: true
      })
    })

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction, { capture: true })
        document.removeEventListener(evt, handleUserInteraction, { capture: true })
      })
    }
  }, [isPlaying, playMusic])

  // 3. Listen for custom 'request-music-play' event (e.g. from Intro diya click)
  useEffect(() => {
    const handleRequest = () => {
      if (!userMutedRef.current) {
        playMusic()
      }
    }

    window.addEventListener('request-music-play', handleRequest)
    return () => {
      window.removeEventListener('request-music-play', handleRequest)
    }
  }, [playMusic])

  // 4. Watch isStarted prop (if intro was dismissed)
  useEffect(() => {
    if (isStarted && !isPlaying && !userMutedRef.current) {
      playMusic()
    }
  }, [isStarted, isPlaying, playMusic])

  // Toggle play / pause
  const toggleMusic = async () => {
    triggerHaptic(25)
    const audio = audioRef.current

    if (isPlaying) {
      userMutedRef.current = true
      clearFade()

      if (audio && !audio.paused) {
        fadeVolume(audio, 0, 400, () => {
          audio.pause()
          setIsPlaying(false)
        })
      } else if (webAudioRef.current) {
        webAudioRef.current.pause()
        setIsPlaying(false)
      }

    } else {
      userMutedRef.current = false
      if (audio) {
        await playMusic()
      } else {
        if (!webAudioRef.current) {
          webAudioRef.current = initGeneratedAmbient()
        }

        if (webAudioRef.current) {
          await webAudioRef.current.play()
          setIsPlaying(true)
        }
      }
    }
  }

  // Handle browser tab visibility (pause when backgrounded, resume when active)
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
        if (wasPlayingRef.current && !userMutedRef.current) {
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
  }, [isPlaying, playMusic, clearFade])

  // Handle unexpected audio ending/errors
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePause = () => {
      if (audio.ended) {
        setIsPlaying(false)
      }
    }

    const handleError = () => {
      // If absolute path failed, try relative path
      if (audio.src && audio.src.endsWith('/assets/music/music.mp3')) {
        audio.src = 'assets/music/music.mp3'
        audio.load()
        return
      }
      console.error('Music file failed to load')
      setIsPlaying(false)
    }

    audio.addEventListener('ended', handlePause)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('ended', handlePause)
      audio.removeEventListener('error', handleError)
    }
  }, [])

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
  }, [clearFade])

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
        playsInline
        autoPlay
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
          z-[60]
          flex items-center gap-2.5
          px-4 py-2.5
          rounded-full
          bg-[#120726]/90
          backdrop-blur-[14px]
          border border-[#e6c887]/40
          shadow-[0_10px_35px_rgba(0,0,0,0.65),0_0_20px_rgba(230,200,135,0.22)]
          cursor-pointer
          min-h-[44px]
          transition-all
          duration-300
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
