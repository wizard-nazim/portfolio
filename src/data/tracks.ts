export interface Track {
  id: number
  title: string
  slug: string
  year: number
  tag?: string
  coverArt: string | null
  soundcloudUrl: string
  soundcloudTrackId?: string
}

export const tracks: Track[] = [
  {
    id: 1,
    title: 'Ｐａｔｉｅｎｃｅ (صبر)',
    slug: 'sabr',
    year: 2025,
    tag: 'Single',
    coverArt: 'https://i1.sndcdn.com/artworks-alS5LTECt8b6FSwo-xyWdIg-t500x500.jpg',
    soundcloudUrl: 'https://soundcloud.com/vetkat/sabr',
    soundcloudTrackId: '2057765336',
  },
  {
    id: 2,
    title: 'Corner Shop',
    slug: 'corner-shop',
    year: 2023,
    coverArt: null,
    soundcloudUrl: 'https://soundcloud.com/vetkat/vetkat-afternoon',
  },
  {
    id: 3,
    title: 'ulontitled',
    slug: 'ulontitled',
    year: 2026,
    coverArt: null,
    soundcloudUrl: 'https://soundcloud.com/vetkat/ulontitled',
  },
  {
    id: 4,
    title: 'upside down id',
    slug: 'upside-down-id',
    year: 2025,
    coverArt: null,
    soundcloudUrl: 'https://soundcloud.com/vetkat/upside-down-id',
  },
  {
    id: 5,
    title: 'idea 2',
    slug: 'idea-2',
    year: 2025,
    coverArt: null,
    soundcloudUrl: 'https://soundcloud.com/vetkat/fhid2',
  },
  {
    id: 6,
    title: 'idea',
    slug: 'idea',
    year: 2025,
    coverArt: null,
    soundcloudUrl: 'https://soundcloud.com/vetkat/fuuu',
  },
]
