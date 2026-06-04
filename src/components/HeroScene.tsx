'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ─── Toggles ──────────────────────────────────────────────────────────────────
const USE_GLB_MODEL = true

// ── Model variant toggle — change this one constant to switch models ──────────
// "crt"       → working CRT GLB with video overlay
// "macintosh" → Macintosh GLB candidate, mesh-inspect only (no overlay yet)
//const MODEL_VARIANT = 'crt' as 'crt' | 'macintosh'
const MODEL_VARIANT = 'macintosh' as 'crt' | 'macintosh'

const MODEL_CONFIG = {
  crt: {
    path: '/models/old_computer_monitor_and_tv_model..glb',
    screenMeshName: 'Display_Display_0',
    hideMeshes: ['Plane_Ground_0'],
    transform: {
      scale: 0.65,
      position: [0, -0.35, 0] as [number, number, number],
      rotation: [0, -Math.PI / 2, 0] as [number, number, number],
    },
    overlay: {
      scale: 0.72,
      side: 1,
      depthOffset: 0.01,
      rotY: Math.PI / 2,
      flipY: false,
      textureRotation: Math.PI / 2,
      mirrorX: true,
    },
  },
  macintosh: {
    path: '/models/macintosh.glb',
    screenMeshName: null,
    hideMeshes: [] as string[],
    transform: {
      scale: 2.5,
      position: [0, -0.65, 1] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    },
    overlay: null,
  },
} as const

const MODEL_PATH  = '/models/old_computer_monitor_and_tv_model..glb'
const VIDEO_PATH  = '/media/homepage-screen.mp4'
const SCREEN_MESH = 'Display_Display_0'
const GROUND_MESH = 'Plane_Ground_0'

// ─── Overlay constants ────────────────────────────────────────────────────────
// These values recreate the final working solution from the overlay pass.
// Adjust here only — do not touch geometry or texture setup below.
const OVERLAY_SCALE           = 0.72
const OVERLAY_SIDE            = 1          // 1 = bbox.max.x face, -1 = bbox.min.x face
const OVERLAY_DEPTH_OFFSET    = 0.01       // nudge in front of screen surface
const OVERLAY_ROT_Y           = Math.PI / 2
const OVERLAY_FLIP_Y          = false
const OVERLAY_TEXTURE_ROTATION = Math.PI / 2
const OVERLAY_MIRROR_X        = true       // UV-level flip — prevents MIZAN instead of NAZIM

// ─── GLB orientation ──────────────────────────────────────────────────────────
// Screen face (+X in model space) → face camera (+Z) with -Math.PI/2 on Y
const GLB_Y = -Math.PI / 2

// ─── GLB model component ──────────────────────────────────────────────────────
function GLBMonitor() {
  const { scene, nodes } = useGLTF(MODEL_PATH)

  // Mesh structure log (useful during dev, harmless in prod)
  useEffect(() => {
    console.group('[Hero GLB] Model loaded')
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh
        const mat = Array.isArray(m.material)
          ? m.material.map((x) => x.name || '(unnamed)').join(', ')
          : (m.material as THREE.Material).name || '(unnamed)'
        console.log(`  "${m.name}" visible=${m.visible} mat=${mat}`)
      }
    })
    console.log('  nodes:', Object.keys(nodes).join(', '))
    console.groupEnd()
  }, [scene, nodes])

  useEffect(() => {
    // ── 1. Hide ground plane ─────────────────────────────────────────────────
    scene.traverse((child) => {
      if (child.name === GROUND_MESH) {
        child.visible = false
        console.log(`[Hero GLB] "${GROUND_MESH}" hidden`)
      }
    })

    // ── 2. Find display mesh ─────────────────────────────────────────────────
    let displayMesh: THREE.Mesh | null = null
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name === SCREEN_MESH) {
        displayMesh = child as THREE.Mesh
      }
    })

    if (!displayMesh) {
      console.warn(`[Hero GLB] "${SCREEN_MESH}" not found — overlay skipped, scene safe`)
      return
    }
    console.log(`[Hero GLB] "${SCREEN_MESH}" found`)

    // ── 3. Darken display mesh (near-black screen background) ────────────────
    const originalMaterial = (displayMesh as THREE.Mesh).material
    const darkMat = new THREE.MeshBasicMaterial({ color: '#000', toneMapped: false })
    ;(displayMesh as THREE.Mesh).material = darkMat

    // ── 4. Compute bounding box in local (geometry) space ───────────────────
    ;(displayMesh as THREE.Mesh).geometry.computeBoundingBox()
    const bbox   = (displayMesh as THREE.Mesh).geometry.boundingBox!
    const size   = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())

    // size.x = depth/thickness of display mesh — do NOT use for overlay size.
    // size.y and size.z are the visible screen face dimensions.
    const overlaySize = Math.min(size.y, size.z) * OVERLAY_SCALE
    console.log(`[Hero GLB] bbox  x=${size.x.toFixed(3)} y=${size.y.toFixed(3)} z=${size.z.toFixed(3)}`)
    console.log(`[Hero GLB] overlaySize=${overlaySize.toFixed(3)}`)

    // ── 5. Create overlay plane geometry ─────────────────────────────────────
    const overlayGeo = new THREE.PlaneGeometry(overlaySize, overlaySize)

    // ── 6. UV-level mirror on X (prevents text appearing as MIZAN) ───────────
    if (OVERLAY_MIRROR_X) {
      const uv = overlayGeo.attributes.uv
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, 1 - uv.getX(i))
      }
      uv.needsUpdate = true
    }

    // ── 7. Set up video element ───────────────────────────────────────────────
    let disposed   = false
    let overlayMesh: THREE.Mesh | null = null

    const video = document.createElement('video')
    video.src         = VIDEO_PATH
    video.autoplay    = true
    video.loop        = true
    video.muted       = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'

    const onCanPlay = () => {
      if (disposed || !displayMesh) return

      // ── 8. Create video texture ─────────────────────────────────────────
      const tex = new THREE.VideoTexture(video)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.colorSpace = THREE.SRGBColorSpace
      tex.flipY      = OVERLAY_FLIP_Y       // false — GLTF bottom-left UV origin
      tex.center.set(0.5, 0.5)
      tex.rotation   = OVERLAY_TEXTURE_ROTATION  // Math.PI/2

      // ── 9. Create overlay material (self-lit, double-sided) ─────────────
      const overlayMat = new THREE.MeshBasicMaterial({
        map: tex,
        toneMapped: false,
        side: THREE.DoubleSide,
      })

      // ── 10. Create mesh and position on screen face ──────────────────────
      overlayMesh = new THREE.Mesh(overlayGeo, overlayMat)

      const faceX = OVERLAY_SIDE === 1
        ? bbox.max.x + OVERLAY_DEPTH_OFFSET   // just in front of +X screen face
        : bbox.min.x - OVERLAY_DEPTH_OFFSET

      overlayMesh.position.set(faceX, center.y, center.z)
      overlayMesh.rotation.set(0, OVERLAY_ROT_Y, 0)

      // Attach to display mesh — inherits all model transforms + parallax
      ;(displayMesh as THREE.Mesh).add(overlayMesh)

      console.log('[Hero GLB] Video overlay attached to Display_Display_0')
      video.play().catch(() => console.warn('[Hero GLB] Autoplay blocked; first frame shown'))
    }

    const onError = () => console.warn('[Hero GLB] Video load failed — dark screen background kept')

    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)
    video.load()

    // ── Cleanup on unmount / hot-reload ──────────────────────────────────────
    return () => {
      disposed = true
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
      video.pause()
      video.src = ''
      video.load()

      if (overlayMesh) {
        ;(displayMesh as THREE.Mesh).remove(overlayMesh)
        const mat = overlayMesh.material as THREE.MeshBasicMaterial
        if (mat.map) mat.map.dispose()
        mat.dispose()
      }
      overlayGeo.dispose()
      darkMat.dispose()

      // Restore original GLB material
      ;(displayMesh as THREE.Mesh).material = originalMaterial
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
useGLTF.preload(MODEL_CONFIG.macintosh.path)

// ─── Macintosh GLB candidate — mesh-inspect only, no overlay yet ─────────────
function MacintoshModel() {
  const { scene } = useGLTF(MODEL_CONFIG.macintosh.path)

  useEffect(() => {
    if (!scene) return

    console.group('[Macintosh GLB] Mesh Inspection')
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        console.log({
          name: mesh.name,
          type: mesh.type,
          geometry: mesh.geometry?.type,
          material: Array.isArray(mesh.material)
            ? mesh.material.map((m) => m.name || '(unnamed)')
            : (mesh.material as THREE.Material)?.name || '(unnamed)',
        })
      }
    })
    console.groupEnd()
  }, [scene])

  const t = MODEL_CONFIG.macintosh.transform
  return (
    <primitive
      object={scene}
      scale={t.scale}
      position={[...t.position]}
      rotation={[...t.rotation]}
    />
  )
}

// ─── Custom geometry CRT (Phase 1/2 fallback — USE_GLB_MODEL = false) ────────
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

// ─── Animated wrapper — parallax + float ──────────────────────────────────────
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
    const baseY = USE_GLB_MODEL ? 0 : -0.20
    groupRef.current.rotation.y = baseY + Math.sin(t * 0.32) * 0.08 + mx * 0.14
    groupRef.current.rotation.x = THREE.MathUtils.clamp(0.07 - my * 0.08, -0.02, 0.18)
  })

  return (
    <group ref={groupRef}>
      {USE_GLB_MODEL ? (
        <Suspense fallback={null}>
          {MODEL_VARIANT === 'crt' ? <GLBMonitor /> : <MacintoshModel />}
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
