'use client'
import { useState } from 'react'
import Image from 'next/image'
import { artworks, type Artwork } from '@/data/artworks'
import ArtLightbox from './ArtLightbox'

export default function ArtGrid() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const withImage = artworks.filter((a) => a.imageUrl)
  const all = artworks

  return (
    <>
      {/* Featured hero band */}
{/*    
      <div className="art-hero-band">
        {artworks[0].imageUrl && (
          <Image
            src={artworks[0].imageUrl}
            alt={artworks[0].title}
            fill
            style={{ objectFit: 'cover', filter: 'grayscale(20%)' }}
            unoptimized
          />
        )}
        <div style={{
          position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, transparent 60%)',
          display: 'flex', alignItems: 'center', padding: '0 24px'
        }}>
          <div>
            <div className="eyebrow">Featured</div>
            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 22, color: 'var(--color-text)' }}>
              {artworks[0].title}
            </div>
          </div>
        </div>
      </div>*/}

      <div className="art-hero-band">
        {artworks[0].imageUrl && (
          <Image
            src='/Banners/art-banner.jpg'
            alt={artworks[0].title}
            fill
            style={{ objectFit: 'cover', filter: 'grayscale(20%)' }}
          />
        )}
        <div style={{
          position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, transparent 60%)',
          display: 'flex', alignItems: 'center', padding: '0 24px'
        }}>
          <div>
            <div className="eyebrow">THE ART CORNER:</div>
            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 22, color: 'var(--color-text)' }}>
              {"under construction!"}
            </div>
          </div>
        </div>
      </div>


      {/* Music & Projects */}
      <div className="section-label">Music &amp; Projects</div>
      <div className="art-series-grid">
        {all.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="series-card"
            onClick={() => item.imageUrl && setLightboxSrc(item.imageUrl)}
            style={{ cursor: item.imageUrl ? 'pointer' : 'default' }}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={64}
                height={64}
                className="series-thumb"
                
              />
            ) : (
              <div className="series-thumb" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, background: 'var(--color-surface2)'
              }}>+</div>
            )}
            <div>
              <div className="series-info-type">{item.type}</div>
              <div className="series-info-title">{item.title}</div>
              <div className="series-info-meta">{item.year}</div>
            </div>
          </div>
        ))}
      </div>

      {/* All works masonry */}
      <div className="section-label">All Works</div>
      <div className="art-masonry">
        {all.map((item) => (
          <div
            key={item.id}
            className="art-item"
            onClick={() => item.imageUrl && setLightboxSrc(item.imageUrl)}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={400}
                height={400}
                style={{ width: '100%', height: 'auto' }}
              />
            ) : (
              <div style={{
                width: '100%', aspectRatio: '1', background: 'var(--color-surface2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, color: 'var(--color-text-dim)'
              }}>+</div>
            )}
            <div className="art-item-overlay">
              <div className="art-item-overlay-title">{item.title}</div>
              <div className="art-item-overlay-tag">{item.type} · {item.year}</div>
            </div>
          </div>
        ))}
      </div>

      {lightboxSrc && (
        <ArtLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  )
}
