import type { WorldLandmarkId } from '../landmarks'
import type { GateOneLandmarkId } from './placements'
import type { WorldScenePalette } from './scenePalette'

export type BlockoutLandmarkId = Exclude<WorldLandmarkId, GateOneLandmarkId>
export type LandmarkVisualState = 'resting' | 'attuned' | 'harmonized'

interface BlockoutLandmarkModelProps {
  id: BlockoutLandmarkId
  palette: WorldScenePalette
  quality: 'low' | 'medium' | 'high'
  state: LandmarkVisualState
  shadows?: boolean
}

const SIX = [0, 1, 2, 3, 4, 5] as const
const EIGHT = [0, 1, 2, 3, 4, 5, 6, 7] as const

function StateAura({
  palette,
  quality,
  state,
}: Pick<BlockoutLandmarkModelProps, 'palette' | 'quality' | 'state'>) {
  const color =
    state === 'harmonized' ? palette.gold : state === 'attuned' ? palette.cyan : palette.violet
  const intensity = state === 'harmonized' ? 1.15 : state === 'attuned' ? 0.55 : 0.12

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <torusGeometry args={[3.15, state === 'resting' ? 0.035 : 0.075, 6, 36]} />
        <meshBasicMaterial color={color} transparent opacity={0.28 + intensity * 0.35} />
      </mesh>
      {quality === 'high' && state === 'harmonized' ? (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.13, 0]}>
          <torusGeometry args={[3.75, 0.025, 6, 48]} />
          <meshBasicMaterial color={palette.cyan} transparent opacity={0.45} />
        </mesh>
      ) : null}
      <pointLight color={color} intensity={intensity} distance={8} position={[0, 4, 0]} />
    </group>
  )
}

function LandmarkSilhouette({
  id,
  palette,
  quality,
  shadows = true,
}: Omit<BlockoutLandmarkModelProps, 'state'>) {
  const detail = quality !== 'low'
  const segments = (low: number, high: number) =>
    quality === 'low' ? low : quality === 'medium' ? Math.round((low + high) / 2) : high

  switch (id) {
    case 'council':
      return (
        <group>
          <mesh castShadow={shadows} receiveShadow position={[0, 0.3, 0]}>
            <cylinderGeometry args={[3.5, 3.9, 0.6, segments(16, 32)]} />
            <meshStandardMaterial color={palette.warmSand} roughness={0.84} />
          </mesh>
          {EIGHT.map((index) => {
            const angle = (index / EIGHT.length) * Math.PI * 2
            return (
              <mesh
                key={index}
                castShadow={shadows}
                position={[Math.cos(angle) * 2.55, 2.25, Math.sin(angle) * 2.55]}
              >
                <cylinderGeometry args={[0.22, 0.3, 3.8, segments(6, 10)]} />
                <meshStandardMaterial color={palette.light} roughness={0.72} />
              </mesh>
            )
          })}
          <mesh castShadow={shadows} position={[0, 4.15, 0]}>
            <cylinderGeometry args={[3.15, 2.8, 0.5, segments(16, 32)]} />
            <meshStandardMaterial
              color={palette.gold}
              emissive={palette.gold}
              emissiveIntensity={0.08}
              roughness={0.55}
            />
          </mesh>
          <mesh position={[0, 4.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.25, 0.08, 8, segments(24, 48)]} />
            <meshStandardMaterial color={palette.cyan} emissive={palette.cyan} />
          </mesh>
        </group>
      )

    case 'noosphere':
      return (
        <group>
          <mesh castShadow={shadows} receiveShadow position={[0, 0.35, 0]}>
            <cylinderGeometry args={[2.9, 3.4, 0.7, 8]} />
            <meshStandardMaterial color={palette.cosmic} roughness={0.75} />
          </mesh>
          <mesh castShadow={shadows} position={[0, 3.4, 0]} scale={[1.05, 2.7, 1.05]}>
            <octahedronGeometry args={[1.25, 0]} />
            <meshStandardMaterial
              color={palette.violet}
              emissive={palette.cyan}
              emissiveIntensity={0.28}
              metalness={0.38}
              roughness={0.24}
            />
          </mesh>
          {[1.35, 3.25, 5.15].map((height, index) => (
            <mesh key={height} position={[0, height, 0]} rotation={[Math.PI / 2, index * 0.35, 0]}>
              <torusGeometry args={[1.55 - index * 0.2, 0.055, 6, segments(20, 42)]} />
              <meshBasicMaterial color={index === 1 ? palette.gold : palette.cyan} />
            </mesh>
          ))}
          {detail
            ? SIX.map((index) => {
                const angle = (index / SIX.length) * Math.PI * 2
                return (
                  <mesh
                    key={index}
                    castShadow={shadows}
                    position={[Math.cos(angle) * 2.25, 1.65, Math.sin(angle) * 2.25]}
                  >
                    <boxGeometry args={[0.18, 2.4, 0.18]} />
                    <meshStandardMaterial
                      color={palette.cyan}
                      emissive={palette.cyan}
                      emissiveIntensity={0.18}
                    />
                  </mesh>
                )
              })
            : null}
        </group>
      )

    case 'ashram':
      return (
        <group>
          {[
            [3.8, 0.45, 0.45],
            [3.05, 1.05, 0.7],
            [2.25, 1.8, 0.82],
          ].map(([radius, y, height]) => (
            <mesh key={radius} castShadow={shadows} receiveShadow position={[0, y, 0]}>
              <cylinderGeometry args={[radius * 0.84, radius, height, 8]} />
              <meshStandardMaterial color={palette.warmSand} roughness={0.94} />
            </mesh>
          ))}
          <mesh castShadow={shadows} position={[0, 3.15, 0]}>
            <coneGeometry args={[1.65, 2.6, 8]} />
            <meshStandardMaterial color={palette.solarpunk} roughness={0.86} />
          </mesh>
          <mesh position={[0, 4.75, 0]}>
            <sphereGeometry args={[0.48, segments(10, 20), segments(8, 12)]} />
            <meshStandardMaterial
              color={palette.gold}
              emissive={palette.gold}
              emissiveIntensity={0.35}
            />
          </mesh>
          {detail
            ? SIX.map((index) => {
                const angle = (index / SIX.length) * Math.PI * 2
                return (
                  <mesh
                    key={index}
                    castShadow={shadows}
                    position={[Math.cos(angle) * 2.8, 1.55, Math.sin(angle) * 2.8]}
                  >
                    <coneGeometry args={[0.42, 1.6, 6]} />
                    <meshStandardMaterial color={palette.green} roughness={0.9} />
                  </mesh>
                )
              })
            : null}
        </group>
      )

    case 'energy':
      return (
        <group>
          <mesh receiveShadow position={[0, 0.25, 0]}>
            <cylinderGeometry args={[3.5, 3.8, 0.5, segments(14, 28)]} />
            <meshStandardMaterial color={palette.green} roughness={0.9} />
          </mesh>
          <mesh castShadow={shadows} position={[0, 2.6, 0]}>
            <cylinderGeometry args={[0.15, 0.3, 4.8, 8]} />
            <meshStandardMaterial color={palette.light} metalness={0.45} roughness={0.4} />
          </mesh>
          <group position={[0, 4.7, 0.15]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.65, 0.09, 8, 24]} />
              <meshStandardMaterial color={palette.cyan} emissive={palette.cyan} />
            </mesh>
            {SIX.slice(0, 3).map((index) => (
              <mesh
                key={index}
                castShadow={shadows}
                rotation={[0, 0, (index / 3) * Math.PI * 2]}
                position={[
                  Math.cos((index / 3) * Math.PI * 2) * 1.05,
                  Math.sin((index / 3) * Math.PI * 2) * 1.05,
                  0,
                ]}
              >
                <boxGeometry args={[1.5, 0.18, 0.08]} />
                <meshStandardMaterial color={palette.light} roughness={0.4} />
              </mesh>
            ))}
          </group>
          {(detail ? [-2.1, 2.1] : [-2.1]).map((x) => (
            <mesh key={x} castShadow={shadows} position={[x, 0.75, 1.1]} rotation={[0.18, 0, 0]}>
              <boxGeometry args={[2.2, 0.12, 1.35]} />
              <meshStandardMaterial
                color={palette.cosmic}
                emissive={palette.cyan}
                emissiveIntensity={0.12}
                metalness={0.35}
              />
            </mesh>
          ))}
        </group>
      )

    case 'creation':
      return (
        <group>
          {[3.6, 2.9, 2.2].map((radius, index) => (
            <mesh
              key={radius}
              castShadow={shadows}
              position={[0, 0.35 + index * 0.42, 0]}
              rotation={[Math.PI / 2, 0, 0.55]}
            >
              <torusGeometry
                args={[radius, 0.28, segments(6, 10), segments(22, 42), Math.PI * 1.55]}
              />
              <meshStandardMaterial color={palette.warmSand} roughness={0.88} />
            </mesh>
          ))}
          <mesh castShadow={shadows} position={[0, 1.45, 0]}>
            <cylinderGeometry args={[1.25, 1.55, 0.65, 8]} />
            <meshStandardMaterial color={palette.cosmic} metalness={0.35} roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.2, 0]}>
            <icosahedronGeometry args={[0.55, detail ? 1 : 0]} />
            <meshStandardMaterial
              color={palette.gold}
              emissive={palette.gold}
              emissiveIntensity={0.42}
            />
          </mesh>
          {detail ? (
            <mesh castShadow={shadows} position={[0, 3.3, -1.6]}>
              <boxGeometry args={[3.6, 0.24, 0.3]} />
              <meshStandardMaterial color={palette.violet} roughness={0.58} />
            </mesh>
          ) : null}
        </group>
      )

    case 'exchange':
      return (
        <group>
          <mesh castShadow={shadows} receiveShadow position={[0, 0.28, 0]}>
            <boxGeometry args={[6.8, 0.55, 3.2]} />
            <meshStandardMaterial color={palette.warmSand} roughness={0.84} />
          </mesh>
          {[-2.25, 2.25].map((x) => (
            <mesh key={x} castShadow={shadows} position={[x, 2.25, 0]}>
              <cylinderGeometry args={[0.28, 0.38, 4, 8]} />
              <meshStandardMaterial color={palette.light} roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[0, 3.9, 0]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[2.25, 0.24, 8, segments(20, 36), Math.PI]} />
            <meshStandardMaterial color={palette.gold} metalness={0.28} roughness={0.45} />
          </mesh>
          <mesh castShadow={shadows} position={[0.65, 2.5, 0.2]} scale={[0.18, 1.45, 1]}>
            <coneGeometry args={[1.4, 3.2, 3]} />
            <meshStandardMaterial
              color={palette.cyan}
              emissive={palette.cyan}
              emissiveIntensity={0.1}
            />
          </mesh>
          {detail ? (
            <mesh position={[0, 0.62, 2]}>
              <boxGeometry args={[8.2, 0.12, 0.8]} />
              <meshStandardMaterial color={palette.solarpunk} roughness={0.86} />
            </mesh>
          ) : null}
        </group>
      )

    case 'creation-temple':
      return (
        <group>
          <mesh receiveShadow position={[0, 0.18, 0]}>
            <cylinderGeometry args={[3.8, 4.1, 0.36, segments(16, 32)]} />
            <meshStandardMaterial
              color={palette.cyan}
              emissive={palette.cyan}
              emissiveIntensity={0.12}
              transparent
              opacity={0.72}
            />
          </mesh>
          <mesh castShadow={shadows} position={[0, 0.55, 0]}>
            <boxGeometry args={[5.8, 0.55, 4.1]} />
            <meshStandardMaterial color={palette.warmSand} roughness={0.86} />
          </mesh>
          {[-2, 2].flatMap((x) =>
            [-1.25, 1.25].map((z) => (
              <mesh key={`${x}-${z}`} castShadow={shadows} position={[x, 2.35, z]}>
                <cylinderGeometry args={[0.22, 0.32, 3.4, 8]} />
                <meshStandardMaterial color={palette.light} roughness={0.68} />
              </mesh>
            ))
          )}
          <mesh castShadow={shadows} position={[0, 4.05, 0]}>
            <boxGeometry args={[5.8, 0.42, 3.5]} />
            <meshStandardMaterial color={palette.gold} roughness={0.52} />
          </mesh>
          {detail ? (
            <mesh position={[0, 2.05, 1.85]}>
              <torusGeometry args={[0.95, 0.11, 8, 32]} />
              <meshStandardMaterial color={palette.violet} emissive={palette.violet} />
            </mesh>
          ) : null}
        </group>
      )

    case 'solar-ark':
      return (
        <group>
          <mesh castShadow={shadows} position={[0, 0.8, 0]} scale={[3.6, 0.72, 1.25]}>
            <sphereGeometry
              args={[1, segments(16, 28), segments(8, 14), 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color={palette.solarpunk} metalness={0.35} roughness={0.48} />
          </mesh>
          <mesh castShadow={shadows} position={[0, 3.1, 0]}>
            <cylinderGeometry args={[0.12, 0.2, 5, 8]} />
            <meshStandardMaterial color={palette.warmSand} roughness={0.78} />
          </mesh>
          <mesh castShadow={shadows} position={[1.25, 3.2, 0]} scale={[0.16, 1.6, 1.1]}>
            <coneGeometry args={[1.45, 3.8, 3]} />
            <meshStandardMaterial
              color={palette.gold}
              emissive={palette.gold}
              emissiveIntensity={0.12}
              roughness={0.5}
            />
          </mesh>
          {detail ? (
            <mesh position={[-1.2, 1.05, 0]} rotation={[0, 0, -0.12]}>
              <boxGeometry args={[2.7, 0.08, 1.4]} />
              <meshStandardMaterial color={palette.cyan} metalness={0.45} roughness={0.32} />
            </mesh>
          ) : null}
        </group>
      )

    case 'heart-caravan':
      return (
        <group>
          <mesh castShadow={shadows} position={[0, 1.65, 0]}>
            <boxGeometry args={[5.5, 2.5, 2.8]} />
            <meshStandardMaterial color={palette.green} roughness={0.76} />
          </mesh>
          <mesh castShadow={shadows} position={[0, 2.9, 0]} scale={[2.75, 0.72, 1.4]}>
            <sphereGeometry args={[1, segments(14, 24), segments(8, 12)]} />
            <meshStandardMaterial color={palette.solarpunk} roughness={0.84} />
          </mesh>
          {[-1.8, 1.8].map((x) => (
            <mesh key={x} castShadow={shadows} position={[x, 0.55, 1.48]}>
              <torusGeometry args={[0.72, 0.18, 8, segments(14, 24)]} />
              <meshStandardMaterial color={palette.cosmic} roughness={0.92} />
            </mesh>
          ))}
          <mesh position={[0.45, 1.7, 1.44]}>
            <circleGeometry args={[0.55, segments(12, 24)]} />
            <meshBasicMaterial color={palette.gold} />
          </mesh>
          {detail ? (
            <mesh position={[-1.15, 1.7, 1.45]}>
              <boxGeometry args={[1.15, 1.1, 0.08]} />
              <meshStandardMaterial color={palette.cyan} emissive={palette.cyan} />
            </mesh>
          ) : null}
        </group>
      )

    case 'voice-beacon':
      return (
        <group>
          <mesh castShadow={shadows} receiveShadow position={[0, 0.35, 0]}>
            <cylinderGeometry args={[2.8, 3.3, 0.7, 12]} />
            <meshStandardMaterial color={palette.cosmic} roughness={0.76} />
          </mesh>
          <mesh castShadow={shadows} position={[0, 3.2, 0]}>
            <cylinderGeometry args={[0.42, 0.8, 5.7, 10]} />
            <meshStandardMaterial color={palette.light} metalness={0.28} roughness={0.48} />
          </mesh>
          {[4.5, 5.35, 6.2].map((height, index) => (
            <mesh key={height} position={[0, height, 0]} rotation={[0, index * 0.45, 0]}>
              <torusGeometry args={[0.95 + index * 0.45, 0.08, 8, segments(20, 40)]} />
              <meshStandardMaterial
                color={index === 1 ? palette.gold : palette.cyan}
                emissive={index === 1 ? palette.gold : palette.cyan}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
          {detail ? (
            <mesh position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.6, 0.05, 6, 36]} />
              <meshBasicMaterial color={palette.violet} />
            </mesh>
          ) : null}
        </group>
      )

    case 'observatory':
      return (
        <group>
          <mesh castShadow={shadows} receiveShadow position={[0, 0.45, 0]}>
            <cylinderGeometry args={[3.4, 3.75, 0.9, segments(14, 28)]} />
            <meshStandardMaterial color={palette.warmSand} roughness={0.82} />
          </mesh>
          <mesh castShadow={shadows} position={[0, 1, 0]}>
            <sphereGeometry
              args={[2.55, segments(16, 28), segments(8, 14), 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial
              color={palette.violet}
              emissive={palette.cyan}
              emissiveIntensity={0.08}
              metalness={0.22}
              roughness={0.38}
            />
          </mesh>
          <mesh castShadow={shadows} position={[1.2, 3.25, 0]} rotation={[0, 0, -0.75]}>
            <cylinderGeometry args={[0.48, 0.72, 3.8, 10]} />
            <meshStandardMaterial color={palette.light} metalness={0.4} roughness={0.34} />
          </mesh>
          <mesh position={[2.55, 4.55, 0]} rotation={[0, 0, -0.75]}>
            <torusGeometry args={[0.74, 0.13, 8, segments(18, 32)]} />
            <meshStandardMaterial color={palette.gold} emissive={palette.gold} />
          </mesh>
          {detail ? (
            <mesh position={[0, 2.1, 0]}>
              <torusGeometry args={[2.56, 0.04, 6, 42]} />
              <meshBasicMaterial color={palette.cyan} />
            </mesh>
          ) : null}
        </group>
      )

    case 'cosmic-control':
      return (
        <group position={[0, 2.2, 0]}>
          <mesh castShadow={shadows} scale={[3.9, 0.72, 2.7]}>
            <sphereGeometry args={[1, segments(16, 30), segments(8, 14)]} />
            <meshStandardMaterial
              color={palette.cosmic}
              emissive={palette.violet}
              emissiveIntensity={0.2}
              metalness={0.55}
              roughness={0.27}
            />
          </mesh>
          <mesh position={[0, 0.62, 0]} scale={[1.65, 0.78, 1.35]}>
            <sphereGeometry args={[1, segments(14, 24), segments(8, 12)]} />
            <meshStandardMaterial
              color={palette.cyan}
              emissive={palette.cyan}
              emissiveIntensity={0.34}
              transparent
              opacity={0.72}
            />
          </mesh>
          {[0, Math.PI / 3].map((rotation) => (
            <mesh key={rotation} rotation={[Math.PI / 2, rotation, 0]}>
              <torusGeometry args={[3.45, 0.07, 8, segments(28, 54)]} />
              <meshBasicMaterial color={rotation === 0 ? palette.gold : palette.cyan} />
            </mesh>
          ))}
          {detail ? (
            <mesh position={[0, -1.6, 0]}>
              <coneGeometry args={[1.15, 2.6, 16]} />
              <meshBasicMaterial color={palette.violet} transparent opacity={0.35} />
            </mesh>
          ) : null}
        </group>
      )
  }
}

export function BlockoutLandmarkModel(props: BlockoutLandmarkModelProps) {
  return (
    <group>
      <LandmarkSilhouette {...props} />
      <StateAura palette={props.palette} quality={props.quality} state={props.state} />
    </group>
  )
}
