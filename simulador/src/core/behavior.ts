import Phaser from 'phaser'
import { Chick } from './Chick'

// Mantengo el tipo por compatibilidad aunque no lo usemos ahora
export type Targets = { feeders: Phaser.Geom.Point[], drinkers: Phaser.Geom.Point[] }

/**
 * Empuja suavemente al pollito con:
 * - wander aleatorio
 * - separación básica respecto al resto del grupo
 *
 * IMPORTANTE: Este steer asume Arcade Physics (cuerpo ya creado en Chick).
 * Los límites los resolverán las paredes físicas; aquí no se hace clamp de bordes.
 */
export function steer(
  chick: Chick,
  group: Chick[],
  _bounds: Phaser.Geom.Rectangle, // no usado (paredes físicas ya hacen el trabajo)
  _targets: Targets,              // no usado (comederos/bebederos ocultos)
  dt: number
) {
  const body = chick.body as Phaser.Physics.Arcade.Body
  if (!body) return

  // velocidad preferida por edad
  const sp = chick.getPreferredSpeed()

  // Wander ligero (pequeñas variaciones por frame)
  const jx = Phaser.Math.FloatBetween(-20, 20)
  const jy = Phaser.Math.FloatBetween(-20, 20)

  // Separación básica (evita amontonarse)
  let sepX = 0
  let sepY = 0
  for (const other of group) {
    if (other === chick) continue
    const dx = chick.x - other.x
    const dy = chick.y - other.y
    const d2 = dx * dx + dy * dy
    const minR = 24 // radio de confort; ajústalo si quieres más/menos separación
    if (d2 > 0 && d2 < minR * minR) {
      // empuje inversamente proporcional a la distancia
      const inv = 1 / Math.max(1, Math.sqrt(d2))
      sepX += dx * inv
      sepY += dy * inv
    }
  }
  // escala pequeña para que no sea brusco
  sepX *= 10
  sepY *= 10

  // Velocidad actual saneada
  const vx = Number.isFinite(body.velocity.x) ? body.velocity.x : 0
  const vy = Number.isFinite(body.velocity.y) ? body.velocity.y : 0

  // Nueva velocidad (clamp por sp)
  const nextVx = Phaser.Math.Clamp(vx + jx + sepX * dt, -sp, sp)
  const nextVy = Phaser.Math.Clamp(vy + jy + sepY * dt, -sp, sp)

  body.setVelocity(nextVx, nextVy)
}
