import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { select } from 'd3-selection'
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom'
import 'd3-transition' // registers .transition() on selections by side effect
import { MAX_SCALE, MIN_SCALE } from '../game.ts'
import { MAP_HEIGHT, MAP_WIDTH } from './projection.ts'

export type ZoomControls = {
  readonly transform: string
  readonly zoomIn: () => void
  readonly zoomOut: () => void
  readonly reset: () => void
}

export function useZoom(svgRef: RefObject<SVGSVGElement | null>): ZoomControls {
  const [transform, setTransform] = useState('translate(0,0) scale(1)')
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const behavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_SCALE, MAX_SCALE])
      // Keep the country on screen: never pan beyond the map's own extent.
      .translateExtent([
        [0, 0],
        [MAP_WIDTH, MAP_HEIGHT],
      ])
      .on('zoom', (event) => {
        const { x, y, k } = event.transform
        setTransform(`translate(${x},${y}) scale(${k})`)
      })

    behaviorRef.current = behavior
    select(svg).call(behavior)

    return () => {
      select(svg).on('.zoom', null)
      behaviorRef.current = null
    }
  }, [svgRef])

  const scaleBy = useCallback(
    (factor: number) => {
      const svg = svgRef.current
      const behavior = behaviorRef.current
      if (!svg || !behavior) return
      behavior.scaleBy(select(svg).transition().duration(200) as never, factor)
    },
    [svgRef],
  )

  const zoomIn = useCallback(() => scaleBy(1.6), [scaleBy])
  const zoomOut = useCallback(() => scaleBy(1 / 1.6), [scaleBy])

  const reset = useCallback(() => {
    const svg = svgRef.current
    const behavior = behaviorRef.current
    if (!svg || !behavior) return
    behavior.transform(select(svg).transition().duration(250) as never, zoomIdentity)
  }, [svgRef])

  return { transform, zoomIn, zoomOut, reset }
}
