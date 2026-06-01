'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// SVG fallbacks for icons not yet provided
const MusicIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-svg">
    <rect x="3" y="9" width="34" height="22" rx="2" fill="currentColor"/>
    <rect x="9" y="14" width="22" height="12" rx="1" fill="var(--color-bg)"/>
    <circle cx="15" cy="20" r="4" fill="currentColor"/>
    <circle cx="15" cy="20" r="2" fill="var(--color-bg)"/>
    <circle cx="25" cy="20" r="4" fill="currentColor"/>
    <circle cx="25" cy="20" r="2" fill="var(--color-bg)"/>
    <path d="M19 24 L21 24" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="7" cy="13" r="1.5" fill="var(--color-bg)"/>
    <circle cx="33" cy="13" r="1.5" fill="var(--color-bg)"/>
    <circle cx="7" cy="27" r="1.5" fill="var(--color-bg)"/>
    <circle cx="33" cy="27" r="1.5" fill="var(--color-bg)"/>
  </svg>
)

const ZineIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-svg">
    <circle cx="11" cy="12" r="5" fill="currentColor"/>
    <circle cx="11" cy="12" r="2.5" fill="var(--color-bg)"/>
    <circle cx="11" cy="28" r="5" fill="currentColor"/>
    <circle cx="11" cy="28" r="2.5" fill="var(--color-bg)"/>
    <path d="M14 15 L32 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M14 25 L32 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
)

const CVIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-svg">
    <rect x="8" y="4" width="22" height="30" rx="1" fill="currentColor"/>
    <path d="M24 4 L30 10 L24 10 Z" fill="var(--color-bg)"/>
    <rect x="12" y="15" width="12" height="2" rx="1" fill="var(--color-bg)"/>
    <rect x="12" y="20" width="14" height="2" rx="1" fill="var(--color-bg)"/>
    <rect x="12" y="25" width="10" height="2" rx="1" fill="var(--color-bg)"/>
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-svg">
    <rect x="4" y="10" width="32" height="22" rx="2" fill="currentColor"/>
    <path d="M4 12 L20 23 L36 12" stroke="var(--color-bg)" strokeWidth="2.5" fill="none"/>
    <path d="M4 30 L14 22" stroke="var(--color-bg)" strokeWidth="1.5"/>
    <path d="M36 30 L26 22" stroke="var(--color-bg)" strokeWidth="1.5"/>
  </svg>
)

const NAV = [
  {
    href: '/',
    label: 'Home',
    imgSrc: '/nav-icons/home.jpg',
  },
  {
    href: '/art',
    label: 'Art',
    imgSrc: '/nav-icons/art.jpg',
  },
  {
    href: '/music',
    label: 'Music',
    imgSrc: null,
    fallback: <MusicIcon />,
  },
  {
    href: '/zine',
    label: 'Zine',
    imgSrc: null,
    fallback: <ZineIcon />,
  },
  {
    href: '/cv',
    label: 'CV',
    imgSrc: '/nav-icons/nerd.jpg',
  },
  {
    href: '/contact',
    label: 'Mail',
    imgSrc: null,
    fallback: <MailIcon />,
  },
]

export default function NavSidebar() {
  const path = usePathname()
  return (
    <div className="nav-items-col">
      {NAV.map((item) => {
        const isActive = item.href === '/' ? path === '/' : path.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon-wrap">
              {item.imgSrc ? (
                <Image
                  src={item.imgSrc}
                  alt={item.label}
                  width={38}
                  height={38}
                  className="nav-img"
                  unoptimized
                />
              ) : (
                item.fallback
              )}
            </span>
            <span className="nav-label">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
