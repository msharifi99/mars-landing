import { GameObjects, Physics } from 'phaser'
import Ground from '../objects/ground'
import Platform from '../objects/platform'
import Player from '../objects/player'
export default class MainScene extends Phaser.Scene {
  player: Player
  grounds: Physics.Arcade.StaticGroup
  platforms: Physics.Arcade.StaticGroup
  lastPlatform: Platform | undefined
  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.player = this.addPlayer()
    this.grounds = this.addGrounds()
    this.platforms = this.addPlatforms()

    this.physics.add.collider(this.grounds, this.player, () => {
      this.registry.destroy() // destroy registry
      this.scene.restart() // restart current scene
    })
    this.physics.add.collider(this.platforms, this.player, collidedPlatform => this.player.onCollide(collidedPlatform))
  }

  update() {
    this.physics.world.setBounds(
      this.cameras.main.scrollX,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      true,
      false,
      false,
      true
    )

    this.panCamera()
    this.reuseGrounds()
    this.reusePlatforms()
  }

  addPlayer() {
    const player = new Player(this)
    this.addExistingObject(player)
    player.body.setCollideWorldBounds()

    return player
  }

  addGrounds() {
    const grounds = [
      new Ground(this, 0, this.cameras.main.height, this.cameras.main.width),
      new Ground(this, this.cameras.main.width, this.cameras.main.height, this.cameras.main.width),
      new Ground(this, this.cameras.main.width * 2, this.cameras.main.height, this.cameras.main.width)
    ]
    return this.addExistingGroupObject(grounds, true)
  }

  addExistingObject(obj: GameObjects.GameObject, isStatic: boolean = false) {
    // in order to have body property in game object
    // make sure to add the object to physics system before add it to scene
    this.physics.add.existing(obj, isStatic)
    this.add.existing(obj)
  }

  addExistingGroupObject(objects: GameObjects.GameObject[], isStatic: true): Physics.Arcade.StaticGroup
  addExistingGroupObject(objects: GameObjects.GameObject[], isStatic?: false): Physics.Arcade.Group
  addExistingGroupObject(objects: GameObjects.GameObject[], isStatic: any = false) {
    let group: Physics.Arcade.StaticGroup | Physics.Arcade.Group = undefined!
    if (isStatic) {
      group = this.physics.add.staticGroup(objects)
    } else {
      group = this.physics.add.group(objects)
    }
    objects.forEach(item => {
      this.add.existing(item)
    })
    return group
  }

  addPlatforms() {
    const groundHeight = (this.grounds.getChildren()[0] as Ground).height

    const platformObjects = [
      new Platform(this, 0, this.cameras.main.height - groundHeight, 80),
      new Platform(this, 250, this.cameras.main.height - groundHeight, 80),
      new Platform(this, 250 * 2, this.cameras.main.height - groundHeight, 80),
      new Platform(this, 250 * 3, this.cameras.main.height - groundHeight, 80),
      new Platform(this, 250 * 4, this.cameras.main.height - groundHeight, 80),
      new Platform(this, 250 * 5, this.cameras.main.height - groundHeight, 80),
      new Platform(this, 250 * 6, this.cameras.main.height - groundHeight, 80),
      new Platform(this, 250 * 7, this.cameras.main.height - groundHeight, 80)
    ]
    return this.addExistingGroupObject(platformObjects, true)
  }

  panCamera() {
    const playerX = this.player.x

    const playerXRelativeToCameraWidth = (playerX - this.cameras.main.scrollX) / this.cameras.main.width
    if (playerXRelativeToCameraWidth > 0.5) {
      this.cameras.main.pan(playerX, this.cameras.main.centerY, 0)
    }
  }

  reuseGrounds() {
    const cameraXBeginPosition = this.cameras.main.scrollX
    const groundObjects = this.grounds.getChildren() as Ground[]
    const groundToMove = groundObjects.find(ground => cameraXBeginPosition - ground.x > ground.width)

    if (groundToMove) {
      let x = groundToMove.x + groundToMove.width * 3
      groundToMove.setPosition(x, groundToMove.y)
      this.grounds.refresh()
    }
  }

  reusePlatforms() {
    const cameraXBeginPosition = this.cameras.main.scrollX
    const platformObjects = this.platforms.getChildren() as Platform[]
    const platformToMove = platformObjects.find(platform => cameraXBeginPosition - platform.x > platform.width)

    if (platformToMove) {
      let margin = 250 + Math.floor(cameraXBeginPosition / 1000) * 100
      margin = margin > this.cameras.main.width ? this.cameras.main.width - 250 : margin
      const lastPlatformX = this.lastPlatform ? this.lastPlatform.x : platformObjects[platformObjects.length - 1].x
      let x = lastPlatformX + margin
      platformToMove.setPosition(x, platformToMove.y)
      this.lastPlatform = platformToMove
      this.platforms.refresh()
    }
  }
}
