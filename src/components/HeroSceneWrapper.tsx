'use client'

/**
 * HeroSceneWrapper
 *
 * SSR-safe shell for the Three.js hero scene, plus the hero remote —
 * visitor-facing controls to swap the 3D model, swap the background image,
 * and skip to the next channel (video) on the active model's screen.
 *
 * This is the only file that should be imported in app/page.tsx.
 * HeroScene.tsx should never be imported directly from a page/layout.
 */
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import HeroRemoteControls from './HeroRemoteControls'
import type { ModelVariant } from './HeroScene'

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  // Transparent — sky background shows through while canvas loads
  loading: () => <div style={{ width: '100%', height: '100%' }} />,
})

// ── 3D models selectable from the hero remote ─────────────────────────────
const MODELS: { id: ModelVariant; label: string }[] = [
  { id: 'macintosh', label: 'Macintosh' },
  { id: 'crt', label: 'CRT Monitor' },
  { id: 'ussr_tv', label: 'USSR Color TV' },
]
const DEFAULT_MODEL: ModelVariant = 'macintosh'

// ── Background images selectable from the hero remote — add more files to ──
// /public/3D-BG and list them here to make them pickable.
const BACKGROUNDS = [
  { id: 'sky', label: 'Sky', src: '/3D-BG/3D-BG-1.jpg' },
  { id: 'sunset', label: 'Cape Town Sunset', src: '/3D-BG/3D-BG-2.jpg' },
  { id: 'vhs-static', label: 'VHS Static', src: '/3D-BG/3D-BG-GIF-1.gif' },
  { id: 'glitch', label: 'Glitch', src: '/3D-BG/3D-BG-GIF-2.gif' },
  { id: 'retro-loading', label: 'Retro Loading', src: '/3D-BG/3D-BG-GIF-3.gif' },
]
const DEFAULT_BACKGROUND_ID = BACKGROUNDS[0].id

// ── Screen channels — the looping videos shown on whichever model is active ──
const SCREEN_CHANNELS = [
  '/media/channel-1.mp4',
  '/media/channel-2.mp4',
  '/media/channel-3.mp4',
  '/media/channel-4.mp4',
]
const SCREEN_CHANNEL_INTERVAL_MS = 10000

export default function HeroSceneWrapper() {
  const [modelVariant, setModelVariant] = useState<ModelVariant>(DEFAULT_MODEL)
  const [backgroundId, setBackgroundId] = useState(DEFAULT_BACKGROUND_ID)
  const [channelIndex, setChannelIndex] = useState(0)

  const nextChannel = () => setChannelIndex((i) => (i + 1) % SCREEN_CHANNELS.length)

  // Auto-advance the channel — restarts the wait whenever the channel changes,
  // whether that change came from this timer or a visitor clicking "skip".
  useEffect(() => {
    const id = setInterval(nextChannel, SCREEN_CHANNEL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [channelIndex])

  const background = BACKGROUNDS.find((b) => b.id === backgroundId) ?? BACKGROUNDS[0]

  return (
    <div className="hero-stage">
      <div className="crt-frame">
        {/* Background — swappable via the remote below */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${background.src}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 1,
            pointerEvents: 'none',
          }}
        />
        {/* Dark purple vignette — adjust stops/opacity here */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(60,0,80,0.25) 50%, rgba(0,0,0,0.65) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Three.js canvas — above background layers, receives all pointer/wheel events */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
          <HeroScene modelVariant={modelVariant} channels={SCREEN_CHANNELS} channelIndex={channelIndex} />
        </div>
      </div>

      <HeroRemoteControls
        models={MODELS}
        modelVariant={modelVariant}
        onModelChange={setModelVariant}
        backgrounds={BACKGROUNDS}
        backgroundId={background.id}
        onBackgroundChange={setBackgroundId}
        onNextChannel={nextChannel}
      />
    </div>
  )
}
