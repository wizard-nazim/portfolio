export interface Artwork {
  id: number
  title: string
  type: string
  year: number
  imageUrl: string | null
}

export const artworks: Artwork[] = [
  {
    id: 1,
    title: 'Ｐａｔｉｅｎｃｅ (صبر) — Cover Art',
    type: 'Cover Art',
    year: 2025,
    imageUrl: 'https://i1.sndcdn.com/artworks-alS5LTECt8b6FSwo-xyWdIg-t500x500.jpg',
  },
  {
    id: 2,
    title: 'Corner Shop — Cover Art',
    type: 'Cover Art',
    year: 2023,
    imageUrl: 'https://i1.sndcdn.com/artworks-Ud2YSLtr4yD33tIm-UsYZhA-t500x500.jpg',
  },
  {
    id: 3,
    title: 'Untitled Collage #01',
    type: 'Collage',
    year: 2024,
    imageUrl: null,
  },
  {
    id: 4,
    title: 'Untitled Collage #02',
    type: 'Collage',
    year: 2024,
    imageUrl: null,
  },
  {
    id: 5,
    title: 'Stop Motion Study #01',
    type: 'Stop Motion',
    year: 2023,
    imageUrl: null,
  },
  {
    id: 6,
    title: 'Photography Series #01',
    type: 'Photography',
    year: 2022,
    imageUrl: null,
  },
]
