import SocialCard from '@/components/SocialCard'
import ContactForm from '@/components/ContactForm'

const SOCIALS = [
  {
    platform: 'SoundCloud',
    name: 'vetkat',
    handle: '@vetkat',
    meta: 'Original music · Cape Town',
    href: 'https://soundcloud.com/vetkat',
  },
  {
    platform: 'Instagram',
    name: 'nazimrafudeen',
    handle: '@nazimrafudeen',
    meta: 'Visual work · updates',
    href: 'https://www.instagram.com/nazimrafudeen/',
  },
  {
    platform: 'GitHub',
    name: 'wizard-nazim',
    handle: '@wizard-nazim',
    meta: 'Code · .NET · React · TypeScript',
    href: 'https://github.com/wizard-nazim',
  },
  {
    platform: 'SoundCloud',
    name: 'Ｐａｔｉｅｎｃｅ (صبر)',
    handle: 'Latest single',
    meta: 'Single · 2025 · vetkat',
    href: 'https://soundcloud.com/vetkat/sabr',
  },
]

export default function ContactPage() {
  return (
    <div className="page">
      <div className="eyebrow">Get in touch</div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Contact</h1>

      {/* Social cards */}
      <div className="section-label">Find me online</div>
      <div className="social-grid" style={{ marginBottom: 32 }}>
        {SOCIALS.map((s) => (
          <SocialCard key={s.href} {...s} />
        ))}
      </div>

      {/* Contact form */}
      <div className="section-label">Send a message</div>
      <ContactForm />

      {/* Availability */}
      <div className="availability-stamp">
        <span className="stamp-label">Open for work</span>
        <span className="stamp-location">Based in Cape Town · Available remotely</span>
      </div>
    </div>
  )
}
