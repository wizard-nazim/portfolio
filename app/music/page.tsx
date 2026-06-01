import DiscPlayer from '@/components/DiscPlayer'

export default function MusicPage() {
  return (
    <div className="page">
      <div className="eyebrow">Discography</div>
      <h1 className="page-title" style={{ marginBottom: 28 }}>Music</h1>

      <div className="music-layout">
        <div>
          <DiscPlayer />
        </div>

        <div>
          {/* SoundCloud embed */}
          <div className="section-label">Stream — Ｐａｔｉｅｎｃｅ (صبر)</div>
          <div className="sc-embed-wrap">
            <iframe
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2057765336&color=%23ff1aff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
            />
          </div>

          <div className="section-label" style={{ marginTop: 24 }}>Stream Links</div>
          <div className="stream-links">
            <a
              href="https://soundcloud.com/vetkat"
              target="_blank"
              rel="noopener"
              className="stream-link"
            >
              SoundCloud — vetkat
            </a>
            <a
              href="https://soundcloud.com/vakante"
              target="_blank"
              rel="noopener"
              className="stream-link"
            >
              SoundCloud — @vakante
            </a>
          </div>

          <div style={{ marginTop: 28 }}>
            <div className="section-label">About</div>
            <p style={{
              fontFamily: 'var(--font-special)',
              fontSize: 13,
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
              lineHeight: 1.8
            }}>
              Music made in Cape Town. Beats, samples, feelings.
              Released under vetkat and @vakante on SoundCloud.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
