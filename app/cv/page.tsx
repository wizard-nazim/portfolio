export default function CVPage() {
  const skills = [
    'Music Production', 'Sound Design', 'Photography', 'Collage',
    'Stop Motion', 'Illustration', 'Video Editing', 'Cover Art',
    'Writing', 'React', 'TypeScript', '.NET', 'C#',
  ]

  return (
    <div className="page">
      <div className="eyebrow">Résumé</div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>CV</h1>

      {/* Header */}
      <div className="cv-header">
        <div>
          <div className="cv-name">NAZIM</div>
          <div className="cv-role">Artist · Musician · Developer</div>
          <div className="cv-location">Cape Town, South Africa</div>
        </div>
        <a
          href="/cv.pdf"
          download
          className="btn btn-primary"
          style={{ alignSelf: 'center' }}
        >
          ↓ Download PDF
        </a>
      </div>

      {/* Practice */}
      <div className="cv-section">
        <div className="cv-section-title">Practice</div>
        <div className="cv-entry">
          <div>
            <div className="cv-entry-title">Music Production &amp; Release</div>
            <div className="cv-entry-desc">Original music released as vetkat and @vakante on SoundCloud</div>
          </div>
          <div className="cv-entry-year">2020 – now</div>
        </div>
        <div className="cv-entry">
          <div>
            <div className="cv-entry-title">Visual Art &amp; Collage</div>
            <div className="cv-entry-desc">Cover art, collage, photography, stop motion</div>
          </div>
          <div className="cv-entry-year">2021 – now</div>
        </div>
        <div className="cv-entry">
          <div>
            <div className="cv-entry-title">Zine &amp; Writing</div>
            <div className="cv-entry-desc">Self-published zine on process, mood, and making</div>
          </div>
          <div className="cv-entry-year">2024 – now</div>
        </div>
      </div>

      {/* Selected Work */}
      <div className="cv-section">
        <div className="cv-section-title">Selected Work</div>
        <div className="cv-entry">
          <div>
            <div className="cv-entry-title">Ｐａｔｉｅｎｃｅ (صبر)</div>
            <div className="cv-entry-desc">Single · SoundCloud · vetkat</div>
          </div>
          <div className="cv-entry-year">2025</div>
        </div>
        <div className="cv-entry">
          <div>
            <div className="cv-entry-title">Corner Shop</div>
            <div className="cv-entry-desc">Track · SoundCloud · vetkat</div>
          </div>
          <div className="cv-entry-year">2023</div>
        </div>
        <div className="cv-entry">
          <div>
            <div className="cv-entry-title">Zine — Issue #04</div>
            <div className="cv-entry-desc">Patience with your own process</div>
          </div>
          <div className="cv-entry-year">2025</div>
        </div>
        <div className="cv-entry">
          <div>
            <div className="cv-entry-title">Portfolio Site</div>
            <div className="cv-entry-desc">Next.js 14 · TypeScript · Tailwind — this site</div>
          </div>
          <div className="cv-entry-year">2025</div>
        </div>
      </div>

      {/* Skills */}
      <div className="cv-section">
        <div className="cv-section-title">Skills</div>
        <div className="cv-skills-wrap">
          {skills.map((s) => (
            <span key={s} className="cv-skill-tag">{s}</span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="cv-section">
        <div className="cv-section-title">Links</div>
        <div className="cv-links-wrap">
          <a href="https://soundcloud.com/vetkat" target="_blank" rel="noopener" className="cv-link">
            soundcloud.com/vetkat
          </a>
          <a href="https://www.instagram.com/nazimrafudeen/" target="_blank" rel="noopener" className="cv-link">
            instagram.com/nazimrafudeen
          </a>
          <a href="https://github.com/wizard-nazim" target="_blank" rel="noopener" className="cv-link">
            github.com/wizard-nazim
          </a>
        </div>
        <div className="cv-stamp">Available for projects</div>
      </div>
    </div>
  )
}
