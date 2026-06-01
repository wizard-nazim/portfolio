'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { tracks, type Track } from '@/data/tracks'

export default function DiscPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0])
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [shuffled, setShuffled] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            handleNext()
            return 0
          }
          return p + 0.5
        })
      }, 300)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, currentTrack])

  function handleNext() {
    const idx = tracks.findIndex((t) => t.id === currentTrack.id)
    const next = shuffled
      ? tracks[Math.floor(Math.random() * tracks.length)]
      : tracks[(idx + 1) % tracks.length]
    setCurrentTrack(next)
    setProgress(0)
  }

  function handlePrev() {
    const idx = tracks.findIndex((t) => t.id === currentTrack.id)
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length]
    setCurrentTrack(prev)
    setProgress(0)
  }

  function selectTrack(track: Track) {
    setCurrentTrack(track)
    setProgress(0)
    setPlaying(true)
  }

  return (
    <div>
      <div className="disc-player">
        {/* Disc scene */}
        <div className="disc-scene">
          <div className={`disc-glow${playing ? ' playing' : ''}`} />
          <div
            className={`disc${playing ? ' spinning' : ''}`}
            onClick={() => setPlaying((p) => !p)}
          >
            <div className="disc-label">
              {currentTrack.coverArt ? (
                <Image
                  src={currentTrack.coverArt}
                  alt={currentTrack.title}
                  width={88}
                  height={88}
                  unoptimized
                />
              ) : (
                <div className="disc-label-placeholder">vetkat</div>
              )}
            </div>
          </div>
          {/* Tonearm */}
          <div className={`tonearm-wrap${playing ? ' playing' : ''}`}>
            <div className="tonearm-pivot" />
            <div className="tonearm-body" />
            <div className="tonearm-head" />
          </div>
        </div>

        {/* Player info */}
        <div className="player-info">
          <div className={`player-status${playing ? ' playing' : ''}`}>
            {playing ? 'Now Playing' : 'Paused'}
          </div>
          <div className="player-track-title">{currentTrack.title}</div>
          <div className="player-track-artist">vetkat · {currentTrack.year}</div>

          <div className="progress-bar-wrap" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = ((e.clientX - rect.left) / rect.width) * 100
            setProgress(pct)
          }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="player-controls">
            <button className="ctrl-btn" onClick={handlePrev} title="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            </button>
            <button className="ctrl-btn play-btn" onClick={() => setPlaying((p) => !p)} title={playing ? 'Pause' : 'Play'}>
              {playing
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              }
            </button>
            <button className="ctrl-btn" onClick={handleNext} title="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zM16 6v12h2V6h-2z"/></svg>
            </button>
            <button className="ctrl-btn" onClick={() => setShuffled((s) => !s)} style={{ color: shuffled ? 'var(--color-accent)' : undefined }} title="Shuffle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
            </button>
            <div className="volume-wrap">
              <span className="vol-icon">VOL</span>
              <input type="range" className="volume-slider" min={0} max={100} defaultValue={80} />
            </div>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="tracklist" style={{ marginTop: 24 }}>
        <div className="tracklist-header">Tracks — vetkat</div>
        {tracks.map((track, i) => {
          const isActive = track.id === currentTrack.id
          return (
            <div
              key={track.id}
              className={`track-row${isActive ? ' active' : ''}`}
              onClick={() => selectTrack(track)}
            >
              <div className="track-num">
                {isActive && playing ? (
                  <div className="track-bars">
                    <div className="bar" />
                    <div className="bar" />
                    <div className="bar" />
                  </div>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <div className="track-info">
                <div className="track-title">{track.title}</div>
                <div className="track-year">{track.year}{track.tag ? ` · ${track.tag}` : ''}</div>
              </div>
              <a
                href={track.soundcloudUrl}
                target="_blank"
                rel="noopener"
                className="track-sc-link"
                onClick={(e) => e.stopPropagation()}
                title="Open on SoundCloud"
              >
                ↗
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
