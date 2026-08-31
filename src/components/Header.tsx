import type { View } from '../App.tsx'

const NAV_ITEMS: readonly (readonly [View, string])[] = [
  ['home', 'HQ'],
  ['map', 'MAP ID'],
  ['capitals', 'CAPITALS'],
  ['sprint', '36 SPRINT'],
  ['guide', 'FIELD GUIDE'],
]

type Props = {
  view: View
  onNavigate: (view: View) => void
}

export default function Header({ view, onNavigate }: Props) {
  return (
    <header className="site-header">
      <button className="wordmark" onClick={() => onNavigate('home')}>
        THE INDIA<br />GAME<span className="wordmark-dot">■</span>
      </button>
      <nav aria-label="Main navigation">
        {NAV_ITEMS.map(([id, label]) => (
          <button
            key={id}
            className={view === id ? 'active' : ''}
            onClick={() => onNavigate(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}
