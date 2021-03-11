const { Howler } = require('howler')

module.exports = class AudioAnalyser {
  constructor (howl, fftSize) {
    this.ready = false
    this.spectrum = []
    this.howl = howl
    this.analyserNode = Howler.ctx.createAnalyser() // Sound analysis node
    this.updateFftSize(fftSize)
    howl.on('play', () => {
      this.audioSource = howl._sounds[0]._node.bufferSource
      this.audioSource.connect(this.analyserNode)
      this.ready = true
    })
  }

  get isReady () { return this.ready }
  get length () { return this.max - this.min }

  updateFftSize (fftSize) {
    this._spectrumArray = new Uint8Array(fftSize)
    this.analyserNode.fftSize = fftSize * 2
    this.min = Math.floor(this._spectrumArray.length * 0.1)
    this.max = Math.floor(this._spectrumArray.length * 0.8)
  }

  destroy () {
    if (this.audioSource != null && this.analyserNode != null) {
      try {
        this.audioSource.disconnect(this.analyserNode)
      } catch (e) {
        console.error(e)
      }
    }
    this.audioSource = null
    this.analyserNode = null
    this.ready = false
  }

  get spectrumArray () {
    if (this.ready && this.analyserNode != null) {
      this.analyserNode.getByteFrequencyData(this._spectrumArray)
      for (let i = this.min, sp = 0; i < this.max; i++, sp++) {
        this.spectrum[sp] = this._spectrumArray[i] / 256
      }
    }
    return this.spectrum
  }
}
