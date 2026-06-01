import Image from 'next/image'

export default function MagTitle() {
  return (
    <div className="newsprint-title">
      <Image
        src="/nazim-header.png"
        alt="nazim"
        width={220}
        height={44}
        style={{ height: 44, width: 'auto', objectFit: 'contain' }}
        priority
      />
    </div>
  )
}
