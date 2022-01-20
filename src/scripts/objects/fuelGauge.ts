import { GameObjects, Scene } from 'phaser'
import ProgressBar from 'progressbar.js'
import Circle from 'progressbar.js/circle'

let fuelGauge: FuelGauge | undefined

class FuelGauge extends GameObjects.DOMElement {
  progress: Circle
  constructor(scene: Scene) {
    const width = 85
    const height = 85
    const x = 20
    const y = 10
    const progressContainer = document.createElement('div')

    super(scene, x + width / 2, y + height / 2, progressContainer, `width: ${width}px; height: ${height}px`)

    progressContainer.style.display = 'block'
    progressContainer.style.pointerEvents = 'auto'
    progressContainer.style.transform = `translate(${x}px, ${y}px)`

    this.progress = new ProgressBar.Circle(progressContainer, {
      duration: 300,
      easing: 'easeOut',
      trailColor: '#B6CDEC',
      trailWidth: 8,
      color: '#568CE4',
      strokeWidth: 8,
      step(state, circle) {
        const progress = circle as Circle
        const value = Math.round(progress.value() * 100)
        if (value <= 0) {
          progress.setText('0%')
        }
        progress.setText(`${value}%`)
      }
    })
    this.progress.set(1)
    this.progress.setText('100%')
    this.setScrollFactor(0, 0)
  }

  static getInstance(scene: Scene) {
    if (!fuelGauge) {
      fuelGauge = new FuelGauge(scene)
    }
    return fuelGauge
  }

  static destroyInstance() {
    fuelGauge?.destroy(true)
    fuelGauge = undefined
  }
}

export default FuelGauge
