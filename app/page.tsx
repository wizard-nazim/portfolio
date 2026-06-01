import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="page home-bg">
      {/* Homepage-only background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bg.gif" alt="" className="site-bg-gif" aria-hidden="true" />
      <div className="home-content">
        <section className="hero-synthwave">

          {/* Left: GIF */}
          <div className="hero-gif-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/homepage-gif.gif" alt="Nazim" className="hero-gif" />
          </div>

          {/* Right: text */}
          <div className="hero-text-col">

            {/* Location tag — yellow */}
            <div className="hero-location-tag" style={{ color: '#ffffff' }}>Cape Town — Est. 2020</div>

            {/* Role blocks */}
            <div className="role-blocks">
              <span className="role-block">Artist</span>
              <span className="role-block">Musician</span>
              <span className="role-block">Developer</span>
            </div>

            {/* Full name — same font as social-card-name (Permanent Marker) */}
            <h1 style={{
              fontFamily: 'var(--font-marker, cursive)',
              fontSize: 32,
              color: 'var(--color-text)',
              lineHeight: 1.2,
              marginBottom: 12,
            }}>
              Muhammad<br />
              Nazim Rafudeen
            </h1>

            {/* Description */}
            <p className="hero-sub" style={{ color: 'rgba(240, 230, 200, 0.55)' }}>
            
              Welcome to my corner of the internet where I share my work & thoughts. 
              Make yourself comfortable, grab those headphones and listen to my tunes ^o^
              <br />
              <br />
              I make music, art, code, and 
              cry myself to sleep after debugging for 8 hours straight. 
              Don`t worry though, that`s a joke, It`s actually 10 hours.
              I also like cats, coffee, and long walks on the beach (just kidding, I don't go outside).
              I hope you find something here that resonates with you. Peace and love!
            </p>

            {/* Buttons */}
            <div className="hero-btns">
              <Link href="/music" className="btn btn-primary">Hear music</Link>
              <Link href="/contact" className="btn btn-outline">Get in touch</Link>
            </div>

          </div>
        </section>

        {/* Latest */}
        <div className="section-label" style={{ marginTop: 16 }}>Latest</div>
        <div className="latest-grid latest-grid-2">
          <Link href="/zine" className="latest-card">
            <div className="latest-card-thumb latest-card-thumb-text">
              <span style={{ fontFamily: 'var(--font-courier)', fontSize: 32, color: 'var(--color-text-dim)', letterSpacing: 4 }}>ZINE</span>
            </div>
            <div className="latest-card-title">Zine — Issue #04</div>
            <div className="latest-card-meta">Patience with your own process · 2025</div>
            <div className="card-corner" />
          </Link>

          <a href="https://github.com/wizard-nazim" target="_blank" rel="noopener" className="latest-card">
            <div className="latest-card-thumb latest-card-thumb-text">
              <span style={{ fontFamily: 'var(--font-courier)', fontSize: 28, color: 'var(--color-text-dim)', letterSpacing: 2 }}>&lt;/&gt;</span>
            </div>
            <div className="latest-card-title">wizard-nazim</div>
            <div className="latest-card-meta">GitHub · .NET · React · TypeScript</div>
            <div className="card-corner" />
          </a>
        </div>
      </div>
    </div>
  )
}
