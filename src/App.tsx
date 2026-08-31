import { useEffect, useState } from 'react'
import Header from './components/Header.tsx'
import Home from './components/Home.tsx'
import MapGame from './modes/MapGame.tsx'
import CapitalsGame from './modes/CapitalsGame.tsx'
import Sprint from './modes/Sprint.tsx'
import FieldGuide from './modes/FieldGuide.tsx'

export type View = 'home' | 'map' | 'capitals' | 'sprint' | 'guide'

export default function App() {
  const [view, setView] = useState<View>('home')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  return (
    <div className="app-shell">
      <Header view={view} onNavigate={setView} />
      <main>
        {view === 'home' && <Home onNavigate={setView} />}
        {view === 'map' && <MapGame />}
        {view === 'capitals' && <CapitalsGame />}
        {view === 'sprint' && <Sprint />}
        {view === 'guide' && <FieldGuide />}
      </main>
      <footer>
        <span>THE INDIA GAME / PHASE 01</span>
        <span>28 STATES · 8 UTS · 1 COUNTRY</span>
      </footer>
    </div>
  )
}
