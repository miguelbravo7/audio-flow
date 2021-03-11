const AudioAnalyser = require('./AudioAnalyser')
const EventEmitter = require('events')
module.exports = class AudioSpectrum {
  constructor (visualizer) {
    this.analyser = null
    this.visualizer = visualizer
    this.visualizer.subscribe(function (ctx) { this.analyser?.updateFftSize(ctx.fftSize) }.bind(this))
    this.eventEmitter = new EventEmitter()
    this.eventEmitter.on('draw', () => {
      window.requestAnimationFrame(this.draw.bind(this))
    })
    window.requestAnimationFrame(this.draw.bind(this))
  }

  get canvas () { return this.visualizer?.canvas }
  get isReady () { return this.analyser?.isReady && this.visualizer != null }
  get audio () { return this.analyser }
  set audio (howl) { this.analyser = new AudioAnalyser(howl, this.visualizer.fftSize) }
  get playback () { return this.analyser.howl.seek() / this.analyser.howl.duration() }
  set playback (position) {
    this.analyser.howl.seek(position * this.analyser.howl.duration())
    if (this.analyser.howl.playing()) { this.analyser.howl.pause(); this.analyser.howl.play() }
  }

  destroy () { this.analyser?.destroy() }

  draw (timestamp) {
    if (this.analyser?.isReady) {
      this.visualizer?.draw(this.analyser.spectrumArray, timestamp, this.playback)
    }
    this.eventEmitter.emit('draw')
  }
}
