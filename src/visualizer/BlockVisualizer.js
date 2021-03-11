const BaseVisualizer = require('./BaseVisualizer')

module.exports = class BlockVisualizer extends BaseVisualizer {
  constructor (options) {
    super(options);
    ({
      blockWidth: this.blockWidth = 15,
      blockHeight: this.blockHeight = 8,
      marginh: this.marginh = 2,
      marginv: this.marginv = 2,
      colors: this.colors = ['#b6b6b6'],
      gradientStops: this.gradientStops = [],
      playbackColors: this.playbackColors = ['#e66465', '#c75db5', '#9198e5'],
      playbackGradientStops: this.playbackGradientStops = [0.3, 0.7]
    } = options)
    this.remnantStartPoints = []
    this.remnantCurrentPoints = []
    this.remnantTicks = []
    this.prevBlockPoint = []
    this._spectrumElemWidth = this.blockWidth + this.marginh
    this._spectrumElemHeight = this.blockHeight + this.marginv
    this.gradient = this.context.createLinearGradient(0, 0, 0, this.height)
    for (const [idx, color] of this.colors.entries()) {
      this.gradient.addColorStop(this.gradientStops[idx] || 1, color)
    }
    this.playbackGradient = this.context.createLinearGradient(0, 0, 0, this.height)
    for (const [idx, color] of this.playbackColors.entries()) {
      this.playbackGradient.addColorStop(this.playbackGradientStops[idx] || 1, color)
    }
    this.gradients = [this.playbackGradient, this.gradient]
  }

  get spectrumElemWidth () { return this._spectrumElemWidth }
  clear () { this.prevBlockPoint = [] }

  draw (spectrum, timestamp, playback) {
    this.context.save()
    this.context.translate(0, this.height)
    this.context.scale(1, -1)
    const renderLimit = this.width / this._spectrumElemWidth
    const playbackPos = Math.floor(renderLimit * playback)
    for (const [idx, [leftInterval, rightInterval]] of [[0, playbackPos], [playbackPos, renderLimit]].entries()) {
      this.context.beginPath()
      for (let i = leftInterval; i < rightInterval; i++) {
        const blockPoint = Math.floor(this.height * spectrum[i] / this._spectrumElemHeight)
        this.context.clearRect(
          this._spectrumElemWidth * i,
          0,
          this.blockWidth,
          this.height
        )
        for (let j = 0; j < blockPoint; j++) {
          this.drawBlock(i, j)
        }
        if (this.remnantStartPoints[i] == null) {
          this.remnantStartPoints[i] = 0
          this.remnantCurrentPoints[i] = 0
          this.remnantTicks[i] = timestamp
        } else if (this.remnantCurrentPoints[i] <= blockPoint) {
          this.remnantStartPoints[i] = blockPoint
          this.remnantCurrentPoints[i] = blockPoint
          this.remnantTicks[i] = timestamp
        }
        if (this.remnantCurrentPoints[i] >= 0) {
          this.drawBlock(i, this.remnantCurrentPoints[i])
        }
      }
      this.updateRemnantPoints(timestamp)
      this.context.fillStyle = this.gradients[idx]
      this.context.fill()
    }
    this.context.restore()
  }

  drawBlock (xPos, yPos) {
    const x = this._spectrumElemWidth * xPos
    const y = this._spectrumElemHeight * yPos
    this.context.rect(x, y, this.blockWidth, this.blockHeight)
  }

  updateRemnantPoints (timestamp) {
    for (let i = 0; i < this.remnantStartPoints.length; i++) {
      const start = this.remnantStartPoints[i]
      const t = this.remnantTicks[i]
      if (!start) { continue }

      const e = timestamp - t - 64
      if (e <= 0) {
        this.remnantCurrentPoints[i] = start
        continue
      }
      const p = start - Math.floor(e / 32)
      this.remnantCurrentPoints[i] = p
      if (p < 0) {
        this.remnantStartPoints[i] = 0
        this.remnantCurrentPoints[i] = 0
        this.remnantTicks[i] = 0
      }
    }
  }
}
