module.exports = class BaseVisualizer {
  constructor ({ canvas }) {
    this._canvas = canvas
    const context = this.canvas.getContext('2d')
    if (context == null) {
      throw new Error('Cannot get context 2d')
    }
    this._context = context
    this.canvas.width = parseInt(getComputedStyle(this._canvas).width, 10) || this._canvas.width
    this.canvas.height = parseInt(getComputedStyle(this._canvas).height, 10) || this._canvas.height
    this.subscriberCallbacks = []
    this.observer = new ResizeObserver((entries) => {
      this.canvas.width = entries[0].contentRect.width
      this.canvas.height = entries[0].contentRect.height
      this.clear()
      this.subscriberCallbacks.forEach(subCallback => subCallback(this))
    })
    this.observer.observe(this._canvas)
  }

  get canvas () { return this._canvas }
  get context () { return this._context }
  get height () { return this.canvas.height }
  get width () { return this.canvas.width }
  get fftSize () { return 2 ** Math.floor(Math.log2(this.width / this.spectrumElemWidth)) * 4 }
  get spectrumElemWidth () { throw new Error('Extend me!') }

  subscribe (subCallback) { this.subscriberCallbacks.push(subCallback) }
  clear () { throw new Error('Extend me!') }
  draw (_) { throw new Error('Extend me!') }
}
