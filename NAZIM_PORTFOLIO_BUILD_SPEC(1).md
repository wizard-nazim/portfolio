# Nazim Portfolio — Full Build Spec
> Hand this document to Cowork / Claude Code to scaffold the entire project.

---

## 1. Project Overview

**Project name:** nazim-portfolio  
**Owner:** Nazim Rafudeen  
**Location:** Cape Town, South Africa  
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS v4 · MDX · Vercel  
**SoundCloud:** https://soundcloud.com/vetkat (alt: @vakante)  
**Instagram:** https://www.instagram.com/nazimrafudeen/  
**GitHub:** https://github.com/wizard-nazim  
**Contact email:** nazim.dev@proton.me  

---

## 2. Aesthetic & Design System

**Vibe:** Indie / pop-art / cutout / stop-motion / vintage / newsprint  
**Color palette (CSS variables):**
```css
--color-bg:        #0a0a0a;
--color-surface:   #0d0d0d;
--color-surface2:  #111111;
--color-border:    #1a1a1a;
--color-border2:   #2a2a2a;
--color-text:      #f0e6c8;
--color-text-muted:#555555;
--color-text-dim:  #333333;
--color-accent:    #ff1aff;   /* hot pink — primary accent */
--color-accent2:   #ff6600;   /* orange — secondary accent */
--color-accent3:   #ffcc00;   /* yellow — tertiary accent */
```

**Scanline overlay** — applied globally via `body::after`:
```css
background: repeating-linear-gradient(
  0deg, transparent, transparent 2px,
  rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px
);
pointer-events: none; position: fixed; inset: 0; z-index: 9999;
```

**Fonts (Google Fonts):**
- `UnifrakturMaguntia` — N letter
- `Abril Fatface` — A letter + page titles
- `Permanent Marker` — Z letter + card titles + hero headline
- `Boogaloo` — I letter
- `Righteous` — M letter
- `Special Elite` — body text / descriptions
- `Courier Prime` (700) — labels / eyebrows / tags / UI chrome

**Magazine letters (NAZIM) — newsprint b&w only:**
```
N — UnifrakturMaguntia, bg:#f0e6c8, color:#0a0a0a, rotate(-3deg), box-shadow:2px 2px 0 #888
A — Abril Fatface,       bg:#0a0a0a, color:#f0e6c8, border:2px solid #f0e6c8, rotate(2deg)
Z — Permanent Marker,    bg:#888888, color:#0a0a0a, rotate(-1.5deg), box-shadow:2px 2px 0 #333
I — Boogaloo,            bg:#f0e6c8, color:#0a0a0a, border:2px dashed #0a0a0a, rotate(3deg)
M — Righteous,           bg:#0a0a0a, color:#f0e6c8, border:2px solid #888, rotate(-1deg)
```

**Logo:** SoundCloud avatar URL:
`https://i1.sndcdn.com/avatars-ofoqR8mwLm10l01s-zTOFIQ-t500x500.jpg`
Displayed as a circle with pink glow pulse animation.

---

## 3. Layout Shell (all pages share this)

```
┌──────────┬──────────────────────────────────────┐
│  LOGO    │  HEADER (NAZIM mag letters + ticker)  │
│  80px    │                                       │
├──────────┼──────────────────────────────────────┤
│          │                                       │
│  NAV     │  PAGE CONTENT                         │
│  80px    │  (changes per route)                  │
│  sidebar │                                       │
│          │                                       │
├──────────┴──────────────────────────────────────┤
│  FOOTER (© · social links · "Handmade ✦" stamp) │
└─────────────────────────────────────────────────┘
```

**Shell component:** `src/components/Shell.tsx`  
Uses CSS Grid: `grid-template-columns: 80px 1fr` · `grid-template-rows: 64px 1fr 44px`  
Grid areas: `"logo header" "nav content" "nav footer"`

### Header
- Left: NAZIM magazine letters (MagTitle component)
- Right: scrolling ticker tape (CSS animation, `overflow:hidden`)
- Ticker content: "New music out now · Cape Town · Artist · Dev · Storyteller · Available for collabs · vetkat on SoundCloud"
- Border-bottom: `2px solid var(--color-accent)`

### Nav sidebar
- Border-right: `2px solid var(--color-accent)`
- Items: icon (emoji, slightly rotated per item) + label below
- Active state: `border-left: 3px solid var(--color-accent)` + faint pink bg
- Nav items (in order): Home 🏠 · Art 📷 · Music 📼 · Zine ✂️ · CV 🗂️ · Contact ✉️
- NO Film/Video section (removed)

### Footer
- Left: `© Nazim 2025`
- Center: SoundCloud · Instagram · GitHub links
- Right: "Handmade ✦" stamp (rotated, faint pink border)

---

## 4. Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Homepage / hero |
| `/art` | `app/art/page.tsx` | Gallery grid |
| `/music` | `app/music/page.tsx` | Disc player + tracklist |
| `/zine` | `app/zine/page.tsx` | Issue index |
| `/zine/[slug]` | `app/zine/[slug]/page.tsx` | Individual MDX post |
| `/cv` | `app/cv/page.tsx` | CV HTML view + PDF download |
| `/contact` | `app/contact/page.tsx` | Social links + contact form |

---

## 5. Page Specs

### 5.1 Homepage (`/`)

**Hero section (two-column grid):**
- Left col: cutout tag ("Cape Town · Est. 2020") + headline ("Artist · Musician · Developer") + sub-text + two buttons: "Hear music ▶" (→ /music) and "Get in touch" (→ /contact)
- Right col: hero image card — `Patience` cover art with yellow tape strip "Latest drop", slight rotation, pink border, drop shadow

**Latest cards row (3-up grid):**
1. Music card — Patience cover, title "Ｐａｔｉｅｎｃｅ (صبر)", meta "Single · 2025", links to /music
2. Zine card — scissors emoji thumb, "Issue #04", links to /zine
3. Dev card — GitHub avatar, "wizard-nazim", "13 repos · .NET · React", links to https://github.com/wizard-nazim

All cards: dark bg, 1px border, hover → slight rotate + lift + pink border, corner fold decoration.

---

### 5.2 Music (`/music`)

**Disc player component (`DiscPlayer.tsx`):**
- Spinning vinyl disc (CSS `border-radius:50%` + `@keyframes spin`)
- `animation-play-state: paused | running` toggled by play/pause
- Disc has radial vinyl groove pattern (CSS `repeating-radial-gradient`)
- Centre shows current track cover art (72×72px circle)
- Tonearm: positioned top-right of disc, `transform-origin: top center`, rotates from -28deg (parked) to -13deg (playing) on 1.2s ease transition
- Glow ring: `border-radius:50%` behind disc, `box-shadow` pulses via `@keyframes` when playing
- Click disc OR play button to toggle

**Player controls:**
- Now Playing tag (pink bg when playing, dark when paused)
- Track title + artist line
- Progress bar (simulated — no real audio, just visual advance)
- ⏮ prev · ⏸/▶ play · ⏭ next · ⇄ shuffle · volume slider

**Tracklist:**
```ts
// src/data/tracks.ts
export const tracks = [
  {
    id: 1,
    title: "Ｐａｔｉｅｎｃｅ (صبر)",
    slug: "sabr",
    year: 2025,
    tag: "Single",
    coverArt: "https://i1.sndcdn.com/artworks-alS5LTECt8b6FSwo-xyWdIg-t500x500.jpg",
    soundcloudUrl: "https://soundcloud.com/vetkat/sabr",
    soundcloudTrackId: "2057765336",
  },
  { id: 2, title: "Corner Shop", slug: "corner-shop", year: 2023, coverArt: null, soundcloudUrl: "https://soundcloud.com/vetkat/vetkat-afternoon" },
  { id: 3, title: "ulontitled",  slug: "ulontitled",  year: 2026, coverArt: null, soundcloudUrl: "https://soundcloud.com/vetkat/ulontitled" },
  { id: 4, title: "upside down id", slug: "upside-down-id", year: 2025, coverArt: null, soundcloudUrl: "https://soundcloud.com/vetkat/upside-down-id" },
  { id: 5, title: "idea 2", slug: "idea-2", year: 2025, coverArt: null, soundcloudUrl: "https://soundcloud.com/vetkat/fhid2" },
  { id: 6, title: "idea",   slug: "idea",   year: 2025, coverArt: null, soundcloudUrl: "https://soundcloud.com/vetkat/fuuu" },
]
```

Clicking a track row: updates disc art, updates player title, auto-starts playing, shows animated bars next to track number.

**SoundCloud embed** (below tracklist):
```html
<iframe
  width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay"
  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2057765336&color=%23ff1aff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
/>
```

**Stream links row:**
- SoundCloud: vetkat — https://soundcloud.com/vetkat
- SoundCloud (alt): @vakante

---

### 5.3 Art (`/art`)

**Cover art images (real URLs):**
```ts
// src/data/artworks.ts
export const artworks = [
  {
    id: 1,
    title: "Ｐａｔｉｅｎｃｅ (صبر) — Cover Art",
    type: "Cover Art",
    year: 2025,
    imageUrl: "https://i1.sndcdn.com/artworks-alS5LTECt8b6FSwo-xyWdIg-t500x500.jpg",
  },
  {
    id: 2,
    title: "Corner Shop — Cover Art",
    type: "Cover Art",
    year: 2023,
    imageUrl: "https://i1.sndcdn.com/artworks-Ud2YSLtr4yD33tIm-UsYZhA-t500x500.jpg",
  },
  // Add more as placeholders with imageUrl: null
]
```

**Layout:**
- Featured hero band (full width, 160px tall) — first artwork or placeholder
- "Series & Projects" — 2×2 card grid with thumb + type + title + meta
- "All works" — 3-column masonry-style grid, hover reveals overlay with title + tag
- Lightbox: clicking any image opens a full-screen overlay with the image centered

---

### 5.4 Zine (`/zine`)

**MDX blog posts** live at `content/zine/*.mdx`

**Frontmatter schema:**
```yaml
---
title: "Patience with your own process"
issue: 4
date: "2025-05-01"
tag: "Mood"          # Mood | Process | Playlist | Visual
excerpt: "In this world of distractions..."
featured: true
---
```

**Index page layout:**
- Featured issue hero card (tape strip "Latest Issue", issue number, title, italic excerpt, date, "Read Issue →" button)
- All issues list: issue number (large faded) + title + meta + tag pill
- Tag filter row: Mood · Process · Playlist · Visual

**Individual post** (`/zine/[slug]`):
- Back link "← All Issues"
- Issue number + title + date
- MDX content rendered with custom components:
  - Spotify/SoundCloud embeds via `<EmbedTrack url="..." />`
  - Pull quotes via `<Pullquote>text</Pullquote>`
  - Image via standard `![alt](url)`

**Seed content:** Create one real MDX file based on the Patience track description:
```
content/zine/patience.mdx
```

---

### 5.5 CV (`/cv`)

**Two views:**
1. HTML styled view (default)
2. PDF download button → `/public/cv.pdf` (placeholder PDF, Nazim replaces)

**Sections:**
- Header: name NAZIM · role "Artist · Musician · Developer" · location "Cape Town, South Africa" · "↓ Download PDF" button (pink bg)
- Practice: Music Production & Release (2020–now, vetkat/vakante) · Visual Art & Collage (2021–now) · Zine/Writing (2024–now)
- Selected Work: Ｐａｔｉｅｎｃｅ (صبر) 2025 · Corner Shop 2023 · [placeholder slots]
- Skills: Music Production · Sound Design · Photography · Collage · Stop Motion · Illustration · Video Editing · Cover Art · Writing · React · TypeScript · .NET · C#
- Links: soundcloud.com/vetkat · instagram.com/nazimrafudeen · github.com/wizard-nazim
- "Available for projects ✦" stamp

---

### 5.6 Contact (`/contact`)

**Social cards (4-up grid, all open in new tab):**
| Platform | Handle | URL |
|----------|--------|-----|
| SoundCloud | vetkat | https://soundcloud.com/vetkat |
| Instagram | @nazimrafudeen | https://www.instagram.com/nazimrafudeen/ |
| GitHub | wizard-nazim | https://github.com/wizard-nazim |
| SoundCloud (track) | Ｐａｔｉｅｎｃｅ (صبر) | https://soundcloud.com/vetkat/sabr |

Each card: platform dot + name · handle · meta · hover rainbow bar + arrow.

**Contact form** — powered by Formspree React:
- Install: `npm install @formspree/react`
- Form ID: `mvzyypjp` (endpoint: https://formspree.io/f/mvzyypjp)
- Fields: Name · Email (side by side) · Subject · Message
- Submit: uses `useForm` hook, show success/error state inline
- Sends to: `nazim.dev@proton.me`

**Availability stamp:** "Open for work ✦" · "Based in Cape Town · Available remotely"

---

## 6. Components List

```
src/components/
├── Shell.tsx              # Global layout grid (logo + header + nav + footer)
├── MagTitle.tsx           # NAZIM magazine letters
├── Ticker.tsx             # Scrolling header ticker
├── NavSidebar.tsx         # Left nav with icons
├── Footer.tsx             # Footer bar
├── DiscPlayer.tsx         # Spinning vinyl disc + tonearm + controls
├── TrackList.tsx          # Tracklist rows
├── ArtGrid.tsx            # Art gallery grid
├── ArtLightbox.tsx        # Full-screen image overlay
├── ZineHero.tsx           # Featured issue card
├── ZineList.tsx           # Issue index list
├── ContactForm.tsx        # Formspree contact form
├── SocialCard.tsx         # Social link card
└── mdx/
    ├── EmbedTrack.tsx     # SoundCloud/Spotify iframe wrapper
    └── Pullquote.tsx      # Styled blockquote
```

---

## 7. Data Files

```
src/data/
├── tracks.ts      # Music tracklist (see section 5.2)
├── artworks.ts    # Art gallery items (see section 5.3)
├── projects.ts    # GitHub/dev projects (optional, for CV)
└── site.ts        # Global site config

// src/data/site.ts
export const site = {
  name: "Nazim",
  handle: "vetkat",
  location: "Cape Town, South Africa",
  email: "nazim.dev@proton.me",
  bio: "Artist · Musician · Developer",
  tagline: "Visual work, original music, and code.",
  socials: {
    soundcloud: "https://soundcloud.com/vetkat",
    soundcloudAlt: "https://soundcloud.com/vakante",
    instagram: "https://www.instagram.com/nazimrafudeen/",
    github: "https://github.com/wizard-nazim",
  },
  logo: "https://i1.sndcdn.com/avatars-ofoqR8mwLm10l01s-zTOFIQ-t500x500.jpg",
}
```

---

## 8. Content Directory

```
content/
└── zine/
    ├── patience.mdx          # Seed post (Issue #04)
    ├── issue-03.mdx          # Placeholder
    ├── issue-02.mdx          # Placeholder
    └── issue-01.mdx          # Placeholder
```

---

## 9. Public Assets

```
public/
├── cv.pdf                   # Placeholder — Nazim replaces with real CV
├── images/
│   ├── patience-cover.jpg   # Download from: https://i1.sndcdn.com/artworks-alS5LTECt8b6FSwo-xyWdIg-t500x500.jpg
│   └── corner-shop-cover.jpg# Download from: https://i1.sndcdn.com/artworks-Ud2YSLtr4yD33tIm-UsYZhA-t500x500.jpg
└── og-image.png             # Open Graph image (use logo or Patience cover)
```

---

## 10. Package Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@next/mdx": "^14.2.0",
    "@mdx-js/loader": "^3.0.0",
    "@mdx-js/react": "^3.0.0",
    "gray-matter": "^4.0.3",
    "next-mdx-remote": "^4.4.1",
    "@formspree/react": "^2.5.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/typography": "^0.5.10"
  }
}
```

---

## 11. Folder Structure

```
nazim-portfolio/
├── app/
│   ├── layout.tsx           # Root layout — imports Shell, global fonts, scanline
│   ├── globals.css          # CSS variables, scanline, base styles
│   ├── page.tsx             # Homepage
│   ├── art/
│   │   └── page.tsx
│   ├── music/
│   │   └── page.tsx
│   ├── zine/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── cv/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
├── src/
│   ├── components/          # (see section 6)
│   └── data/                # (see section 7)
├── content/
│   └── zine/                # (see section 8)
├── public/                  # (see section 9)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 12. next.config.ts

```ts
import createMDX from '@next/mdx'

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i1.sndcdn.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default withMDX(nextConfig)
```

---

## 13. Deployment

- **Host:** Vercel (free tier)
- **Repo:** Push to `github.com/wizard-nazim/nazim-portfolio` (new repo)
- **Deploy:** Connect repo to Vercel, auto-deploys on push to `main`
- **Domain:** Can add custom domain later via Vercel dashboard

---

## 14. Things Nazim Does Manually After Build

1. **Formspree:** Create free account at formspree.io → new form → copy form ID → replace `YOUR_FORM_ID` in `ContactForm.tsx`
2. **CV PDF:** Replace `public/cv.pdf` with your real CV
3. **Cover art images:** They are loaded from SoundCloud CDN URLs directly — no action needed unless you want local copies
4. **Zine content:** Write real MDX posts in `content/zine/`
5. **More art:** Add entries to `src/data/artworks.ts` as you create work
6. **More tracks:** Add entries to `src/data/tracks.ts` as you release
7. **Style tweaks:** All design tokens are CSS variables in `app/globals.css` — change colors, fonts, spacing there

---

## 15. Instructions for Cowork / Claude Code

Build this project exactly as specified. Key priorities:

1. Scaffold the full folder structure first
2. Install all dependencies
3. Implement the Shell layout (logo + header + nav + footer) — this must work before any page content
4. Implement each page in order: Home → Music → Art → Zine → CV → Contact
5. The `DiscPlayer` component is the most complex — implement it carefully per section 5.2
6. Use CSS variables throughout — no hardcoded colors
7. The scanline overlay goes on `body::after` in `globals.css`
8. Google Fonts are loaded via `next/font/google` in `app/layout.tsx`
9. Do not install Framer Motion or any animation library — all animations are pure CSS
10. The contact form uses `@formspree/react` — form ID is `mvzyypjp`, see `ContactForm.tsx` implementation below
11. Create a placeholder `public/cv.pdf` (empty or minimal)
12. Seed all four zine MDX files with placeholder content matching the frontmatter schema

---

## 16. ContactForm.tsx — Full Implementation

```tsx
// src/components/ContactForm.tsx
'use client'
import { useForm, ValidationError } from '@formspree/react'

export default function ContactForm() {
  const [state, handleSubmit] = useForm('mvzyypjp')

  if (state.succeeded) {
    return (
      <div className="contact-form">
        <div className="cf-success">
          <span className="cf-success-stamp">Message sent ✦</span>
          <p className="cf-success-note">
            Thanks — I'll get back to you at nazim.dev@proton.me
          </p>
        </div>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="cf-title">Send a message</div>

      <div className="f-row">
        <div className="form-field">
          <label className="form-label" htmlFor="name">Name</label>
          <input
            id="name"
            className="form-input"
            type="text"
            name="name"
            placeholder="Your name"
            required
          />
          <ValidationError field="name" prefix="Name" errors={state.errors}
            className="cf-field-error" />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            type="email"
            name="email"
            placeholder="your@email.com"
            required
          />
          <ValidationError field="email" prefix="Email" errors={state.errors}
            className="cf-field-error" />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="subject">What's this about?</label>
        <input
          id="subject"
          className="form-input"
          type="text"
          name="subject"
          placeholder="Collab, commission, just saying hi..."
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="message">Message</label>
        <textarea
          id="message"
          className="form-textarea"
          name="message"
          placeholder="Tell me more..."
          required
        />
        <ValidationError field="message" prefix="Message" errors={state.errors}
          className="cf-field-error" />
      </div>

      <ValidationError errors={state.errors} className="cf-form-error" />

      <button
        className="form-submit"
        type="submit"
        disabled={state.submitting}
      >
        {state.submitting ? 'Sending...' : 'Send Message ▶'}
      </button>
    </form>
  )
}
```

**Add to globals.css:**
```css
.cf-field-error {
  font-family: var(--font-courier);
  font-size: 10px;
  color: #ff4444;
  letter-spacing: 1px;
  margin-top: 3px;
  display: block;
}
.cf-form-error {
  font-family: var(--font-courier);
  font-size: 11px;
  color: #ff4444;
  margin-bottom: 10px;
  display: block;
}
.cf-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
}
.cf-success-stamp {
  font-family: var(--font-marker);
  font-size: 20px;
  color: var(--color-accent);
  border: 2px solid var(--color-accent);
  padding: 8px 20px;
  transform: rotate(-2deg);
  display: inline-block;
}
.cf-success-note {
  font-family: var(--font-special);
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}
.form-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```
