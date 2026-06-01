import type { Metadata } from 'next'
import {
  UnifrakturMaguntia,
  Abril_Fatface,
  Permanent_Marker,
  Boogaloo,
  Righteous,
  Special_Elite,
  Courier_Prime,
} from 'next/font/google'
import './globals.css'
import Shell from '@/components/Shell'

const unifraktur = UnifrakturMaguntia({ weight: '400', subsets: ['latin'], variable: '--font-unifraktur' })
const abril = Abril_Fatface({ weight: '400', subsets: ['latin'], variable: '--font-abril' })
const marker = Permanent_Marker({ weight: '400', subsets: ['latin'], variable: '--font-marker' })
const boogaloo = Boogaloo({ weight: '400', subsets: ['latin'], variable: '--font-boogaloo' })
const righteous = Righteous({ weight: '400', subsets: ['latin'], variable: '--font-righteous' })
const special = Special_Elite({ weight: '400', subsets: ['latin'], variable: '--font-special' })
const courier = Courier_Prime({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-courier' })

export const metadata: Metadata = {
  title: 'Nazim — Artist · Musician · Developer',
  description: 'Visual work, original music, and code. Based in Cape Town.',
  openGraph: {
    title: 'Nazim — Artist · Musician · Developer',
    description: 'Visual work, original music, and code. Based in Cape Town.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={[
        unifraktur.variable,
        abril.variable,
        marker.variable,
        boogaloo.variable,
        righteous.variable,
        special.variable,
        courier.variable,
      ].join(' ')}
    >
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
