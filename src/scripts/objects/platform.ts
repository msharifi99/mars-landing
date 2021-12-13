import { GameObjects, Physics, Scene } from 'phaser'

class Platform extends GameObjects.Rectangle {
  body: Physics.Arcade.StaticBody
  constructor(scene: Scene, x: number, y: number, width: number) {
    const height = 15
    super(scene, x + width / 2, y - height / 2, width, height, 0x0000ff)
  }
}

export default Platform
