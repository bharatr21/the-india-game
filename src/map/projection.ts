import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import topology from '../data/india-states.topo.json' with { type: 'json' }
import { ENTITY_BY_LGD, type Entity } from '../data/states.ts'

export const MAP_WIDTH = 820
export const MAP_HEIGHT = 860
const PADDING = 16

/**
 * Below this share of the largest entity's area (Rajasthan), an entity needs
 * help to be seen and clicked. Measured ratios put a natural gap here:
 * Goa 0.0093 and Andaman 0.0188 are visible; Delhi 0.0045, DH 0.0016,
 * Puducherry 0.0012, Chandigarh 0.0004 and Lakshadweep 0.00002 are not.
 */
const TINY_AREA_RATIO = 0.006

export type MapShape = {
  readonly entity: Entity
  readonly d: string
  readonly centroid: readonly [number, number]
  readonly area: number
  readonly tiny: boolean
}

type Props = { lgdCode: number }

const topo = topology as unknown as Topology<{ states: GeometryCollection<Props> }>
const objectKey = Object.keys(topo.objects)[0] as 'states'
const collection = feature(topo, topo.objects[objectKey]) as unknown as FeatureCollection<
  Geometry,
  Props
>

// Computed once at module scope: the projection never changes, so recomputing
// it per render would be pure waste.
const projection = geoMercator().fitExtent(
  [
    [PADDING, PADDING],
    [MAP_WIDTH - PADDING, MAP_HEIGHT - PADDING],
  ],
  collection,
)

const drawPath = geoPath(projection)

const rawShapes = collection.features.map((shape) => {
  const entity = ENTITY_BY_LGD.get(shape.properties.lgdCode)
  if (!entity) throw new Error(`map feature ${shape.properties.lgdCode} has no entity`)
  const d = drawPath(shape)
  if (!d) throw new Error(`could not draw ${entity.name}`)
  const [cx, cy] = drawPath.centroid(shape)
  return { entity, d, centroid: [cx, cy] as const, area: drawPath.area(shape) }
})

const largestArea = Math.max(...rawShapes.map((shape) => shape.area))

// Sorted largest-first: in SVG, paint order IS z-order, so without this a big
// state can render on top of a small one and make it unclickable.
export const MAP_SHAPES: readonly MapShape[] = rawShapes
  .map((shape) => ({ ...shape, tiny: shape.area / largestArea < TINY_AREA_RATIO }))
  .sort((a, b) => b.area - a.area)
