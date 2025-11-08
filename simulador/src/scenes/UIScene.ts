import Phaser from 'phaser'
import { EventBus } from '../eventBus'

type ClimateKey = 'caliente' | 'templado' | 'frio'

// kg/m² por clima
const KG_PER_M2: Record<ClimateKey, number> = {
  caliente: 26,
  templado: 30,
  frio: 33
}

const TARGET_WEIGHT_KG = 2.3

export class UIScene extends Phaser.Scene {
  constructor() { super('UI') }

  create() {
    const climateSel = document.getElementById('climate') as HTMLSelectElement

    const barnW = document.getElementById('barnW') as HTMLInputElement
    const barnH = document.getElementById('barnH') as HTMLInputElement
    const barnWVal = document.getElementById('barnWVal')!
    const barnHVal = document.getElementById('barnHVal')!

    const chickCount = document.getElementById('chickCount') as HTMLInputElement
    const chickCountVal = document.getElementById('chickCountVal')!

    const limitsHint = document.getElementById('limitsHint')!

    const syncLabel = () => {
      barnWVal.textContent = barnW.value
      barnHVal.textContent = barnH.value
      chickCountVal.textContent = chickCount.value
    }

    const computeLimits = () => {
      const w = Number(barnW.value)
      const h = Number(barnH.value)
      const area = Math.max(1, Math.min(25, w * h)) // área efectiva 1–3 m²

      const climate = (climateSel.value as ClimateKey) || 'templado'
      const birdsPerM2 = KG_PER_M2[climate] / TARGET_WEIGHT_KG
      const recommended = Math.floor(birdsPerM2 * area)
      const hardMax = Math.max(1, recommended * 2)

      // Ajusta el rango del slider de cantidad
      chickCount.max = String(hardMax)
      if (Number(chickCount.value) > hardMax) chickCount.value = String(hardMax)

      // UI hint
      limitsHint.textContent =
        `Área efectiva: ${area.toFixed(2)} m² — Recomendado: ${recommended} aves | Máximo: ${hardMax} aves`

      return { climate, area, recommended, hardMax }
    }

    const emit = () => {
      const limits = computeLimits()
      EventBus.emit('ui:update', {
        widthMeters: Number(barnW.value),
        heightMeters: Number(barnH.value),
        chicks: Number(chickCount.value),
        initialAge: 7, // valor inicial por defecto (la edad corre en SimScene)
        climate: limits.climate,
        areaEff: limits.area,            // para overlay/cálculos si lo quieres
        recommended: limits.recommended,
        hardMax: limits.hardMax
      })
      syncLabel()
    }

    ;[climateSel, barnW, barnH, chickCount].forEach(el => {
      el.addEventListener('input', emit)
    })

    // inicial
    emit()

    // etiqueta
    this.add.text(this.scale.width - 12, 10, 'Simulador Allpa (beta)', {
      fontSize: '14px', color: '#111', backgroundColor: 'rgba(255,255,255,0.85)'
    }).setOrigin(1, 0).setPadding(6, 2, 6, 2).setDepth(10)
  }
}
