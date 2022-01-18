import { Vector } from 'matter'
import { GameObjects, Physics, Scene, Types } from 'phaser'
import Ground from './ground'
import Platform from './platform'

const { Ellipse } = GameObjects

class Player extends Ellipse {
  body: Physics.Arcade.Body
  cursors: Types.Input.Keyboard.CursorKeys
  scene: Scene
  constructor(scene: Scene) {
    const width = 60
    const height = 100
    const x = scene.cameras.main.centerX - 300
    const y = scene.cameras.main.height - 400
    super(scene, x, y, width, height, 0x777777)

    this.scene = scene
    this.cursors = scene.input.keyboard.createCursorKeys()
  addedToScene() {
    this.body.setDamping(true)
  }

  preUpdate() {
    this.body.setDrag(0.9, 1)

    if (this.body.onFloor()) {
      this.body.setDragX(0.00001)
    }

    const resultAcc = new Phaser.Math.Vector2(0, 0)
    if (this.cursors.down.isDown) {
      const upwardAcc = new Phaser.Math.Vector2(0, -800)
      resultAcc.add(upwardAcc)
    }
    if (this.cursors.left.isDown) {
      const rightAcc = new Phaser.Math.Vector2(250, 0)
      resultAcc.add(rightAcc)
    }

    if (this.cursors.right.isDown) {
      const leftAcc = new Phaser.Math.Vector2(-250, 0)
      resultAcc.add(leftAcc)
    }

    this.body.setAcceleration(resultAcc.x, resultAcc.y)
  }

  onCollide(collider: Types.Physics.Arcade.GameObjectWithBody) {
    if (collider instanceof Platform) {
      const zeroInHorizontal = new Phaser.Math.Vector2(0, 1)
      this.body.velocity.multiply(zeroInHorizontal)
    }
  }
}

export default Player
