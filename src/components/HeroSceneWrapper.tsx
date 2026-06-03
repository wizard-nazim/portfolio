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
  // Black background matches .crt-frame while the canvas loads
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  ),
})

export default function HeroSceneWrapper() {
  return <HeroScene />
}
