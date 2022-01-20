import { GameObjects, Scene } from 'phaser'

let scoreInstance: Score | undefined

class Score extends GameObjects.Text {
  score: number = 0
  constructor(scene: Scene) {
    super(scene, scene.cameras.main.width - 110, 20, 'Score: 0', {
      color: '#568CE4',
      fontSize: '18px'
    })

    this.setScrollFactor(0)
  }

  increaseScore(value: number) {
    this.score += value
    this.setText(`Score: ${this.score}`)
  }

  static getInstance(scene: Scene) {
    if (!scoreInstance) {
      scoreInstance = new Score(scene)
    }
    return scoreInstance
  }

  static destroyInstance() {
    scoreInstance?.destroy(true)
    scoreInstance = undefined
  }
}

export default Score
