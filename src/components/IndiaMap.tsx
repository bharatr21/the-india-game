import { useRef } from 'react'
import { MAP_HEIGHT, MAP_SHAPES, MAP_WIDTH } from '../map/projection.ts'
import { useZoom } from '../map/useZoom.ts'
import type { Entity, EntityCode } from '../data/states.ts'

type Props = {
  highlightedCode?: EntityCode
  selectedCode?: EntityCode
  answeredCodes?: ReadonlySet<EntityCode>
  showLabels?: boolean
  onSelect?: (entity: Entity) => void
}

const EMPTY: ReadonlySet<EntityCode> = new Set()

export default function IndiaMap({
  highlightedCode,
  selectedCode,
  answeredCodes = EMPTY,
  showLabels = false,
  onSelect,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const { transform, scale, zoomIn, zoomOut, reset } = useZoom(svgRef)

  // A tiny entity is a few pixels across at full extent, so highlighting it
  // changes nothing a player can see. Ring it instead.
  //
  // `highlightedCode` is the game asking a question; `selectedCode` is the
  // Field Guide showing a selection. No caller passes both.
  const marked = MAP_SHAPES.find(
    (shape) => shape.tiny && shape.entity.code === (highlightedCode ?? selectedCode),
  )
  // The code label would hand the player the answer while the game is asking,
  // so it appears only for a Field Guide selection.
  const showCalloutLabel = marked !== undefined && highlightedCode === undefined

  // Point the leader at open space rather than across the country: entities
  // west of centre get a leader running out into the Arabian Sea, those east
  // of it into the Bay of Bengal. Pointing right from Lakshadweep drops the
  // label on the Kerala coast, on top of the KA and KL labels.
  const dirX = marked && marked.centroid[0] < MAP_WIDTH / 2 ? -1 : 1

  return (
    <div className="map-frame">
      <div className="map-corner">N↑</div>
      <svg
        ref={svgRef}
        className="india-map"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label="Map of India"
      >
        <g transform={transform}>
          {MAP_SHAPES.map((shape) => {
            const { entity } = shape
            const className = [
              'state-shape',
              shape.tiny ? 'tiny' : '',
              highlightedCode === entity.code ? 'highlighted' : '',
              selectedCode === entity.code ? 'selected' : '',
              answeredCodes.has(entity.code) ? 'answered' : '',
              onSelect ? 'clickable' : '',
            ].filter(Boolean).join(' ')

            return (
              <path
                key={entity.code}
                d={shape.d}
                className={className}
                aria-label={entity.name}
                role={onSelect ? 'button' : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onClick={() => onSelect?.(entity)}
                onKeyDown={(event) => {
                  if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault()
                    onSelect(entity)
                  }
                }}
              />
            )
          })}

          {marked && (
            <g className="tiny-callout" aria-hidden="true">
              {/* Radius shrinks as the player zooms in so the ring tightens onto
                  the region instead of swallowing it, while non-scaling-stroke
                  and a divided font-size keep strokes and text a constant size
                  on screen at any zoom. */}
              <circle
                className="tiny-marker"
                cx={marked.centroid[0]}
                cy={marked.centroid[1]}
                r={26 / scale}
                vectorEffect="non-scaling-stroke"
              />
              {showCalloutLabel && (
                <>
                  <line
                    className="tiny-leader"
                    x1={marked.centroid[0] + (18 / scale) * dirX}
                    y1={marked.centroid[1] - 18 / scale}
                    x2={marked.centroid[0] + (46 / scale) * dirX}
                    y2={marked.centroid[1] - 46 / scale}
                    vectorEffect="non-scaling-stroke"
                  />
                  <text
                    className="tiny-callout-label"
                    x={marked.centroid[0] + (50 / scale) * dirX}
                    y={marked.centroid[1] - 48 / scale}
                    textAnchor={dirX === -1 ? 'end' : 'start'}
                    style={{ fontSize: `${13 / scale}px` }}
                  >
                    {marked.entity.code}
                  </text>
                </>
              )}
            </g>
          )}

          {showLabels && MAP_SHAPES.filter((shape) => !shape.tiny).map((shape) => (
            <text
              key={shape.entity.code}
              x={shape.centroid[0]}
              y={shape.centroid[1]}
              className="state-label"
            >
              {shape.entity.code}
            </text>
          ))}
        </g>
      </svg>

      <div className="map-controls">
        <button className="brutal-button" onClick={zoomIn} aria-label="Zoom in">+</button>
        <button className="brutal-button" onClick={zoomOut} aria-label="Zoom out">−</button>
        <button className="text-button" onClick={reset}>RESET VIEW</button>
      </div>

      <div className="map-caption">MERCATOR PROJECTION / NOT TO SCALE</div>
      <p className="map-attribution">
        BOUNDARIES: SURVEY OF INDIA VIA{' '}
        <a href="https://github.com/yashveeeeeeer/india-geodata">INDIA-GEODATA</a>,{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. SIMPLIFIED.
      </p>
    </div>
  )
}
