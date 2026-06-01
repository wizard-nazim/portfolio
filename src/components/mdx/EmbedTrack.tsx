interface Props {
  url: string
  height?: number
}

export default function EmbedTrack({ url, height = 166 }: Props) {
  const encodedUrl = encodeURIComponent(url)
  const src = `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff1aff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`

  return (
    <div className="sc-embed-wrap" style={{ margin: '24px 0' }}>
      <iframe
        width="100%"
        height={height}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={src}
      />
    </div>
  )
}
