'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ─── Toggles ──────────────────────────────────────────────────────────────────
const USE_GLB_MODEL = true

const MODEL_PATH = '/models/old_computer_monitor_and_tv_model..glb'
const VIDEO_PATH  = '/media/homepage-screen.mp4'
const SCREEN_MESH = 'Display_Display_0'
const GROUND_MESH = 'Plane_Ground_0'

// ─── Phase 3.3: rotation candidates ──────────────────────────────────────────
// Comment/uncomment ONE line to test each orientation.
// The screen mesh is Display_Display_0 — find the value where it faces the camera.
//
// const GLB_Y = 0               // native export (showed back/side originally)
// const GLB_Y = Math.PI         // 180° flip — Phase 3.1 candidate
// const GLB_Y = Math.PI / 2     // 90° left  — try if screen faces -X natively
const GLB_Y = -Math.PI / 2       // 90° right — primary 3.3 candidate (screen faces +X natively)

// ─── GLB model component ──────────────────────────────────────────────────────
function GLBMonitor() {
  const { scene, nodes } = useGLTF(MODEL_PATH)

  // Log mesh names (debug — remove when orientation is finalised)
  useEffect(() => {
    console.group('[Hero GLB] Model loaded')
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh
        const mat = Array.isArray(m.material)
          ? m.material.map((x) => x.name || '(unnamed)').join(', ')
          : (m.material as THREE.Material).name || '(unnamed)'
        console.log(`  Mesh: "${m.name}" | visible=${m.visible} | mat: ${mat}`)
      }
    })
    console.log('  All node keys:', Object.keys(nodes).join(', '))
    console.groupEnd()
  }, [scene, nodes])

  // Scene setup: hide ground plane + apply video texture to display
  useEffect(() => {
    // ── 1. Hide ground plane ──────────────────────────────────────────────────
    scene.traverse((child) => {
      if (child.name === GROUND_MESH) {
        child.visible = false
        console.log(`[Hero GLB] "${GROUND_MESH}" hidden`)
      }
    })

    // ── 2. Find display mesh ──────────────────────────────────────────────────
    let displayMesh: THREE.Mesh | null = null
    let originalMaterial: THREE.Material | THREE.Material[] | null = null

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name === SCREEN_MESH) {
        displayMesh = child as THREE.Mesh
        originalMaterial = displayMesh.material
      }
    })

    if (displayMesh) {
      console.log(`[Hero GLB] "${SCREEN_MESH}" found — applying video texture`)
    } else {
      console.warn(`[Hero GLB] "${SCREEN_MESH}" not found — scene safe, no crash`)
    }

    // ── 3. Set up video ───────────────────────────────────────────────────────
    let disposed = false
    const video = document.createElement('video')
    video.src = VIDEO_PATH
    video.autoplay = true
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'

    const onCanPlay = () => {
      if (disposed || !displayMesh) return
      const tex = new THREE.VideoTexture(video)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.colorSpace = THREE.SRGBColorSpace
      // flipY = false: GLTF uses bottom-left UV origin.
      // Toggle to true if video appears upside-down.
      tex.flipY = false
      displayMesh!.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
      console.log('[Hero GLB] Video material applied to Display_Display_0')
      video.play().catch(() => console.warn('[Hero GLB] Autoplay blocked; first frame shown'))
    }

    const onError = () => console.warn('[Hero GLB] Video load failed — original material kept')

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
      if (displayMesh && originalMaterial) {
        displayMesh.material = originalMaterial as THREE.Material
      }
    }
  }, [scene])

  return (
    <primitive
      object={scene}
      scale={0.65}
      position={[0, -0.35, 0]}
      rotation={[0, GLB_Y, 0]}
    />
  )
}

useGLTF.preload(MODEL_PATH)

// ─── Custom geometry CRT (Phase 1/2 fallback) ─────────────────────────────────
function CustomCRT({ videoTexture }: { videoTexture: THREE.VideoTexture | null | false }) {
  return (
    <>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.05, 1.55, 0.55]} />
        <meshStandardMaterial color="#281940" emissive="#3a0078" emissiveIntensity={0.40} roughness={0.70} metalness={0.10} />
      </mesh>
      <mesh position={[0, 0.04, 0.295]}>
        <boxGeometry args={[1.85, 1.36, 0.06]} />
        <meshStandardMaterial color="#180c2e" emissive="#220050" emissiveIntensity={0.28} roughness={0.88} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.04, 0.323]}>
        <planeGeometry args={[1.63, 1.15]} />
        <meshStandardMaterial color="#000" emissive="#3300bb" emissiveIntensity={0.70} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.04, 0.325]}>
        <planeGeometry args={[1.50, 1.04]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#030010" emissive="#5500dd" emissiveIntensity={videoTexture === false ? 1.0 : 1.4} roughness={0.06} />
        )}
      </mesh>
      <mesh position={[0, 0.735, 0.25]}>
        <boxGeometry args={[1.70, 0.055, 0.22]} />
        <meshStandardMaterial color="#1e1238" emissive="#320065" emissiveIntensity={0.50} roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.735, 0.278]}>
        <boxGeometry args={[1.85, 0.08, 0.08]} />
        <meshStandardMaterial color="#1e1238" emissive="#4400cc" emissiveIntensity={0.90} roughness={0.65} />
      </mesh>
      <mesh position={[0.70, -0.735, 0.323]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshStandardMaterial color="#000" emissive="#dd00ff" emissiveIntensity={3.0} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.975, 0.06]}>
        <boxGeometry args={[0.28, 0.38, 0.28]} />
        <meshStandardMaterial color="#221440" emissive="#2a0058" emissiveIntensity={0.38} roughness={0.82} />
      </mesh>
      <mesh position={[0, -1.175, 0.20]}>
        <boxGeometry args={[1.10, 0.08, 0.65]} />
        <meshStandardMaterial color="#221440" emissive="#2a0058" emissiveIntensity={0.38} roughness={0.82} />
      </mesh>
    </>
  )
}

// ─── Animated wrapper ─────────────────────────────────────────────────────────
function CRTMonitor() {
  const groupRef = useRef<THREE.Group>(null)

  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null | false>(null)
  useEffect(() => {
    if (USE_GLB_MODEL) return
    let disposed = false
    const video = document.createElement('video')
    video.src = VIDEO_PATH
    video.autoplay = true; video.loop = true; video.muted = true
    video.playsInline = true; video.crossOrigin = 'anonymous'
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
      video.pause(); video.src = ''; video.load()
    }
  }, [])

  const mouseRef  = useRef({ x: 0, y: 0 })
  const smoothRef = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.04
    smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.04
    const mx = THREE.MathUtils.clamp(smoothRef.current.x, -1, 1)
    const my = THREE.MathUtils.clamp(smoothRef.current.y, -1, 1)

    groupRef.current.position.y = 0.10 + Math.sin(t * 0.55) * 0.055

    // GLB: zero base angle — let GLB_Y handle orientation, parallax provides 3D feel.
    // Custom CRT keeps its original -0.20 base angle.
    const baseY = USE_GLB_MODEL ? 0 : -0.20
    groupRef.current.rotation.y = baseY + Math.sin(t * 0.32) * 0.08 + mx * 0.14
    groupRef.current.rotation.x = THREE.MathUtils.clamp(0.07 - my * 0.08, -0.02, 0.18)
  })

  return (
    <group ref={groupRef}>
      {USE_GLB_MODEL ? (
        <Suspense fallback={null}>
          <GLBMonitor />
        </Suspense>
      ) : (
        <CustomCRT videoTexture={videoTexture} />
      )}
    </group>
  )
}

// ─── Scene root ───────────────────────────────────────────────────────────────
export default function HeroScene() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', display: 'block' }}
      camera={{ position: [0, 0.2, 3.5], fov: 42 }}
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
