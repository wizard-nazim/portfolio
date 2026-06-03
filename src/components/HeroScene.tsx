'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── CRT monitor — video texture + mouse parallax ────────────────────────────
function CRTMonitor() {
  const groupRef = useRef<THREE.Group>(null)

  // ── Video texture ──────────────────────────────────────────────────────────
  // null = loading, false = failed (show purple fallback), VideoTexture = ready
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null | false>(null)

  useEffect(() => {
    let disposed = false
    const video = document.createElement('video')
    video.src = '/media/homepage-screen.mp4'
    video.autoplay = true
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'

    const onCanPlay = () => {
      if (disposed) return
      const tex = new THREE.VideoTexture(video)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.colorSpace = THREE.SRGBColorSpace
      setVideoTexture(tex)
      video.play().catch(() => {})
    }
    const onError = () => { if (!disposed) setVideoTexture(false) }

    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)
    video.load()

    return () => {
      disposed = true
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
      video.pause()
      video.src = ''
      video.load()
    }
  }, [])

  // ── Mouse parallax — all in refs, zero React state updates per frame ───────
  // Raw mouse position in normalised device coords: x/y ∈ [-1, 1]
  const mouseRef = useRef({ x: 0, y: 0 })
  // Smoothed (lerped) value that useFrame animates toward mouseRef
  const smoothRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  // ── Animation loop ─────────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime

    // Lerp smooth toward raw mouse — 0.04 ≈ 1.5 s to settle (premium feel)
    smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.04
    smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.04

    // Clamp so extreme cursor positions stay within readable range
    const mx = THREE.MathUtils.clamp(smoothRef.current.x, -1, 1)
    const my = THREE.MathUtils.clamp(smoothRef.current.y, -1, 1)

    // Float on Y
    groupRef.current.position.y = 0.10 + Math.sin(t * 0.55) * 0.055

    // Y-axis: base depth angle + slow idle sway + mouse X influence
    // Base -0.20 always keeps the right side visible → reads as 3D
    groupRef.current.rotation.y =
      -0.20 +                      // base angle (shows depth)
      Math.sin(t * 0.32) * 0.08 + // slow idle sway
      mx * 0.14                    // mouse X → max ±0.14 rad (≈ 8°)

    // X-axis: base downward tilt + mouse Y influence
    // Clamped so monitor never rotates past readable range
    groupRef.current.rotation.x = THREE.MathUtils.clamp(
      0.07 - my * 0.08,           // base tilt + mouse Y → max ±0.08 rad (≈ 4.5°)
      -0.02,                       // never tilts fully back
       0.18                        // never dips too far down
    )
  })

  return (
    <group ref={groupRef}>

      {/* MONITOR HOUSING */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.05, 1.55, 0.55]} />
        <meshStandardMaterial
          color="#281940"
          emissive="#3a0078"
          emissiveIntensity={0.40}
          roughness={0.70}
          metalness={0.10}
        />
      </mesh>

      {/* BEZEL FACE PLATE */}
      <mesh position={[0, 0.04, 0.295]}>
        <boxGeometry args={[1.85, 1.36, 0.06]} />
        <meshStandardMaterial
          color="#180c2e"
          emissive="#220050"
          emissiveIntensity={0.28}
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>

      {/* SCREEN GLOW BORDER — purple phosphor halo around the video */}
      <mesh position={[0, 0.04, 0.323]}>
        <planeGeometry args={[1.63, 1.15]} />
        <meshStandardMaterial
          color="#000"
          emissive="#3300bb"
          emissiveIntensity={0.70}
          roughness={0.5}
        />
      </mesh>

      {/* SCREEN — video texture or purple fallback */}
      <mesh position={[0, 0.04, 0.325]}>
        <planeGeometry args={[1.50, 1.04]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial
            color="#030010"
            emissive="#5500dd"
            emissiveIntensity={videoTexture === false ? 1.0 : 1.4}
            roughness={0.06}
          />
        )}
      </mesh>

      {/* TOP VENT STRIP */}
      <mesh position={[0, 0.735, 0.25]}>
        <boxGeometry args={[1.70, 0.055, 0.22]} />
        <meshStandardMaterial
          color="#1e1238"
          emissive="#320065"
          emissiveIntensity={0.50}
          roughness={0.85}
        />
      </mesh>

      {/* CHIN BAR */}
      <mesh position={[0, -0.735, 0.278]}>
        <boxGeometry args={[1.85, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#1e1238"
          emissive="#4400cc"
          emissiveIntensity={0.90}
          roughness={0.65}
        />
      </mesh>

      {/* POWER LED */}
      <mesh position={[0.70, -0.735, 0.323]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive="#dd00ff"
          emissiveIntensity={3.0}
          roughness={0.1}
        />
      </mesh>

      {/* STAND NECK */}
      <mesh position={[0, -0.975, 0.06]}>
        <boxGeometry args={[0.28, 0.38, 0.28]} />
        <meshStandardMaterial
          color="#221440"
          emissive="#2a0058"
          emissiveIntensity={0.38}
          roughness={0.82}
        />
      </mesh>

      {/* STAND BASE / FOOT */}
      <mesh position={[0, -1.175, 0.20]}>
        <boxGeometry args={[1.10, 0.08, 0.65]} />
        <meshStandardMaterial
          color="#221440"
          emissive="#2a0058"
          emissiveIntensity={0.38}
          roughness={0.82}
        />
      </mesh>

    </group>
  )
}

// ─── Scene root ───────────────────────────────────────────────────────────────
export default function HeroScene() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', display: 'block' }}
      camera={{ position: [0.5, 0.5, 3.1], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.28} />
      <pointLight position={[4, 4, 4]} intensity={5.5} color="#c400ff" />
      <pointLight position={[-3, 1.5, 2.5]} intensity={1.4} color="#6600cc" />
      <pointLight position={[0.5, 5, 1.5]} intensity={2.5} color="#aa00ff" />
      <pointLight position={[0, 0.04, 2.2]} intensity={3.0} color="#5500cc" />
      <pointLight position={[0, 0, -3.5]} intensity={0.6} color="#330066" />
      <CRTMonitor />
    </Canvas>
  )
}
