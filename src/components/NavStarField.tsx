'use client'
import { useEffect, useRef } from 'react'

export default function NavStarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    function sync() {
      const parent = canvas!.parentElement
      if (!parent) return
      canvas!.width  = parent.offsetWidth
      canvas!.height = parent.offsetHeight
    }

    const STAR_COUNT = 90
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      base: Math.random() * 0.55 + 0.3,
      speed: Math.random() * 0.018 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }))

    function draw(t: number) {
      sync()
      const W = canvas!.width
      const H = canvas!.height
      ctx!.clearRect(0, 0, W, H)

      for (const s of stars) {
        const alpha = s.base + Math.sin(t * s.speed + s.phase) * 0.14
        ctx!.beginPath()
        ctx!.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(230, 210, 255, ${Math.max(0, Math.min(1, alpha))})`
        ctx!.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    sync()
    animId = requestAnimationFrame(draw)

    const ro = new ResizeObserver(sync)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="nav-star-canvas"
    />
  )
}
