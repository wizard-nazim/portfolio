'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as THREE from 'three'

// ─── Toggles ──────────────────────────────────────────────────────────────────
const USE_GLB_MODEL = true

// ── Model controls ────────────────────────────────────────────────────────────
const ENABLE_MODEL_CONTROLS = true
const DRAG_ROTATION_SPEED   = 0.006
const DRAG_PITCH_MIN        = -0.35
const DRAG_PITCH_MAX        =  0.35
const ZOOM_SPEED            = 0.001
const ZOOM_MIN              = 0.85
const ZOOM_MAX              = 1.35
const ENABLE_IDLE_FLOAT     = true

// ── Model variant toggle — change this one constant to switch models ──────────
// "crt"       → working CRT GLB with video overlay
// "macintosh" → Macintosh GLB candidate with video overlay
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
    screenMeshName: 'Part_2_low_UDIM_1002_0' as string | null,
    hideMeshes: [] as string[],
    transform: {
      scale: 2.5,
      position: [0, -0.65, 1] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
    },
    overlay: {
      widthScale: 0.82,       // fraction of bbox.x
      heightScale: 0.78,      // fraction of bbox.y
      depthOffset: 0.04,      // nudge in front of the screen face
      side: 1 as 1 | -1,     // 1 = bbox.max.z face, -1 = bbox.min.z face
      textureRotation: 0 as number,
      mirrorX: false as boolean,  // set true if video text appears reversed
      flipY: true as boolean,
    },
  },
} as const

// ── Set to a mesh name from the inspection log to highlight it in the scene ──

const MACINTOSH_DEBUG_MESH_NAME = null as string | null
//const MACINTOSH_DEBUG_MESH_NAME = 'Part_2_low_UDIM_1002_0' as string | null

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

// ─── GLTF loader setup — avoids drei/three-stdlib barrel dependency ──────────
function setupDraco(loader: GLTFLoader) {
  const draco = new DRACOLoader()
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/')
  loader.setDRACOLoader(draco)
}

// ─── GLB orientation ──────────────────────────────────────────────────────────
// Screen face (+X in model space) → face camera (+Z) with -Math.PI/2 on Y
const GLB_Y = -Math.PI / 2

// ─── GLB model component ──────────────────────────────────────────────────────
function GLBMonitor() {
  const gltf = useLoader(GLTFLoader, MODEL_PATH, setupDraco)
  const scene = gltf.scene

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
    const nodeNames: string[] = []
    scene.traverse((child) => { if (child.name) nodeNames.push(child.name) })
    console.log('  nodes:', nodeNames.join(', '))
    console.groupEnd()
  }, [scene])

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

useLoader.preload(GLTFLoader, MODEL_PATH, setupDraco)
useLoader.preload(GLTFLoader, MODEL_CONFIG.macintosh.path, setupDraco)

// ─── Macintosh GLB candidate ──────────────────────────────────────────────────
function MacintoshModel() {
  const gltf = useLoader(GLTFLoader, MODEL_CONFIG.macintosh.path, setupDraco)
  const scene = gltf.scene

  // ── Enhanced mesh inspection log ──────────────────────────────────────────
  useEffect(() => {
    if (!scene) return

    console.group('[Macintosh GLB] Mesh Inspection')
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.geometry.computeBoundingBox()
        const bbox = mesh.geometry.boundingBox!
        const localSize = bbox.getSize(new THREE.Vector3())
        const localCenter = bbox.getCenter(new THREE.Vector3())
        console.log({
          name: mesh.name,
          geometry: mesh.geometry?.type,
          material: Array.isArray(mesh.material)
            ? mesh.material.map((m) => m.name || '(unnamed)')
            : (mesh.material as THREE.Material)?.name || '(unnamed)',
          localBBox: `${localSize.x.toFixed(3)} × ${localSize.y.toFixed(3)} × ${localSize.z.toFixed(3)}`,
          localCenter: `(${localCenter.x.toFixed(3)}, ${localCenter.y.toFixed(3)}, ${localCenter.z.toFixed(3)})`,
        })
      }
    })
    console.groupEnd()
  }, [scene])

  // ── Material-override debug highlight — set MACINTOSH_DEBUG_MESH_NAME to activate ──
  useEffect(() => {
    if (!scene || !MACINTOSH_DEBUG_MESH_NAME) return

    let found: THREE.Mesh | null = null
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name === MACINTOSH_DEBUG_MESH_NAME) {
        found = child as THREE.Mesh
      }
    })

    if (!found) {
      console.warn(`[Macintosh GLB] "${MACINTOSH_DEBUG_MESH_NAME}" not found — check mesh names in inspection log`)
      return
    }

    // TypeScript can't narrow 'found' through the traverse callback — explicit cast needed
    const mesh = found as THREE.Mesh
    const originalMaterial = mesh.material
    const matName = Array.isArray(originalMaterial)
      ? (originalMaterial as THREE.Material[]).map(m => m.name || '(unnamed)').join(', ')
      : (originalMaterial as THREE.Material).name || '(unnamed)'

    mesh.geometry.computeBoundingBox()
    const bbox = mesh.geometry.boundingBox!
    const size = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())

    console.log(`[Macintosh GLB] Debug highlight: "${MACINTOSH_DEBUG_MESH_NAME}"`)
    console.log(`  material: ${matName}`)
    console.log(`  localBBox: ${size.x.toFixed(3)} × ${size.y.toFixed(3)} × ${size.z.toFixed(3)}`)
    console.log(`  localCenter: (${center.x.toFixed(3)}, ${center.y.toFixed(3)}, ${center.z.toFixed(3)})`)

    const debugMat = new THREE.MeshBasicMaterial({
      color: 0x00ff44,
      wireframe: true,
      depthTest: false,
    })
    mesh.material = debugMat

    return () => {
      mesh.material = originalMaterial
      debugMat.dispose()
    }
  }, [scene])

  // ── Video overlay ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!scene) return
    const cfg = MODEL_CONFIG.macintosh
    const screenMeshName = cfg.screenMeshName
    const ov = cfg.overlay
    if (!screenMeshName || !ov) return

    let found: THREE.Mesh | null = null
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name === screenMeshName) {
        found = child as THREE.Mesh
      }
    })

    if (!found) {
      console.warn(`[Mac GLB] Screen mesh "${screenMeshName}" not found`)
      return
    }

    const screenMesh = found as THREE.Mesh
    console.log(`[Mac GLB] Screen mesh "${screenMeshName}" found`)

    // Darken the screen mesh so the original Sketchfab texture doesn't bleed through
    const originalScreenMaterial = screenMesh.material
    const screenDarkMat = new THREE.MeshBasicMaterial({ color: '#020008', toneMapped: false })
    screenMesh.material = screenDarkMat

    screenMesh.geometry.computeBoundingBox()
    const bbox = screenMesh.geometry.boundingBox!
    const size = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())

    const overlayW = size.x * ov.widthScale
    const overlayH = size.y * ov.heightScale
    console.log(`[Mac GLB] bbox: ${size.x.toFixed(3)} × ${size.y.toFixed(3)} × ${size.z.toFixed(3)}`)
    console.log(`[Mac GLB] overlay plane: ${overlayW.toFixed(3)} × ${overlayH.toFixed(3)}`)

    const overlayGeo = new THREE.PlaneGeometry(overlayW, overlayH)

    if (ov.mirrorX) {
      const uv = overlayGeo.attributes.uv
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, 1 - uv.getX(i))
      }
      uv.needsUpdate = true
    }

    let disposed = false
    let overlayMesh: THREE.Mesh | null = null

    const video = document.createElement('video')
    video.src         = VIDEO_PATH
    video.autoplay    = true
    video.loop        = true
    video.muted       = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'

    const onCanPlay = () => {
      if (disposed) return

      const tex = new THREE.VideoTexture(video)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.colorSpace = THREE.SRGBColorSpace
      tex.flipY    = ov.flipY
      tex.center.set(0.5, 0.5)
      tex.rotation = ov.textureRotation

      const overlayMat = new THREE.MeshBasicMaterial({
        map: tex,
        toneMapped: false,
        transparent: true,
        side: THREE.FrontSide,
        depthTest: true,
        depthWrite: false,
      })

      overlayMesh = new THREE.Mesh(overlayGeo, overlayMat)

      const faceZ = ov.side === 1
        ? bbox.max.z + ov.depthOffset
        : bbox.min.z - ov.depthOffset

      overlayMesh.position.set(center.x, center.y, faceZ)

      screenMesh.add(overlayMesh)
      console.log('[Mac GLB] Video overlay attached')
      video.play().catch(() => console.warn('[Mac GLB] Autoplay blocked'))
    }

    const onError = () => console.warn('[Mac GLB] Video load failed')

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

      if (overlayMesh) {
        screenMesh.remove(overlayMesh)
        const mat = overlayMesh.material as THREE.MeshBasicMaterial
        if (mat.map) mat.map.dispose()
        mat.dispose()
      }
      overlayGeo.dispose()
      screenDarkMat.dispose()
      screenMesh.material = originalScreenMaterial
    }
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
  const { gl } = useThree()

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

  const isDraggingRef  = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const dragRotRef     = useRef({ yaw: 0, pitch: 0 })
  const zoomRef        = useRef(1.0)

  useEffect(() => {
    if (!ENABLE_MODEL_CONTROLS) return
    const canvas = gl.domElement

    const onDown = (e: PointerEvent) => {
      isDraggingRef.current = true
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      canvas.setPointerCapture(e.pointerId)
      canvas.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - lastPointerRef.current.x
      const dy = e.clientY - lastPointerRef.current.y
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      dragRotRef.current.yaw   += dx * DRAG_ROTATION_SPEED
      dragRotRef.current.pitch  = THREE.MathUtils.clamp(
        dragRotRef.current.pitch - dy * DRAG_ROTATION_SPEED,
        DRAG_PITCH_MIN,
        DRAG_PITCH_MAX,
      )
    }
    const onUp = () => {
      isDraggingRef.current = false
      canvas.style.cursor = 'grab'
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomRef.current = THREE.MathUtils.clamp(
        zoomRef.current - e.deltaY * ZOOM_SPEED,
        ZOOM_MIN,
        ZOOM_MAX,
      )
    }

    canvas.style.cursor = 'grab'
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.style.cursor = ''
    }
  }, [gl])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    if (ENABLE_IDLE_FLOAT) {
      groupRef.current.position.y = 0.10 + Math.sin(t * 0.55) * 0.055
    }
    const baseY = USE_GLB_MODEL ? 0 : -0.20
    groupRef.current.rotation.y = baseY + dragRotRef.current.yaw
    groupRef.current.rotation.x = THREE.MathUtils.clamp(
      0.07 + dragRotRef.current.pitch,
      DRAG_PITCH_MIN,
      DRAG_PITCH_MAX,
    )
    const z = zoomRef.current
    groupRef.current.scale.set(z, z, z)
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
      camera={{ position: [0, 0.2, 3.5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={9.5} color="#c400ff" />
      <pointLight position={[-3, 1.5, 2.5]} intensity={20.4} color="#e2dcdc" />
      <pointLight position={[0.5, 5, 1.5]} intensity={110.5} color="#aa00ff" />
      <pointLight position={[0, 0.04, 2.2]} intensity={3.0} color="#5500cc" />
      <pointLight position={[0, 0, -3.5]} intensity={0.6} color="#330066" />
      <CRTMonitor />
    </Canvas>
  )
}

