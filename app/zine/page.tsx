'use client'
import { useState } from 'react'
import Link from 'next/link'

const ISSUES = [
  {
    slug: 'patience',
    issue: 4,
    title: 'Patience with your own process',
    date: '2025-05-01',
    tag: 'Mood',
    excerpt: 'In this world of distractions, learning to sit with the unfinished self and returning to Allah, is its own kind of discipline.',
    featured: true,
  },
  {
    slug: 'making-without-reason',
    issue: 3,
    title: 'Making without a reason',
    date: '2025-02-14',
    tag: 'Process',
    excerpt: 'Not everything needs a destination. Some of the best work comes from pure making — no brief, no audience, no plan.',
    featured: false,
  },
  {
    slug: 'playlist-as-map',
    issue: 2,
    title: 'The playlist as a map',
    date: '2024-11-01',
    tag: 'Playlist',
    excerpt: 'A playlist is a kind of self-portrait. What you put on when you\'re alone says more about you than most things.',
    featured: false,
  },
  {
    slug: 'starting-over-again',
    issue: 1,
    title: 'Starting over (again)',
    date: '2024-08-10',
    tag: 'Visual',
    excerpt: "Every project I've shipped has involved deleting something I was proud of. Here's what I've learned about starting from scratch.",
    featured: false,
  },
]

const TAGS = ['All', 'Mood', 'Process', 'Playlist', 'Visual']

export default function ZinePage() {
  const [activeTag, setActiveTag] = useState('All')
  const featured = ISSUES.find((i) => i.featured)
  const filtered = activeTag === 'All'
    ? ISSUES
    : ISSUES.filter((i) => i.tag === activeTag)

  return (
    <div className="page">
      <div className="eyebrow">Writing</div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Zine</h1>

      {/* Featured hero */}
      {featured && (
        <div className="zine-hero">
          <div className="tape-strip" style={{ position: 'relative', left: -4, top: 0, marginBottom: 12, display: 'inline-block' }}>
            Latest Issue
          </div>
          <div className="zine-issue-num">#{featured.issue}</div>
          <div className="eyebrow" style={{ fontSize: 10 }}>Issue #{featured.issue}</div>
          <div className="zine-hero-title">{featured.title}</div>
          <div className="zine-hero-excerpt">{featured.excerpt}</div>
          <div className="zine-hero-meta">{featured.date} · {featured.tag}</div>
          <Link href={`/zine/${featured.slug}`} className="btn btn-primary">
            Read Issue
          </Link>
        </div>
      )}

      {/* Tag filter */}
      <div className="tag-filter">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`tag-pill${activeTag === tag ? ' active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Issue list */}
      <div className="issue-list">
        {filtered.map((issue) => (
          <Link key={issue.slug} href={`/zine/${issue.slug}`} className="issue-row">
            <div className="issue-row-num">#{issue.issue}</div>
            <div>
              <div className="issue-row-title">{issue.title}</div>
              <div className="issue-row-meta">{issue.date}</div>
            </div>
            <div className="issue-tag-pill">{issue.tag}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
