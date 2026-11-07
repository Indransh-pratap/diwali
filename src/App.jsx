import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import PetalsCanvas from './components/PetalsCanvas'
import TouchSparkles from './components/TouchSparkles'
import Intro from './components/Intro'
import ChapterNav from './components/ChapterNav'
import Hero from './components/Hero'
import InteractiveDiyas from './components/InteractiveDiyas'
import OurStoryTimeline from './components/OurStoryTimeline'
import InteractiveSky from './components/InteractiveSky'
import Gallery from './components/Gallery'
import Finale from './components/Finale'
import MusicPlayer from './components/MusicPlayer'

export default function App() {
  const [opened, setOpened] = useState(false)
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState(null)

  // Prevent scroll when initial intro overlay is active
  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden'
  }, [opened])

  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent('request-music-play'))
    setOpened(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div id="top" className="relative min-h-screen bg-[#080414] text-[#faf4ea] overflow-x-hidden selection:bg-[#f5c26b]/30">
      {/* Floating Rose Petals & Golden Sparkles */}
      <PetalsCanvas />

      {/* Interactive Mobile Touch & Tap Sparkler Trails */}
      <TouchSparkles />

      {/* Atmospheric Ambient Pulse Layer */}
      <div className="ambient-glow-layer" aria-hidden="true" />

      {/* Fine Film Grain Texture */}
      <div className="film-grain" aria-hidden="true" />

      {/* Initial Gate: Tap to light the diya & enter Radha's universe */}
      <AnimatePresence>
        {!opened && <Intro onOpen={handleOpen} />}
      </AnimatePresence>

      {/* Main Experience */}
      {opened && (
        <>
          {/* Glass Navigation Pill */}
          <ChapterNav />

          <main className="relative z-10 w-full flex flex-col items-center">
            {/* 1. Cinematic Hero Section */}
            <Hero />

            {/* 2. Interactive Diya Experience (5 Clay Diyas & Wishes) */}
            <InteractiveDiyas />

            {/* 3. Our Story - A Romantic Timeline */}
            <OurStoryTimeline onSelectPhoto={setSelectedGalleryPhoto} />

            {/* 4. Our Sky - Interactive Stars & "RADHA" Constellation */}
            <InteractiveSky />

            {/* 5. Our Photo Gallery (Polaroids & Fullscreen Viewer) */}
            <Gallery
              selectedIdx={selectedGalleryPhoto}
              onSelectIdx={setSelectedGalleryPhoto}
            />

            {/* 6. Final Surprise - The Emotional Highlight */}
            <Finale />
          </main>
        </>
      )}

      {/* Floating Glass Music Player - Always mounted for background audio preloading */}
      <MusicPlayer isStarted={opened} />
    </div>
  )
}
