interface Props {
  platform: string
  name: string
  handle: string
  meta: string
  href: string
}

export default function SocialCard({ platform, name, handle, meta, href }: Props) {
  return (
    <a className="social-card" href={href} target="_blank" rel="noopener noreferrer">
      <div className="social-card-platform">
        <span className="social-dot" />
        {platform}
      </div>
      <div className="social-card-name">{name}</div>
      <div className="social-card-handle">{handle}</div>
      <div className="social-card-meta">{meta}</div>
      <span className="social-card-arrow">↗</span>
    </a>
  )
}
