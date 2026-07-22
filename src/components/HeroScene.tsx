'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as THREE from 'three'

// ── Model variant — which GLB is currently selectable via the hero remote ────
export type ModelVariant = 'crt' | 'macintosh' | 'ussr_tv'

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

// ── Generic model config — for models added after crt/macintosh ──────────────
// Unlike crt/macintosh (hand-tuned per-model overlay code), these are driven by
// one shared component (GenericScreenModel, below) so adding a new model is
// just adding a config entry here instead of writing a new overlay effect.
type FaceAxis = 'x' | 'y' | 'z'

// Some GLBs (e.g. the USSR TV) don't give the screen mesh a useful node name —
// every node is named "defaultMaterial". In that case, match by material name
// instead of mesh/node name.
type ScreenSelector =
  | { by: 'name'; value: string }
  | { by: 'material'; value: string }

type OverlaySize =
  | { kind: 'square'; scale: number }
  | { kind: 'rect'; widthScale: number; heightScale: number }

type GenericModelConfig = {
  path: string
  screen: ScreenSelector
  hideMeshNames?: string[]
  darkColor: string
  // Which local axis is the screen's thin/normal axis (the axis you'd walk
  // along to leave the room through the screen).
  faceAxis: FaceAxis
  side: 1 | -1        // 1 = bbox.max face along faceAxis, -1 = bbox.min face
  depthOffset: number  // nudge the overlay in front of the screen surface
  size: OverlaySize
  flipY: boolean
  textureRotation: number
  mirrorX: boolean     // set true if the video text appears mirrored
  transform: {
    scale: number
    position: [number, number, number]
    rotation: [number, number, number]
  }
}

// This was added by inspecting the GLB's raw geometry (mesh names, material
// names, bounding boxes) — not by looking at a live render. The screen
// face/orientation math is derived and should be correct, but
// transform.rotation/scale/position and side are best-effort starting
// guesses. If the model looks sideways, upside-down, or the screen faces
// away from the camera, that's what to adjust first — see the model-variant
// switch further down for how this plugs into the scene.
const GENERIC_MODEL_CONFIG: Record<'ussr_tv', GenericModelConfig> = {
  ussr_tv: {
    path: '/models/pseudo_retro_ussr_colour_tv.glb',
    screen: { by: 'material', value: 'Screen' },
    darkColor: '#000',
    faceAxis: 'x',
    side: 1,
    depthOffset: 0.005,
    size: { kind: 'rect', widthScale: 0.85, heightScale: 0.85 },
    flipY: true,
    textureRotation: 0,
    mirrorX: false,
    transform: {
      scale: 0.6,
      position: [0, -0.2, 0],
      rotation: [0, -Math.PI / 2, 0],
    },
  },
}

// ── Overlay geometry helpers shared by every model in GENERIC_MODEL_CONFIG ────
// Plane geometry starts flat in the local XY plane (normal = local +Z).
// Rotating it to face along faceAxis carries plane-local X/Y into two of the
// mesh's local axes — these two helpers keep that mapping in one place
// instead of re-deriving it per model.
function getInPlaneDims(faceAxis: FaceAxis, size: THREE.Vector3): { width: number; height: number } {
  switch (faceAxis) {
    case 'x': return { width: size.z, height: size.y }
    case 'y': return { width: size.x, height: size.z }
    case 'z': return { width: size.x, height: size.y }
  }
}

function getFaceRotation(faceAxis: FaceAxis, side: 1 | -1): [number, number, number] {
  switch (faceAxis) {
    case 'x': return [0, side * Math.PI / 2, 0]
    case 'y': return [-side * Math.PI / 2, 0, 0]
    case 'z': return [0, side === 1 ? 0 : Math.PI, 0]
  }
}

function findScreenMesh(scene: THREE.Object3D, selector: ScreenSelector): THREE.Mesh | null {
  let found: THREE.Mesh | null = null
  scene.traverse((child) => {
    if (found || !(child as THREE.Mesh).isMesh) return
    const mesh = child as THREE.Mesh
    if (selector.by === 'name') {
      if (mesh.name === selector.value) found = mesh
    } else {
      const mat = mesh.material
      const matName = Array.isArray(mat)
        ? mat.find((m) => m.name === selector.value)?.name
        : (mat as THREE.Material | undefined)?.name
      if (matName === selector.value) found = mesh
    }
  })
  return found
}

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

// ── Shared prop shape for channel-driven screen content ───────────────────────
type ChannelProps = {
  channels: string[]
  channelIndex: number
}

// ─── GLB model component ──────────────────────────────────────────────────────
function GLBMonitor({ channels, channelIndex }: ChannelProps) {
  const gltf = useLoader(GLTFLoader, MODEL_PATH, setupDraco)
  const scene = gltf.scene
  const screenRef = useRef<{ video: HTMLVideoElement; overlayMesh: THREE.Mesh } | null>(null)
  const skipNextSwitchRef = useRef(true)

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
    video.src         = channels[channelIndex]
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

      screenRef.current = { video, overlayMesh }
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
      screenRef.current = null
      skipNextSwitchRef.current = true
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

  // ── React to channel changes from the hero remote (auto-advance or manual skip) ──
  useEffect(() => {
    if (skipNextSwitchRef.current) { skipNextSwitchRef.current = false; return }
    const ref = screenRef.current
    if (!ref) return
    ref.overlayMesh.visible = false   // dark screen shows through until canplay fires
    ref.video.src = channels[channelIndex]
    ref.video.load()
  }, [channelIndex, channels])

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
function MacintoshModel({ channels, channelIndex }: ChannelProps) {
  const gltf = useLoader(GLTFLoader, MODEL_CONFIG.macintosh.path, setupDraco)
  const scene = gltf.scene
  const screenRef = useRef<{ video: HTMLVideoElement; overlayMesh: THREE.Mesh } | null>(null)
  const skipNextSwitchRef = useRef(true)

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

  // ── Video overlay with channel switching ─────────────────────────────────
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

    // ── Single video element — src is swapped on each channel switch ─────────
    const video = document.createElement('video')
    video.autoplay    = true
    video.loop        = true
    video.muted       = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    video.src         = channels[channelIndex]

    // ── Texture / material / mesh created once — reused across all channels ──
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

    const overlayMesh = new THREE.Mesh(overlayGeo, overlayMat)

    const faceZ = ov.side === 1
      ? bbox.max.z + ov.depthOffset
      : bbox.min.z - ov.depthOffset

    overlayMesh.position.set(center.x, center.y, faceZ)
    screenMesh.add(overlayMesh)
    screenRef.current = { video, overlayMesh }
    console.log('[Mac GLB] Video overlay attached')

    // canplay fires on initial load and after each channel switch src change
    const onCanPlay = () => {
      if (disposed) return
      overlayMesh.visible = true
      video.play().catch(() => console.warn('[Mac GLB] Autoplay blocked'))
      console.log(`[Mac GLB] Channel playing: ${video.src}`)
    }
    const onError = () => console.warn('[Mac GLB] Video load failed')

    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)
    video.load()

    return () => {
      disposed = true
      screenRef.current = null
      skipNextSwitchRef.current = true
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
      video.pause()
      video.src = ''
      video.load()

      screenMesh.remove(overlayMesh)
      tex.dispose()
      overlayMat.dispose()
      overlayGeo.dispose()
      screenDarkMat.dispose()
      screenMesh.material = originalScreenMaterial
    }
  }, [scene])

  // ── React to channel changes from the hero remote (auto-advance or manual skip) ──
  useEffect(() => {
    if (skipNextSwitchRef.current) { skipNextSwitchRef.current = false; return }
    const ref = screenRef.current
    if (!ref) return
    ref.overlayMesh.visible = false   // dark screen shows through until canplay fires
    ref.video.src = channels[channelIndex]
    ref.video.load()
  }, [channelIndex, channels])

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

useLoader.preload(GLTFLoader, GENERIC_MODEL_CONFIG.ussr_tv.path, setupDraco)

// ─── Generic GLB model — driven entirely by a GenericModelConfig entry ───────
// Same overlay pattern as GLBMonitor/MacintoshModel (darken screen mesh, add a
// child video-textured plane, react to channel changes) but parameterized so
// new models don't need their own bespoke component.
function GenericScreenModel({ config, channels, channelIndex }: { config: GenericModelConfig } & ChannelProps) {
  const gltf = useLoader(GLTFLoader, config.path, setupDraco)
  const scene = gltf.scene
  const screenRef = useRef<{ video: HTMLVideoElement; overlayMesh: THREE.Mesh } | null>(null)
  const skipNextSwitchRef = useRef(true)

  // Mesh/material inspection log (useful during dev, harmless in prod)
  useEffect(() => {
    console.group(`[Generic GLB] ${config.path} mesh inspection`)
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh
        const mat = Array.isArray(m.material)
          ? m.material.map((x) => x.name || '(unnamed)').join(', ')
          : (m.material as THREE.Material)?.name || '(unnamed)'
        console.log(`  "${m.name}" mat=${mat}`)
      }
    })
    console.groupEnd()
  }, [scene])

  useEffect(() => {
    config.hideMeshNames?.forEach((name) => {
      scene.traverse((child) => {
        if (child.name === name) child.visible = false
      })
    })

    const screenMesh = findScreenMesh(scene, config.screen)
    if (!screenMesh) {
      console.warn(`[Generic GLB] screen mesh not found (${JSON.stringify(config.screen)}) in ${config.path}`)
      return
    }
    console.log(`[Generic GLB] screen mesh found for ${config.path}`)

    const originalMaterial = screenMesh.material
    const darkMat = new THREE.MeshBasicMaterial({ color: config.darkColor, toneMapped: false })
    screenMesh.material = darkMat

    screenMesh.geometry.computeBoundingBox()
    const bbox = screenMesh.geometry.boundingBox!
    const size = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())
    const { width: dimW, height: dimH } = getInPlaneDims(config.faceAxis, size)

    const [overlayW, overlayH] = config.size.kind === 'square'
      ? [Math.min(dimW, dimH) * config.size.scale, Math.min(dimW, dimH) * config.size.scale]
      : [dimW * config.size.widthScale, dimH * config.size.heightScale]

    console.log(`[Generic GLB] bbox size=${size.toArray().map(v => v.toFixed(3))} overlay=${overlayW.toFixed(3)}x${overlayH.toFixed(3)}`)

    const overlayGeo = new THREE.PlaneGeometry(overlayW, overlayH)
    if (config.mirrorX) {
      const uv = overlayGeo.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i))
      uv.needsUpdate = true
    }

    let disposed = false
    const video = document.createElement('video')
    video.autoplay    = true
    video.loop        = true
    video.muted       = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    video.src         = channels[channelIndex]

    const tex = new THREE.VideoTexture(video)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.colorSpace = THREE.SRGBColorSpace
    tex.flipY    = config.flipY
    tex.center.set(0.5, 0.5)
    tex.rotation = config.textureRotation

    const overlayMat = new THREE.MeshBasicMaterial({
      map: tex,
      toneMapped: false,
      transparent: true,
      side: THREE.FrontSide,
      depthTest: true,
      depthWrite: false,
    })

    const overlayMesh = new THREE.Mesh(overlayGeo, overlayMat)

    const axis = config.faceAxis
    const faceCoord = config.side === 1 ? bbox.max[axis] + config.depthOffset : bbox.min[axis] - config.depthOffset
    const position = new THREE.Vector3(center.x, center.y, center.z)
    position[axis] = faceCoord
    overlayMesh.position.copy(position)
    overlayMesh.rotation.set(...getFaceRotation(config.faceAxis, config.side))

    screenMesh.add(overlayMesh)
    screenRef.current = { video, overlayMesh }
    console.log('[Generic GLB] Video overlay attached')

    const onCanPlay = () => {
      if (disposed) return
      overlayMesh.visible = true
      video.play()
        .then(() => console.log(`[Generic GLB] Channel playing: ${video.src}`))
        .catch(() => console.warn('[Generic GLB] Autoplay blocked'))
    }
    const onError = () => {
      if (!video.src) return  // empty src during cleanup — not a real failure
      console.warn(
        `[Generic GLB] Video load failed src="${video.src}" code=${video.error?.code} message="${video.error?.message}"`
      )
    }

    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)
    video.load()

    return () => {
      disposed = true
      screenRef.current = null
      skipNextSwitchRef.current = true
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
      video.pause()
      video.src = ''
      video.load()

      screenMesh.remove(overlayMesh)
      tex.dispose()
      overlayMat.dispose()
      overlayGeo.dispose()
      darkMat.dispose()
      screenMesh.material = originalMaterial
    }
  }, [scene, config])

  // ── React to channel changes from the hero remote (auto-advance or manual skip) ──
  useEffect(() => {
    if (skipNextSwitchRef.current) { skipNextSwitchRef.current = false; return }
    const ref = screenRef.current
    if (!ref) return
    ref.overlayMesh.visible = false
    ref.video.src = channels[channelIndex]
    ref.video.load()
  }, [channelIndex, channels])

  const t = config.transform
  return (
    <primitive
      object={scene}
      scale={t.scale}
      position={t.position}
      rotation={t.rotation}
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
function CRTMonitor({ modelVariant, channels, channelIndex }: { modelVariant: ModelVariant } & ChannelProps) {
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
          {modelVariant === 'crt' && <GLBMonitor channels={channels} channelIndex={channelIndex} />}
          {modelVariant === 'macintosh' && <MacintoshModel channels={channels} channelIndex={channelIndex} />}
          {modelVariant === 'ussr_tv' && (
            <GenericScreenModel config={GENERIC_MODEL_CONFIG.ussr_tv} channels={channels} channelIndex={channelIndex} />
          )}
        </Suspense>
      ) : (
        <CustomCRT videoTexture={videoTexture} />
      )}
    </group>
  )
}

// ─── Scene root ───────────────────────────────────────────────────────────────
export default function HeroScene({ modelVariant, channels, channelIndex }: { modelVariant: ModelVariant } & ChannelProps) {
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
      <pointLight position={[0.5, 5, 1.5]} intensity={110.5} color="#ededed" />
      <pointLight position={[0, 0.04, 2.2]} intensity={3.0} color="#000000" />
      <pointLight position={[0, 0, -3.5]} intensity={0.6} color="#330066" />
      <CRTMonitor modelVariant={modelVariant} channels={channels} channelIndex={channelIndex} />
    </Canvas>
  )
}

