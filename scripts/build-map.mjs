// Converts Survey of India state boundaries to a small TopoJSON for the app.
// Run with: npm run build:map
//
// Source: https://github.com/yashveeeeeeer/india-geodata (CC BY 4.0),
// originally Survey of India. The output is committed, so this script is for
// reproducibility only — it does not run at build or install time.
//
// The source has 40 features: our 36, plus 4 inter-state disputed slivers that
// carry State_LGD === 0. Joining on the numeric LGD code rather than the name
// sidesteps the macrons (ARUNACHAL PRADESH) and the source typo (CHHAtTISGARH).
import { execFileSync } from 'node:child_process'
import { chmodSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ENTITY_BY_LGD } from '../src/data/states.ts'

const SOURCE =
  'https://github.com/yashveeeeeeer/india-geodata/releases/download/admin/states/SOI_States.geojsonl.7z'
const OUT = fileURLToPath(new URL('../src/data/india-states.topo.json', import.meta.url))
const SIMPLIFY_PERCENT = process.env.SIMPLIFY ?? '2%'

const work = mkdtempSync(join(tmpdir(), 'india-map-'))
try {
  console.log('downloading Survey of India boundaries...')
  execFileSync('curl', ['-sL', '--max-time', '600', '-o', join(work, 'src.7z'), SOURCE])

  console.log('extracting...')
  const seven = join(process.cwd(), 'node_modules/7zip-bin/linux/x64/7za')
  chmodSync(seven, 0o755) // npm does not always preserve the executable bit
  execFileSync(seven, ['x', '-y', `-o${work}`, join(work, 'src.7z')], { stdio: 'ignore' })

  const lines = readFileSync(join(work, 'SOI_States.geojsonl'), 'utf8').trim().split('\n')
  console.log(`read ${lines.length} features`)

  const features = []
  for (const line of lines) {
    const raw = JSON.parse(line)
    const lgdCode = Number(raw.properties.State_LGD)
    if (lgdCode === 0) continue // the 4 inter-state disputed slivers
    const entity = ENTITY_BY_LGD.get(lgdCode)
    if (!entity) {
      throw new Error(
        `LGD ${lgdCode} (${raw.properties.STATE_C}) is in the source but not in states.ts`,
      )
    }
    features.push({
      type: 'Feature',
      properties: { lgdCode, name: entity.name },
      geometry: raw.geometry,
    })
  }

  if (features.length !== ENTITY_BY_LGD.size) {
    throw new Error(`expected ${ENTITY_BY_LGD.size} features, kept ${features.length}`)
  }

  const geojson = join(work, 'states.geojson')
  writeFileSync(geojson, JSON.stringify({ type: 'FeatureCollection', features }))

  console.log(`simplifying to ${SIMPLIFY_PERCENT} and converting to TopoJSON...`)
  execFileSync(
    'npx',
    [
      'mapshaper', geojson,
      '-simplify', SIMPLIFY_PERCENT, 'keep-shapes',
      '-clean',
      '-o', 'format=topojson', 'quantization=1e5', OUT,
    ],
    { stdio: 'inherit' },
  )

  const bytes = readFileSync(OUT).length
  console.log(`wrote ${(bytes / 1024).toFixed(0)}KB to ${OUT}`)
  if (bytes > 400_000) {
    console.warn('WARNING: over 400KB — lower SIMPLIFY_PERCENT and re-run')
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
