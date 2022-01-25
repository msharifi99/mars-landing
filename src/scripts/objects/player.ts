import { GameObjects, Physics, Scene, Types } from 'phaser'
import FuelGauge from './fuelGauge'
import Platform from './platform'

const { Ellipse } = GameObjects

class Player extends Ellipse {
  body: Physics.Arcade.Body
  cursors: Types.Input.Keyboard.CursorKeys
  scene: Scene
  fuel: number
  landedPlatform: Platform | undefined
  initializerKeyCode: number | undefined
  constructor(scene: Scene, x, y) {
    const width = 40
    const height = 66
    super(scene, x, y, width, height, 0x777777)

    this.scene = scene
    this.cursors = scene.input.keyboard.createCursorKeys()
    this.fuel = 100
  }

  addedToScene() {
    this.body.setDamping(true)
  }

  preUpdate(timestamp, timeFrame) {
    this.body.setDrag(0.9, 1)

    const isBodyOnFloor = this.body.onFloor()

    if (isBodyOnFloor) {
      this.body.setVelocity(0)
    }

    const distanceFromPlatformCenter = Math.abs(this.x - Number(this.landedPlatform?.x))
    if (isBodyOnFloor && this.landedPlatform && distanceFromPlatformCenter > 0.05) {
      const x = (this.landedPlatform.x - this.x) / (timeFrame / 2)
      this.setPosition(this.x + x, this.y)
      this.body.updateFromGameObject()
      return
    }

    const resultAcc = new Phaser.Math.Vector2(0, 0)
    const initialAcc = new Phaser.Math.Vector2(0, 0)

    const hasFuel = this.fuel > Phaser.Math.EPSILON

    if (!hasFuel) {
      this.body.setAcceleration(0, 0)
      return
    }

    const isAnyKeyDown = this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown

    if (isBodyOnFloor && isAnyKeyDown) {
      initialAcc.set(7000, -25000)

      const initializer = this.scene.input.keyboard.keys.filter(v => Boolean(v) && v.isDown)[0]
      this.initializerKeyCode = initializer.keyCode
      initializer.once(Phaser.Input.Keyboard.Events.UP, () => {
        this.initializerKeyCode = undefined
      })
    }

    if (this.cursors.down.isDown && this.initializerKeyCode !== this.cursors.down.keyCode) {
      const upwardAcc = new Phaser.Math.Vector2(0, -800)
      resultAcc.add(upwardAcc)
    }
    if (this.cursors.left.isDown && this.initializerKeyCode !== this.cursors.left.keyCode) {
      const rightAcc = new Phaser.Math.Vector2(250, 0)
      resultAcc.add(rightAcc)
    }

    if (this.cursors.right.isDown && this.initializerKeyCode !== this.cursors.right.keyCode) {
      const leftAcc = new Phaser.Math.Vector2(-250, 0)
      resultAcc.add(leftAcc)
    }

    if (isAnyKeyDown) {
      this.updateFuel(resultAcc)
    }

    this.body.setAcceleration(resultAcc.x + initialAcc.x, resultAcc.y + initialAcc.y)
  }

  updateFuel(acceleration: Phaser.Math.Vector2) {
    const reducedFuel = acceleration.length() / 1000
    this.fuel = Phaser.Math.Clamp(this.fuel - reducedFuel, 0, this.fuel)
    FuelGauge.getInstance(this.scene).progress.set(this.fuel / 100)
  }

  onCollide(collider: Types.Physics.Arcade.GameObjectWithBody) {
    if (!(collider instanceof Platform)) return
    this.landedPlatform = collider
    if (this.fuel !== 100) {
      this.fuel = 100
      FuelGauge.getInstance(this.scene).progress.animate(1, {
        duration: 300,
        easing: 'easeOut'
      })
    }
  }
}

export default Player
