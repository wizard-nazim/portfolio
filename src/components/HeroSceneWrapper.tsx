/**
 * HeroSceneWrapper
 *
 * SSR-safe shell for the Three.js hero scene.
 * next/dynamic with ssr:false ensures WebGL is never called during
 * server-side rendering — required for Next.js App Router.
 *
 * This is the only file that should be imported in app/page.tsx.
 * HeroScene.tsx should never be imported directly from a page/layout.
 */
import dynamic from 'next/dynamic'

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  // Transparent — sky background shows through while canvas loads
  loading: () => <div style={{ width: '100%', height: '100%' }} />,
})

export default function HeroSceneWrapper() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Sky background — adjust opacity here (0.0–1.0) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/media/hero-sky-bg.jpg')",
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
        <HeroScene />
      </div>
    </div>
  )
}
