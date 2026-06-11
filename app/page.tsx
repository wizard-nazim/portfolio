import Link from 'next/link'
import HeroSceneWrapper from '@/components/HeroSceneWrapper'

// ─── Toggle: set to false to revert to the 2D GIF fallback ──────────────────
const USE_THREE_HERO = true

export default function HomePage() {
  return (
    <div className="page home-bg">
      {/* Homepage-only background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bg.gif" alt="" className="site-bg-gif" aria-hidden="true" />
      <div className="home-content">
        <section className="hero-synthwave">

          {/* Left: CRT frame — Three.js scene or 2D GIF fallback */}
          <div className="crt-frame">
            {USE_THREE_HERO ? (
              <HeroSceneWrapper />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src="/homepage-gif.gif" alt="Nazim" className="hero-gif" />
            )}
          </div>

          {/* Right: text */}
          <div className="hero-text-col">

            {/* Name — anchors the section */}
            <h1 className="hero-fullname">
              Muhammad<br />Nazim Rafudeen
            </h1>

            {/* Location tag */}
            <div className="hero-location-tag">Cape Town — Est. 2020</div>

            {/* Role blocks */}
            <div className="role-blocks">
              <span className="role-block">Artist</span>
              <span className="role-block">Musician</span>
              <span className="role-block">Developer</span>
            </div>

            {/* Bio */}
            <p className="hero-sub">
              Making music, art, and code out of Cape Town.
              Grab those headphones and dig in — hope you find something that resonates. Peace and love ^o^
            </p>

            {/* Buttons */}
            <div className="hero-btns">
              <Link href="/music" className="btn btn-primary">Listen to Patience ▶</Link>
              <Link href="/contact" className="btn btn-outline">Get in touch</Link>
            </div>

          </div>
        </section>

        {/* Latest — 3 cards */}
        <div className="section-label" style={{ marginTop: 16 }}>Latest</div>
        <div className="latest-grid latest-grid-3">

          {/* Music */}
          <Link href="/music" className="latest-card">
            <div className="latest-card-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://i1.sndcdn.com/artworks-alS5LTECt8b6FSwo-xyWdIg-t500x500.jpg"
                alt="Patience cover art"
                className="latest-card-cover"
              />
            </div>
            <div className="latest-card-title">صبر</div>
            <div className="latest-card-meta">Single · 2025 · vetkat</div>
            <div className="card-corner" />
          </Link>




          {/* Zine */}
          <Link href="/zine" className="latest-card">
            <div className="latest-card-thumb latest-card-thumb-text">
              <img
                src="img1.jpg"
                alt="Afternoon cover art"
                className="latest-card-cover"
              />
            </div>
            <div className="latest-card-title">Afternoon</div>
            <div className="latest-card-meta">Chill Lofi Track · 2025</div>
            <div className="card-corner" />
          </Link>


          {/* Zine */}
          <Link href="/zine" className="latest-card">
            <div className="latest-card-thumb latest-card-thumb-text">
              <img
                src="wip.png"
                alt="Afternoon cover art"
                className="latest-card-cover"
              />
            </div>
            <div className="latest-card-title">Afternoon</div>
            <div className="latest-card-meta">Chill Lofi Track · 2025</div>
            <div className="card-corner" />
          </Link>


          {/* GitHub */}
          <a href="https://github.com/wizard-nazim" target="_blank" rel="noopener" className="latest-card">
            <div className="latest-card-thumb latest-card-thumb-text">
              <img
                src="logo.png"
                alt="GitHub logo"
                className="latest-card-cover"
              />
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
