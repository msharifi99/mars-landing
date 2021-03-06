import { GameObjects, Physics } from 'phaser'
import FuelGauge from '../objects/fuelGauge'
import Ground from '../objects/ground'
import Platform from '../objects/platform'
import Player from '../objects/player'
import Score from '../objects/score'

const xMarginRangeByLevel = [
  [-100, 0],
  [0, 100],
  [100, 200]
]

export default class MainScene extends Phaser.Scene {
  player: Player
  grounds: Physics.Arcade.StaticGroup
  platforms: Physics.Arcade.StaticGroup
  lastPlatform: Platform
  lastLandedPlatformX: number
  tempScore: number = 1
  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.grounds = this.addGrounds()
    this.platforms = this.addPlatforms()
    this.lastPlatform = this.platforms.getChildren()[this.platforms.getLength() - 1] as Platform
    this.lastLandedPlatformX = (this.platforms.getChildren()[0] as Platform).x
    this.player = this.addPlayer()
    this.add.existing(FuelGauge.getInstance(this))
    this.add.existing(Score.getInstance(this))

    this.physics.add.collider(this.grounds, this.player, () => {
      this.registry.destroy() // destroy registry
      FuelGauge.destroyInstance()
      Score.destroyInstance()
      this.scene.restart() // restart current scene
    })
    this.physics.add.collider(this.player, this.platforms, (player, platform) => {
      if (!(player as Player).body.onFloor()) return
      this.panCameraToNextPlatform(platform as Platform)
      this.calculateScore(platform as Platform)
      this.lastLandedPlatformX = (platform as Platform).x
      this.player.onCollide(platform)
    })
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
    const firstPlatform = this.platforms.getChildren()[0] as Platform
    const player = new Player(this, firstPlatform.x, firstPlatform.y - 100)
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
  getRandomPlatformHeight() {
    const groundHeight = (this.grounds.getChildren()[0] as Ground).height
    const zeroY = this.cameras.main.height - groundHeight
    const maxY = zeroY - 300

    return Math.round(zeroY - Math.random() * maxY)
  }

  addPlatforms() {
    const groundHeight = (this.grounds.getChildren()[0] as Ground).height
    const zeroY = this.cameras.main.height - groundHeight

    const platformObjects = Array(3)
      .fill(1)
      .map(
        (_, index) =>
          new Platform(
            this,
            this.calculatePlatformXMargin(0) * index + 100,
            index === 0 ? zeroY : this.getRandomPlatformHeight()
          )
      )

    return this.addExistingGroupObject(platformObjects, true)
  }

  panCamera() {
    if (this.player.body.onFloor()) return

    let newXCenter = this.cameras.main.centerX + this.cameras.main.scrollX
    const isPlayerPassedLandedPlatform = this.player.x > this.lastLandedPlatformX
    const isPlayerTooFarFromLeftSide = this.player.x - this.cameras.main.scrollX > 200
    if (isPlayerPassedLandedPlatform && isPlayerTooFarFromLeftSide) {
      const xStep = 10 / Math.log(Math.abs(this.player.x - this.lastLandedPlatformX + 1))
      newXCenter += xStep
    }

    const YThreshold = 0.4
    let newYCenter = this.cameras.main.centerY + this.cameras.main.scrollY

    const isPlayerHigherThenThreshold = this.player.y < this.cameras.main.height * YThreshold
    const isPlayerInScreen = this.player.y > 0
    if (isPlayerHigherThenThreshold && isPlayerInScreen) {
      const rangeBeginning = this.cameras.main.height * YThreshold
      const rangeEnding = rangeBeginning * 2

      const precentOfScreenWherePlayerShouldBe =
        (this.player.y - rangeBeginning) * (0.2 / (rangeEnding - rangeBeginning)) + YThreshold
      newYCenter = this.player.y - this.cameras.main.height * (precentOfScreenWherePlayerShouldBe - 0.5)
    }

    this.cameras.main.pan(newXCenter, newYCenter, 0)
  }

  panCameraToNextPlatform(landedPlatform: Platform) {
    if (this.lastLandedPlatformX === landedPlatform.x) return
    this.cameras.main.pan(
      this.cameras.main.centerX + landedPlatform.x - 100,
      this.cameras.main.centerY,
      1000,
      Phaser.Math.Easing.Cubic.InOut
    )
  }

  reuseGrounds() {
    const cameraXBeginPosition = this.cameras.main.scrollX
    const groundObjects = this.grounds.getChildren() as Ground[]
    const groundToMove = groundObjects.find(ground => cameraXBeginPosition - ground.x > ground.width)

    if (groundToMove) {
      let x = groundToMove.x + groundToMove.width * groundObjects.length
      groundToMove.body.reset(x, groundToMove.y)
    }
  }

  reusePlatforms() {
    const cameraXBeginPosition = this.cameras.main.scrollX
    const platformObjects = this.platforms.getChildren() as Platform[]

    const platformToMove = platformObjects.find(platform => cameraXBeginPosition - platform.x > platform.width)

    if (platformToMove) {
      if (!this.player.body.onFloor()) {
        this.tempScore++
      }
      const xMargin = this.calculatePlatformXMargin()
      const x = this.lastPlatform.x + xMargin
      platformToMove.body.reset(x, this.getRandomPlatformHeight())
      this.lastPlatform = platformToMove
    }
  }
  calculateScore(landedPlatform: Platform) {
    if (landedPlatform.x === this.lastLandedPlatformX) return
    Score.getInstance(this).increaseScore(this.tempScore)
    this.tempScore = 1
  }

  getLevel() {
    return Math.floor(Score.getInstance(this).score / 10)
  }

  calculatePlatformXMargin(level: number = this.getLevel()) {
    const xMarginRange =
      level >= xMarginRangeByLevel.length
        ? xMarginRangeByLevel[xMarginRangeByLevel.length - 1]
        : xMarginRangeByLevel[level]

    return this.cameras.main.centerX + Math.round(Math.random() * xMarginRange[1] + xMarginRange[0])
  }
}
