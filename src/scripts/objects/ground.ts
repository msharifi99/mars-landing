import { GameObjects, Physics, Scene } from 'phaser'

class Ground extends GameObjects.Rectangle {
  body: Physics.Arcade.StaticBody

  constructor(scene: Scene, x: number, y: number, width: number) {
    const height = 100
    super(scene, x + width / 2, y - height / 2, width, height, 0xff0000)
  }
}

export default Ground
