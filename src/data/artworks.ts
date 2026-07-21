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
    title: 'Sabr',
    type: 'Track',
    year: 2025,
    imageUrl: 'https://i1.sndcdn.com/artworks-alS5LTECt8b6FSwo-xyWdIg-t500x500.jpg',
  },
  {
    id: 2,
    title: 'Afternoon',
    type: 'Track',
    year: 2023,
    imageUrl: 'https://i1.sndcdn.com/artworks-Ud2YSLtr4yD33tIm-UsYZhA-t500x500.jpg',
  },
  {
    id: 3,
    title: 'Vetkat',
    type: 'Artwork',
    year: 2024,
    imageUrl: '/art-images/art-img4.jpeg',
  },
  {
    id: 4,
    title: 'WIP',
    type: 'Artwork',
    year: 2024,
    imageUrl: '/wip.png',
  },
  {
    id: 5,
    title: 'ID-DIHP',
    type: 'Track',
    year: 2023,
    imageUrl: '/art-images/art-img2.jpg',
  },
  {
    id: 6,
    title: 'ID-NA',
    type: 'Track',
    year: 2022,
    imageUrl: '/art-images/art-img3.jpg',
  },
    {
    id: 7,
    title: 'ID-FIRELADY',
    type: 'Artwork',
    year: 2022,
    imageUrl: '/img2.jpg',
  },
     {
    id: 8,
    title: 'ID-MM',
    type: 'Track',
    year: 2022,
    imageUrl: '/art-images/art-img7.jpg',
  },
     {
    id: 9,
    title: 'ID-LS',
    type: 'Track',
    year: 2022,
    imageUrl: '/art-images/art-img6.jpg',
  },
       {
    id: 10,
    title: 'ID-GGF',
    type: 'Track',
    year: 2022,
    imageUrl: '/art-images/art-img1.jpg',
  },
]
