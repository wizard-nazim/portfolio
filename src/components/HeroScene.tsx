'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── CRT monitor built from basic geometry ───────────────────────────────────
function CRTMonitor() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    // Base y offset centres the assembly; sin adds gentle float
    groupRef.current.position.y = 0.10 + Math.sin(t * 0.55) * 0.055
    // Base y-rotation keeps right side visible for depth; sin adds slow sway
    groupRef.current.rotation.y = -0.20 + Math.sin(t * 0.32) * 0.08
    // Slight downward tilt so top face catches rim light
    groupRef.current.rotation.x = 0.07
  })

  return (
    <group ref={groupRef}>

      {/* MONITOR HOUSING — charcoal, clearly readable against black */}
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

      {/* BEZEL FACE PLATE — thick raised border, darker than housing */}
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

      {/* SCREEN — strong purple-blue emissive, feels alive */}
      <mesh position={[0, 0.04, 0.325]}>
        <planeGeometry args={[1.50, 1.04]} />
        <meshStandardMaterial
          color="#030010"
          emissive="#5500dd"
          emissiveIntensity={1.4}
          roughness={0.06}
        />
      </mesh>

      {/* SCREEN GLOW BORDER — phosphor halo just inside bezel edge */}
      <mesh position={[0, 0.04, 0.323]}>
        <planeGeometry args={[1.63, 1.15]} />
        <meshStandardMaterial
          color="#000"
          emissive="#3300bb"
          emissiveIntensity={0.70}
          roughness={0.5}
        />
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

      {/* CHIN BAR — glowing power strip at bottom front */}
      <mesh position={[0, -0.735, 0.278]}>
        <boxGeometry args={[1.85, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#1e1238"
          emissive="#4400cc"
          emissiveIntensity={0.90}
          roughness={0.65}
        />
      </mesh>

      {/* POWER LED — bright magenta dot on chin bar */}
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
      {/* Base ambient — housing always visible even in shadow */}
      <ambientLight intensity={0.28} />

      {/* Key light — upper-right front, defines the shape */}
      <pointLight position={[4, 4, 4]} intensity={5.5} color="#c400ff" />

      {/* Left fill — softens key-shadow side */}
      <pointLight position={[-3, 1.5, 2.5]} intensity={1.4} color="#6600cc" />

      {/* Top rim — catches top face, makes depth obvious */}
      <pointLight position={[0.5, 5, 1.5]} intensity={2.5} color="#aa00ff" />

      {/* Screen bloom — forward glow from the screen surface */}
      <pointLight position={[0, 0.04, 2.2]} intensity={3.0} color="#5500cc" />

      {/* Back rim — thin edge separation from the black background */}
      <pointLight position={[0, 0, -3.5]} intensity={0.6} color="#330066" />

      <CRTMonitor />
    </Canvas>
  )
}
