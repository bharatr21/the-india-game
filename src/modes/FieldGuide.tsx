import { useState } from 'react'
import IndiaMap from '../components/IndiaMap.tsx'
import { ENTITIES, type Entity } from '../data/states.ts'
import { arrangeEntities, type SortKey, type TypeFilter } from '../game.ts'

export default function FieldGuide() {
  const [mode, setMode] = useState<'map' | 'list'>('map')
  const [selected, setSelected] = useState<Entity>(ENTITIES[0]!)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [filter, setFilter] = useState<TypeFilter>('all')

  const rows = arrangeEntities(ENTITIES, sortKey, filter)

  return (
    <div className="page guide-page">
      <div className="guide-title">
        <div>
          <p className="eyebrow">REFERENCE DESK / ALL 36</p>
          <h1>THE FIELD GUIDE</h1>
        </div>
        <div className="view-switch">
          <button className={mode === 'map' ? 'active' : ''} onClick={() => setMode('map')}>MAP VIEW</button>
          <button className={mode === 'list' ? 'active' : ''} onClick={() => setMode('list')}>LIST VIEW</button>
        </div>
      </div>

      {mode === 'map' ? (
        <div className="guide-map-layout">
          <IndiaMap selectedCode={selected.code} showLabels markAllTiny onSelect={setSelected} />
          <aside className="state-dossier">
            <span className="dossier-number">LGD / {selected.lgdCode}</span>
            <strong>{selected.code}</strong>
            <h2>{selected.name}</h2>
            <div><span>TYPE</span><b>{selected.type === 'state' ? 'STATE' : 'UNION TERRITORY'}</b></div>
            <div><span>CAPITAL</span><b>{selected.capital}</b></div>
            {selected.capitalAliases.length > 0 && (
              <div><span>ALSO</span><b>{selected.capitalAliases.join(', ')}</b></div>
            )}
            <p>SELECT ANY STATE OR UT ON THE MAP TO INSPECT IT.</p>
          </aside>
        </div>
      ) : (
        <>
          <div className="guide-controls">
            <div className="view-switch" aria-label="Filter by type">
              {(['all', 'state', 'ut'] as const).map((value) => (
                <button
                  key={value}
                  className={filter === value ? 'active' : ''}
                  onClick={() => setFilter(value)}
                >
                  {value === 'all' ? 'ALL 36' : value === 'state' ? '28 STATES' : '8 UTS'}
                </button>
              ))}
            </div>
            <div className="view-switch" aria-label="Sort by">
              {(['name', 'code', 'capital', 'type'] as const).map((value) => (
                <button
                  key={value}
                  className={sortKey === value ? 'active' : ''}
                  onClick={() => setSortKey(value)}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="state-list" role="list">
            <div className="list-header">
              <span># / NAME</span><span>ISO</span><span>LGD</span><span>CAPITAL</span>
            </div>
            {rows.map((entity, index) => (
              <button
                key={entity.code}
                role="listitem"
                onClick={() => { setSelected(entity); setMode('map') }}
              >
                <span><i>{String(index + 1).padStart(2, '0')}</i>{entity.name}</span>
                <b>{entity.code}</b>
                <b>{entity.lgdCode}</b>
                <span>{entity.capital}</span>
              </button>
            ))}
          </div>
          <p className="guide-footnote">
            ISO 3166-2:IN CODES, CURRENT AS OF THE 23 NOV 2023 REVISION. LGD CODES FROM THE
            LOCAL GOVERNMENT DIRECTORY, MINISTRY OF PANCHAYATI RAJ. THESE AGREE WITH THE
            VEHICLE REGISTRATION CODES ON NUMBER PLATES FOR 35 OF THE 36 — THE EXCEPTION IS
            DADRA &amp; NAGAR HAVELI AND DAMAN &amp; DIU, WHICH IS <b>DH</b> IN ISO BUT
            APPEARS AS <b>DD</b> ON PLATES.
          </p>
        </>
      )}
    </div>
  )
}
