const ITEMS = [
  'New music out now',
  'Cape Town',
  'Artist',
  'Musician',
  'Developer',
  'Storyteller',
  'Available for collabs',
  'vetkat on SoundCloud',
  'New music out now',
  'Cape Town',
  'Artist',
  'Musician',
  'Developer',
  'Storyteller',
  'Available for collabs',
  'vetkat on SoundCloud',
]

export default function Ticker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {ITEMS.map((item, i) => (
          <span key={i}>
            {item}
            <span className="ticker-sep">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
