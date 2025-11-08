import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { UIScene } from './scenes/UIScene'
import { SimScene } from './scenes/SimScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#cfe8ee',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 640
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x:0, y: 0 }, debug: false }
  },
  scene: [BootScene, SimScene, UIScene]
}

new Phaser.Game(config)
