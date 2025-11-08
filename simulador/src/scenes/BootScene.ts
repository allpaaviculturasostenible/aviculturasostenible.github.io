import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot') }

  preload() {
    // Generamos un “sprite” de pollito simple por código (círculo amarillo con pico)
    const g = this.add.graphics()
    g.fillStyle(0xffe680, 1)
    g.fillCircle(16, 16, 14)
    g.fillStyle(0xff7a00, 1)
    g.fillTriangle(26, 16, 36, 12, 36, 20) // pico
    g.generateTexture('chick', 48, 32)
    g.clear()

    // assets simples para comedero/bebedero
    const f = this.add.graphics()
    f.fillStyle(0xcc3333, 1).fillRoundedRect(0, 0, 60, 20, 6)
    f.generateTexture('feeder', 60, 20)
    f.clear()
    const w = this.add.graphics()
    w.fillStyle(0x3b82f6, 1).fillRoundedRect(0, 0, 60, 20, 6)
    w.generateTexture('drinker', 60, 20)
    w.destroy()
  }

  create() {
    this.scene.start('Sim')
    this.scene.launch('UI')
    console.log('BootScene loaded, chick texture exists?', this.textures.exists('chick'))

  }
}
