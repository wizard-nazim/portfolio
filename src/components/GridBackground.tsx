'use client'
import { useEffect, useRef } from 'react'

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let offset = 0

    function resize() {
      canvas!.width  = window.innerWidth
      canvas!.height = window.innerHeight
    }

    function draw() {
      const W = canvas!.width
      const H = canvas!.height

      // Clear
      ctx!.clearRect(0, 0, W, H)

      // Horizon sits at ~55% height
      const horizonY = H * 0.55
      // Vanishing point X = centre
      const vpX = W / 2

      // How many vertical grid columns
      const VCOLS = 14
      // How many horizontal rows (visible)
      const HROWS = 16

      // Scroll speed: one "row" period in px (perspective-space)
      const ROW_PERIOD = 80
      offset = (offset + 0.6) % ROW_PERIOD

      // ── Glow helper ──────────────────────────────────────
      function setLineStyle(alpha: number) {
        ctx!.strokeStyle = `rgba(200, 80, 255, ${alpha})`
        ctx!.lineWidth = 1
        ctx!.shadowColor = 'rgba(200, 60, 255, 0.6)'
        ctx!.shadowBlur = 6
      }

      // ── Vertical lines ────────────────────────────────────
      // Evenly spaced at horizon, spread out at bottom
      for (let i = 0; i <= VCOLS; i++) {
        const t = i / VCOLS                     // 0..1
        const xAtHorizon = vpX + (t - 0.5) * W * 0.7
        const xAtBottom  = (t) * W * 1.1 - W * 0.05

        const alpha = 0.25 + 0.35 * Math.abs(t - 0.5) * 2
        setLineStyle(alpha * 0.8)

        ctx!.beginPath()
        ctx!.moveTo(xAtHorizon, horizonY)
        ctx!.lineTo(xAtBottom, H)
        ctx!.stroke()
      }

      // ── Horizontal lines ──────────────────────────────────
      // Use perspective mapping: lines crowd toward horizon
      for (let i = 0; i <= HROWS; i++) {
        // normalised 0..1 from horizon, with scroll offset
        const raw = (i + offset / ROW_PERIOD) / HROWS
        if (raw < 0 || raw > 1) continue

        // perspective curve: lines bunch at top (horizon)
        const p = Math.pow(raw, 2.5)
        const y = horizonY + p * (H - horizonY)

        // how far left/right does this row's edge extend?
        const spread = (p) * W * 0.6
        const x0 = vpX - spread
        const x1 = vpX + spread

        const alpha = 0.12 + p * 0.55
        setLineStyle(alpha)

        ctx!.beginPath()
        ctx!.moveTo(x0, y)
        ctx!.lineTo(x1, y)
        ctx!.stroke()
      }

      // ── Horizon glow line ──────────────────────────────────
      ctx!.shadowBlur = 25
      ctx!.shadowColor = 'rgba(200, 60, 255, 0.8)'
      ctx!.strokeStyle = 'rgba(210, 80, 255, 0.55)'
      ctx!.lineWidth = 10.5
      ctx!.beginPath()
      ctx!.moveTo(0, horizonY)
      ctx!.lineTo(W, horizonY)
      ctx!.stroke()

      ctx!.shadowBlur = 0

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  )
}
