import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { UIScene } from './scenes/UIScene'
import { SimScene } from './scenes/SimScene'

const parentId = 'phaser-root'
const parentEl = document.getElementById(parentId)!
const width = parentEl.clientWidth
const height = parentEl.clientHeight

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: parentId,
  backgroundColor: '#cfe8ee',
  width,
  height,
  physics: { default: 'arcade', arcade: { gravity: { x:0, y: 0 }, debug: false } },
  scale: {
    mode: Phaser.Scale.RESIZE,   // se adapta al contenedor
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, UIScene, SimScene]
}

export const game = new Phaser.Game(config)

// Reajusta al cambiar tamaño del contenedor/ventana
const resize = () => {
  const w = parentEl.clientWidth
  const h = parentEl.clientHeight
  game.scale.resize(w, h)
}
window.addEventListener('resize', resize)
