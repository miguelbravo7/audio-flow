const BaseVisualizer = require('./BaseVisualizer')

module.exports = class SolidVisualizer extends BaseVisualizer {
  constructor (options) {
    super(options);
    ({
      barWidth: this.barWidth = 8,
      barHeight: this.barHeight = this.height,
      margin: this.margin = 2,
      colors: this.colors = ['#b6b6b6'],
      gradientStops: this.gradientStops = []
    } = options)
    this.gradient = this.context.createLinearGradient(0, 0, 0, this.height)
    for (const [idx, color] of this.colors.entries()) {
      this.gradient.addColorStop(this.gradientStops[idx] || 1, color)
    }
    this.context.fillStyle = this.gradient
  }

  get spectrumElemWidth () { return this.barWidth + this.margin }
  clear () {}

  draw (spectrum) {
    this.context.save()
    this.context.translate(0, this.height)
    this.context.scale(1, -1)
    this.context.beginPath()
    for (let i = 0; i < spectrum.length; i++) {
      const yPos = this.height * spectrum[i]
      const xPos = (this.barWidth + this.margin) * i
      this.context.clearRect(xPos, yPos, this.barWidth, this.height)
      this.context.rect(
        xPos,
        0,
        this.barWidth,
        yPos
      )
    }
    this.context.fillStyle = this.gradient
    this.context.fill()
    this.context.restore()
  }
}
