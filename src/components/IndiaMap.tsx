import { useRef } from 'react'
import { MAP_HEIGHT, MAP_SHAPES, MAP_WIDTH, type MapShape } from '../map/projection.ts'
import { useZoom } from '../map/useZoom.ts'
import type { Entity, EntityCode } from '../data/states.ts'

type Props = {
  highlightedCode?: EntityCode
  selectedCode?: EntityCode
  answeredCodes?: ReadonlySet<EntityCode>
  showLabels?: boolean
  /**
   * Ring and label every tiny entity permanently, rather than only the one
   * being highlighted or selected. The Field Guide wants this: it is a
   * reference, so a learner should see where Lakshadweep and Chandigarh are
   * without having to click each one to find out.
   */
  markAllTiny?: boolean
  onSelect?: (entity: Entity) => void
}

/** -1 runs the leader out to the left, 1 to the right. */
type LeaderDirection = -1 | 1

/**
 * Which way each tiny entity's leader runs, toward open space.
 *
 * A geometric rule cannot infer this. The obvious one — "west of the viewBox
 * midpoint points left" — is wrong here because fitExtent fits the full
 * claimed extent including the Andaman & Nicobar Islands (centroid x 663), so
 * the whole peninsula sits in the left half: Tamil Nadu's centroid is at 301
 * against a midpoint of 410. Every tiny entity would read as "western",
 * sending Puducherry's label inland instead of out over the Bay of Bengal.
 *
 * Five entities stated explicitly beat a heuristic that is wrong for some of
 * them. Anything absent falls back to the midpoint rule.
 */
const LEADER_DIRECTION: Partial<Record<EntityCode, LeaderDirection>> = {
  LD: -1, // Lakshadweep — Arabian Sea, west
  DH: -1, // Daman & Diu — Arabian Sea, west
  PY: 1, //  Puducherry — Bay of Bengal, east
  DL: -1, // landlocked; left clears the UP and HP labels
  CH: -1, // landlocked; left runs out over Punjab
}

type CalloutProps = {
  shape: MapShape
  scale: number
  showLabel: boolean
}

/**
 * A tiny entity is a few pixels across at full extent, so nothing about it
 * reads at a glance. Ring it, and lead a label out to open space.
 */
function TinyCallout({ shape, scale, showLabel }: CalloutProps) {
  const [cx, cy] = shape.centroid
  const dirX: LeaderDirection =
    LEADER_DIRECTION[shape.entity.code] ?? (cx < MAP_WIDTH / 2 ? -1 : 1)

  return (
    <g className="tiny-callout" aria-hidden="true">
      {/* The radius divides by scale so the ring tightens onto the region as
          the player zooms in, while non-scaling-stroke and a divided
          font-size keep strokes and text a constant size on screen. */}
      <circle
        className="tiny-marker"
        cx={cx}
        cy={cy}
        r={26 / scale}
        vectorEffect="non-scaling-stroke"
      />
      {showLabel && (
        <>
          <line
            className="tiny-leader"
            x1={cx + (18 / scale) * dirX}
            y1={cy - 18 / scale}
            x2={cx + (46 / scale) * dirX}
            y2={cy - 46 / scale}
            vectorEffect="non-scaling-stroke"
          />
          <text
            className="tiny-callout-label"
            x={cx + (50 / scale) * dirX}
            y={cy - 48 / scale}
            textAnchor={dirX === -1 ? 'end' : 'start'}
            style={{ fontSize: `${13 / scale}px` }}
          >
            {shape.entity.code}
          </text>
        </>
      )}
    </g>
  )
}

const EMPTY: ReadonlySet<EntityCode> = new Set()

export default function IndiaMap({
  highlightedCode,
  selectedCode,
  answeredCodes = EMPTY,
  showLabels = false,
  markAllTiny = false,
  onSelect,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const { transform, scale, zoomIn, zoomOut, reset } = useZoom(svgRef)

  // `highlightedCode` is the game asking a question; `selectedCode` is the
  // Field Guide showing a selection. No caller passes both.
  const calloutShapes = markAllTiny
    ? MAP_SHAPES.filter((shape) => shape.tiny)
    : MAP_SHAPES.filter(
        (shape) => shape.tiny && shape.entity.code === (highlightedCode ?? selectedCode),
      )

  // The code label would hand the player the answer while the game is asking,
  // so labels appear only when nothing is being asked.
  const showCalloutLabels = highlightedCode === undefined

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

          {calloutShapes.map((shape) => (
            <TinyCallout
              key={shape.entity.code}
              shape={shape}
              scale={scale}
              showLabel={showCalloutLabels}
            />
          ))}

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
