import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

const MAX_BYTES = 1_500_000
const MAX_TRIANGLES = 40_000
const GLB_MAGIC = 0x46546c67
const JSON_CHUNK = 0x4e4f534a

function readGlb(path) {
  const file = readFileSync(path)

  if (file.readUInt32LE(0) !== GLB_MAGIC || file.readUInt32LE(4) !== 2) {
    throw new Error(`${path}: expected a glTF 2.0 binary`)
  }

  const jsonLength = file.readUInt32LE(12)
  if (file.readUInt32LE(16) !== JSON_CHUNK) {
    throw new Error(`${path}: missing JSON chunk`)
  }

  const json = JSON.parse(
    file
      .subarray(20, 20 + jsonLength)
      .toString('utf8')
      .trim()
  )
  const accessors = json.accessors ?? []
  const bufferViews = json.bufferViews ?? []
  const triangles = (json.meshes ?? []).reduce(
    (meshTotal, mesh) =>
      meshTotal +
      (mesh.primitives ?? []).reduce((primitiveTotal, primitive) => {
        const accessor = accessors[primitive.indices ?? primitive.attributes?.POSITION]
        if (!accessor) return primitiveTotal

        const mode = primitive.mode ?? 4
        const count = accessor.count ?? 0
        const primitiveTriangles =
          mode === 4 ? Math.floor(count / 3) : mode === 5 || mode === 6 ? Math.max(0, count - 2) : 0

        return primitiveTotal + primitiveTriangles
      }, 0),
    0
  )
  const imageBytes = (json.images ?? []).reduce(
    (total, image) => total + (bufferViews[image.bufferView]?.byteLength ?? 0),
    0
  )

  return {
    file: basename(path),
    bytes: file.byteLength,
    triangles,
    meshes: json.meshes?.length ?? 0,
    materials: json.materials?.length ?? 0,
    textures: json.textures?.length ?? 0,
    imageBytes,
    extensions: json.extensionsUsed ?? [],
  }
}

const paths = process.argv.slice(2)
if (paths.length === 0) {
  console.error('Usage: node scripts/validate-world-map-glb.mjs <asset.glb> [...]')
  process.exit(2)
}

let failed = false
for (const path of paths) {
  const report = readGlb(path)
  const valid = report.bytes <= MAX_BYTES && report.triangles <= MAX_TRIANGLES
  failed ||= !valid
  console.log(
    JSON.stringify({
      ...report,
      budget: valid ? 'pass' : 'fail',
      limits: { bytes: MAX_BYTES, triangles: MAX_TRIANGLES },
    })
  )
}

if (failed) process.exit(1)
