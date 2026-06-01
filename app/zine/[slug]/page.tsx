import Link from 'next/link'
import { notFound } from 'next/navigation'
import EmbedTrack from '@/components/mdx/EmbedTrack'
import Pullquote from '@/components/mdx/Pullquote'

interface Issue {
  slug: string
  issue: number
  title: string
  date: string
  tag: string
  content: string
}

const ISSUES: Issue[] = [
  {
    slug: 'patience',
    issue: 4,
    title: 'Patience with your own process',
    date: '2025-05-01',
    tag: 'Mood',
    content: `patience`,
  },
  {
    slug: 'issue-03',
    issue: 3,
    title: 'Making without a reason',
    date: '2025-02-14',
    tag: 'Process',
    content: `issue-03`,
  },
  {
    slug: 'issue-02',
    issue: 2,
    title: 'The playlist as a map',
    date: '2024-11-01',
    tag: 'Playlist',
    content: `issue-02`,
  },
  {
    slug: 'issue-01',
    issue: 1,
    title: 'Starting over (again)',
    date: '2024-08-10',
    tag: 'Visual',
    content: `issue-01`,
  },
]

const CONTENT: Record<string, React.ReactNode> = {
  patience: (
    <>
      <p>
        There is a version of making things that is entirely about the output — the finished track, the published post, the shipped feature. I used to live there. Everything was a means to an end, and the end was something other people could see.
      </p>
      <p>
        Then I made a song I couldn&apos;t finish for two years. Not because it was hard. Because it felt too honest.
      </p>
      <Pullquote>
        Patience isn&apos;t waiting. It&apos;s continuing to show up for the thing even when it doesn&apos;t show up for you.
      </Pullquote>
      <p>
        The track is called Ｐａｔｉｅｎｃｅ (صبر) — the Arabic word for patience, sabr. It carries more weight than the English version. Sabr implies active endurance. A deliberate holding-on.
      </p>
      <p>
        I&apos;ve been thinking about how that applies to creative work. Not the romantic version — suffering for your art, waiting for inspiration — but the practical, unglamorous kind. Returning to the project file on a Tuesday evening when you don&apos;t feel like it. Letting the half-finished thing sit without deleting it.
      </p>
      <EmbedTrack url="https://soundcloud.com/vetkat/sabr" />
      <p>
        What I&apos;ve learned is that the gap between starting and finishing is mostly made of the times you almost gave up. Every piece of work I&apos;m proud of has a graveyard of abandoned drafts behind it. The patience isn&apos;t in the waiting — it&apos;s in the returning.
      </p>
      <p>
        If you&apos;re sitting with an unfinished thing right now: don&apos;t delete it. Come back tomorrow. Or next week. The work will still be there.
      </p>
    </>
  ),
  'issue-03': (
    <>
      <p>
        I made a beat last week that I&apos;ll never release. Not because it&apos;s bad — it might be the best thing I&apos;ve made in months. But I made it for no reason, and releasing it would give it a reason, and that would change what it is.
      </p>
      <Pullquote>
        The best reason to make something is that you can&apos;t not make it.
      </Pullquote>
      <p>
        There&apos;s something that happens when you remove the audience from the equation. You stop second-guessing the choices. You make the weird transition because it feels right, not because you think people will get it. You stay in the session for four hours because you&apos;re actually enjoying it.
      </p>
      <p>
        I&apos;m not saying don&apos;t release things. I&apos;m saying: keep some things just for making. The practice of making without a destination is what keeps the rest of your work honest.
      </p>
    </>
  ),
  'issue-02': (
    <>
      <p>
        I can read my own playlists like a diary. The lo-fi stuff from 2021 when I was trying to focus. The chaotic mix from mid-2023 when everything felt like too much. The current one — slower, spacier — that I can&apos;t quite explain yet.
      </p>
      <Pullquote>
        A playlist is a self-portrait you make without realising it.
      </Pullquote>
      <p>
        What we put on when we&apos;re alone, when no one is watching, says more about where we actually are than almost anything else. It&apos;s not curated. It&apos;s honest.
      </p>
      <p>
        I&apos;ve started thinking of the playlists I make as maps — not of places, but of states. If I can figure out what mood a playlist describes, I can usually figure out what I need. Sometimes that&apos;s clarity. Sometimes it&apos;s just permission to feel the thing I&apos;m already feeling.
      </p>
    </>
  ),
  'issue-01': (
    <>
      <p>
        The first version of this portfolio had a completely different design. I spent three weeks on it, built everything from scratch, and then deleted it all and started over the night before I wanted to launch.
      </p>
      <p>
        This has happened to me more times than I can count. With music, with code, with writing. You get to a certain point and you realise the foundations are wrong — not the execution, the premise. And you have to make the call.
      </p>
      <Pullquote>
        Starting over isn&apos;t failure. It&apos;s the fastest path to something true.
      </Pullquote>
      <p>
        What I&apos;ve learned is that the time you spent on the wrong thing isn&apos;t wasted. It&apos;s how you figured out it was wrong. The deleted version wasn&apos;t a mistake — it was research.
      </p>
      <p>
        If you&apos;re considering starting over on something: you probably already know whether you should. The question is whether you&apos;re willing to trust that knowledge.
      </p>
    </>
  ),
}

export function generateStaticParams() {
  return ISSUES.map((i) => ({ slug: i.slug }))
}

export default function ZinePostPage({ params }: { params: { slug: string } }) {
  const issue = ISSUES.find((i) => i.slug === params.slug)
  if (!issue) notFound()

  return (
    <div className="page">
      <Link href="/zine" className="zine-back">All Issues</Link>

      <div className="zine-post">
        <div className="zine-post-meta">
          <span>Issue #{issue.issue}</span>
          <span>·</span>
          <span>{issue.date}</span>
          <span>·</span>
          <span>{issue.tag}</span>
        </div>
        <h1 className="zine-post-title">{issue.title}</h1>

        <div className="zine-post-body">
          {CONTENT[issue.slug]}
        </div>
      </div>
    </div>
  )
}
