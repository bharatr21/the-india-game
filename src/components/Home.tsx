import type { View } from '../App.tsx'

type Mode = {
  id: View
  number: string
  title: string
  description: string
  tag: string
  color: 'red' | 'blue' | 'yellow'
}

const MODES: readonly Mode[] = [
  {
    id: 'map', number: '01', title: 'NAME THAT STATE',
    description: 'A state or UT lights up. Name it. Switch on hard mode and name its capital too.',
    tag: 'MAP + RECALL', color: 'red',
  },
  {
    id: 'capitals', number: '02', title: 'CAPITAL CHECK',
    description: 'We give you a state or UT. You type the capital. Keep the streak alive.',
    tag: 'PURE RECALL', color: 'blue',
  },
  {
    id: 'sprint', number: '03', title: 'THE 36 SPRINT',
    description: 'List all 28 states and 8 union territories before the clock runs out. Full names only.',
    tag: 'TIMED', color: 'yellow',
  },
]

type Props = { onNavigate: (view: View) => void }

export default function Home({ onNavigate }: Props) {
  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy reveal">
          <p className="eyebrow">A VERY SERIOUS GEOGRAPHY MACHINE</p>
          <h1>KNOW<br />YOUR<br /><span>STATES.</span></h1>
          <p className="hero-note">Learn the map. Nail the capitals. Beat the clock.</p>
          <button className="brutal-button" onClick={() => onNavigate('map')}>
            START WITH THE MAP →
          </button>
        </div>
        <div className="hero-poster reveal delay-1" aria-label="Thirty-six states and union territories poster">
          <span className="poster-top">EST. 2026 / INDIA</span>
          <strong>36</strong>
          <div className="poster-stripes" />
          <span className="poster-bottom">STATES + UTS<br />ONE GAME</span>
        </div>
      </section>

      <section className="mode-section">
        <div className="section-heading">
          <span>CHOOSE YOUR DRILL</span><span>[03 MODES]</span>
        </div>
        <div className="mode-grid">
          {MODES.map((mode, index) => (
            <button
              key={mode.id}
              className={`mode-card ${mode.color} reveal delay-${index + 1}`}
              onClick={() => onNavigate(mode.id)}
            >
              <span className="mode-number">/{mode.number}</span>
              <span className="mode-tag">{mode.tag}</span>
              <strong>{mode.title}</strong>
              <span className="mode-description">{mode.description}</span>
              <span className="mode-arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <button className="guide-banner" onClick={() => onNavigate('guide')}>
        <span>NOT READY?</span>
        <strong>OPEN THE 36-ENTITY FIELD GUIDE</strong>
        <span>MAP + LIST →</span>
      </button>
    </div>
  )
}
