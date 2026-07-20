# Nazim's Portfolio

A personal portfolio website built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Three.js**. Features original music, visual art, technical projects, and a vintage synthwave aesthetic inspired by retro design.

🎵 **Live:** https://portfolio-murex-beta-w3qzug647r.vercel.app

---

## Overview

**Nazim Rafudeen** is an artist, musician, and developer based in Cape Town, South Africa. This portfolio showcases:

- 🎵 **Original music** (produced as *vetkat*)
- 📷 **Visual art & collage**
- ✍️ **Zine/writing** (MDX-based blog)
- 💻 **Technical work** (React, TypeScript, .NET)
- ✉️ **Contact & collaboration opportunities**

The site combines indie / pop-art / vintage aesthetic with interactive web experiences.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 14 (App Router) · React 18 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 · CSS Grid · CSS animations |
| **3D Graphics** | Three.js · React Three Fiber |
| **Content** | MDX (for zine posts) |
| **Forms** | Formspree (contact form) |
| **Deployment** | Vercel |
| **Analytics** | Vercel Analytics |

**Language composition:**
- TypeScript: 63%
- CSS: 32.7%
- MDX: 3.9%
- JavaScript: 0.4%

---

## Project Structure

```
nazim-portfolio/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage with hero & latest cards
│   ├── layout.tsx                # Root layout (Shell, fonts, globals)
│   ├── globals.css               # CSS variables, scanlines, base styles
│   ├── art/page.tsx              # Art gallery grid + lightbox
│   ├── music/page.tsx            # Disc player + tracklist
│   ├── zine/
│   │   ├── page.tsx              # Zine index with featured issue
│   │   └── [slug]/page.tsx       # Individual MDX post
│   ├── cv/page.tsx               # CV (HTML + PDF download)
│   └── contact/page.tsx          # Contact form + social links
├── src/
│   ├── components/               # Reusable React components
│   │   ├── Shell.tsx             # Global layout (logo, header, nav, footer)
│   │   ├── MagTitle.tsx          # "NAZIM" magazine letters
│   │   ├── Ticker.tsx            # Scrolling header ticker
│   │   ├── NavSidebar.tsx        # Left navigation
│   │   ├── Footer.tsx            # Footer bar
│   │   ├── DiscPlayer.tsx        # Spinning vinyl player
│   │   ├── TrackList.tsx         # Music tracklist
│   │   ├── ArtGrid.tsx           # Art gallery layout
│   │   ├── ArtLightbox.tsx       # Full-screen image overlay
│   │   ├── ZineHero.tsx          # Featured zine card
│   │   ├── ZineList.tsx          # Issue index
│   │   ├── ContactForm.tsx       # Formspree contact form
│   │   ├── SocialCard.tsx        # Social link card
│   │   ├── HeroSceneWrapper.tsx  # Three.js 3D hero scene
│   │   └── mdx/                  # MDX custom components
│   │       ├── EmbedTrack.tsx    # SoundCloud/Spotify embeds
│   │       └── Pullquote.tsx     # Styled blockquotes
│   └── data/                     # Static data
│       ├── tracks.ts             # Music tracklist
│       ├── artworks.ts           # Art gallery items
│       ├── projects.ts           # Dev projects (CV)
│       └── site.ts               # Global site config
├── content/
│   └── zine/                     # MDX blog posts
│       ├── patience.mdx          # Seed post (Issue #4)
│       ├── issue-03.mdx
│       ├── issue-02.mdx
│       └── issue-01.mdx
├── public/                       # Static assets
│   ├── cv.pdf                    # CV download (placeholder)
│   ├── bg.gif                    # Homepage background
│   ├── homepage-gif.gif          # Hero fallback (2D)
│   └── images/
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | **Homepage** – Hero with intro + latest drops (music, zine, dev) |
| `/art` | **Art gallery** – Visual works with lightbox |
| `/music` | **Music player** – Disc player + track list + SoundCloud embeds |
| `/zine` | **Zine index** – Featured issue + all posts with tag filters |
| `/zine/[slug]` | **Individual post** – MDX-rendered article |
| `/cv` | **CV** – HTML resume + PDF download link |
| `/contact` | **Contact** – Social links + Formspree contact form |

---

## Key Features

### 🎵 Disc Player
- Spinning vinyl with animated tonearm
- Play/pause · previous/next · shuffle controls
- Track cover art display
- Progress bar (visual)
- Glow ring animation when playing
- Integrated SoundCloud embeds

**Tracks:**
- **Ｐａｔｉｅｎｃｅ (صبر)** – 2025 single
- **Corner Shop** – 2023
- **ulontitled**, **upside down id**, **idea 2**, **idea** – 2025–26

### 🎨 Design System
**Aesthetic:** Indie / pop-art / vintage / synthwave / newsprint

**Color palette:**
```css
--color-bg:        #0a0a0a       /* deep black */
--color-text:      #f0e6c8       /* cream */
--color-accent:    #ff1aff       /* hot pink */
--color-accent2:   #ff6600       /* orange */
--color-accent3:   #ffcc00       /* yellow */
```

**Typography:**
- Headings: Abril Fatface, Permanent Marker, Righteous
- Body: Special Elite (warm, handwritten vibe)
- UI: Courier Prime (monospace labels)

**Visual effects:**
- Scanline overlay (via `body::after`)
- Magazine-style letter tiles (N/A/Z/I/M)
- Card hover effects (rotate, lift, pink border)
- Corner fold decorations

### 📝 MDX Zine
Blog posts with rich frontmatter:
```yaml
---
title: "Patience with your own process"
issue: 4
date: "2025-05-01"
tag: "Mood"          # Mood | Process | Playlist | Visual
excerpt: "..."
featured: true
---
```

Custom MDX components:
- `<EmbedTrack url="..." />` – SoundCloud/Spotify embeds
- `<Pullquote>text</Pullquote>` – Styled blockquotes
- Standard Markdown images & lists

### 📞 Contact Form
Powered by **Formspree** (`mvzyypjp`):
- Name, email, subject, message fields
- Real-time validation
- Success/error states
- Emails to `nazim.dev@proton.me`

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/wizard-nazim/portfolio.git
cd portfolio
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm run start
```

### 4. Lint

```bash
npm run lint
```

---

## Environment Setup

No `.env` files required for basic functionality. The site uses:
- **Vercel Analytics** (automatic on Vercel)
- **Formspree** (form ID in code: `mvzyypjp`)

### To customize the Formspree form:
1. Go to [formspree.io](https://formspree.io)
2. Create a new form or reuse `mvzyypjp`
3. Update the form ID in `src/components/ContactForm.tsx`

---

## Content & Customization

### Adding Music Tracks
Edit `src/data/tracks.ts`:

```typescript
export const tracks = [
  {
    id: 1,
    title: "Track Name",
    slug: "track-slug",
    year: 2025,
    tag: "Single",
    coverArt: "https://...",
    soundcloudUrl: "https://soundcloud.com/vetkat/...",
  },
  // ...
]
```

### Adding Art
Edit `src/data/artworks.ts`:

```typescript
export const artworks = [
  {
    id: 1,
    title: "Ｐａｔｉｅｎｃｅ (صبر) — Cover Art",
    type: "Cover Art",
    year: 2025,
    imageUrl: "https://...",
  },
  // ...
]
```

### Writing Zine Posts
Create new `.mdx` files in `content/zine/`:

```mdx
---
title: "Post Title"
issue: 5
date: "2025-06-01"
tag: "Process"
excerpt: "Brief excerpt..."
featured: false
---

# Heading

Your content here.

<EmbedTrack url="https://soundcloud.com/vetkat/track" />

> Pull quote text

![Alt text](image.jpg)
```

---

## Deployment

### Vercel (Recommended)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel auto-detects Next.js settings
5. Click "Deploy"
6. Each push to `main` auto-deploys

**Custom domain:**
- In Vercel dashboard, go to Settings → Domains
- Add your custom domain and follow DNS instructions

---

## Scripts

```json
{
  "dev": "next dev",         // Run local dev server
  "build": "next build",     // Build for production
  "start": "next start",     // Start production server
  "lint": "next lint"        // Run ESLint
}
```

---

## Dependencies

**Production:**
- `next` (14.2+) – React framework
- `react`, `react-dom` (18.3+)
- `three` (0.168) – 3D graphics
- `@react-three/fiber` (8.18) – React wrapper for Three.js
- `@react-three/drei` (9.122) – Three.js utilities
- `@formspree/react` (2.5+) – Contact form
- `@vercel/analytics` (2.0+) – Page analytics

**Development:**
- `typescript` (5.0+)
- `tailwindcss` (3.4+)
- `autoprefixer`
- `postcss`
- `eslint` + `eslint-config-next`
- `@types/react`, `@types/node`, `@types/three`

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

*Note: 3D scenes (Three.js) require WebGL support.*

---

## Performance

- **Lighthouse optimized** – Images lazy-loaded, CSS critical path inlined
- **Static generation** – Pages pre-rendered at build time
- **Image optimization** – Next.js `<Image />` with remotePatterns
- **Vercel Analytics** – Built-in performance monitoring

---

## FAQ

**Q: How do I update the contact form email?**  
A: In `src/components/ContactForm.tsx`, update the Formspree form ID and configure your email in the Formspree dashboard.

**Q: Can I use my own 3D hero scene?**  
A: Yes! Edit `src/components/HeroSceneWrapper.tsx`. The `USE_THREE_HERO` toggle in `app/page.tsx` lets you disable 3D and use a 2D fallback.

**Q: How do I download as PDF?**  
A: Replace `public/cv.pdf` with your actual CV. The link in `/cv` points to this file.

**Q: Can I add a newsletter signup?**  
A: Yes, integrate a service like Substack or ConvertKit into the footer or a dedicated page.

**Q: How do I change colors?**  
A: All design tokens are CSS variables in `app/globals.css`:

```css
--color-bg: #0a0a0a;
--color-accent: #ff1aff;
/* ... update as needed */
```

---

## License

This project is open source. Customization and personal use encouraged. If you fork, please credit the original design.

---

## Credits

**Built by:** Nazim Rafudeen  
**Design inspiration:** Indie/synthwave/pop-art/vintage  
**Audio:** [SoundCloud · vetkat](https://soundcloud.com/vetkat)  
**Visual:** [Instagram · @nazimrafudeen](https://www.instagram.com/nazimrafudeen/)  
**Code:** [GitHub · wizard-nazim](https://github.com/wizard-nazim)

---

## Contact & Social

- 🎵 **SoundCloud:** [vetkat](https://soundcloud.com/vetkat)
- 📷 **Instagram:** [@nazimrafudeen](https://www.instagram.com/nazimrafudeen/)
- 💻 **GitHub:** [wizard-nazim](https://github.com/wizard-nazim)
- ✉️ **Email:** nazim.dev@proton.me

**Available for:** Collaborations · Commissions · Projects · Collabs

---

*Handmade with love and passion ✦ in Cape Town, 2025*
