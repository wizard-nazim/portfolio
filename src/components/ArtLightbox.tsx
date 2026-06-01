'use client'
import { useEffect } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  onClose: () => void
}

export default function ArtLightbox({ src, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <Image
        src={src}
        alt="Artwork"
        width={800}
        height={800}
        style={{ maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        unoptimized
      />
    </div>
  )
}
