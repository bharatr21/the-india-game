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
  const { transform, zoomIn, zoomOut, reset } = useZoom(svgRef)

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

          {/* TODO(human, deferred): draw the marker for a highlighted tiny entity.
              MAP_SHAPES carries `tiny` and a projected `centroid`; .tiny-marker
              and .tiny-leader already exist in styles.css. */}

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
