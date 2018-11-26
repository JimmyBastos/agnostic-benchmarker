import _random  from 'lodash/random'
import _shuffle from 'lodash/shuffle'

const rgbColorFactory = (red, green, blue) => `rgb(${red}, ${green}, ${blue})`

const randomColor = (lower = 0, upper = 255) =>
  rgbColorFactory(
    _random(lower, upper),
    _random(lower, upper),
    _random(lower, upper)
  )

let _currentIndex = 0

function generateAmountOfColors (amount = 1, startIndex = _currentIndex) {
  return Array(amount).fill().map((_, i) => ({
    id    : (++i) + startIndex,
    color : randomColor()
  }))
}

export class Store {
  constructor () {
    this._colorList = []
  }

  get colors () {
    return this._colorList
  }

  set colors (colors = []) {
    this._colorList = colors
    if (Array.isArray(colors)) {
      _currentIndex = this._colorList.length
    }
  }

  generateColors (amount = 1000) {
    this.colors = generateAmountOfColors(amount, 0)
  }

  appendColors (amount = 1) {
    this.colors = [].concat(
      this.colors,
      generateAmountOfColors(amount)
    )
  }

  shuffleColors () {
    this.colors = _shuffle(this.colors)
  }

  deleteColor (colorID) {
    // this.colors = this.colors.filter(clr => clr.id !== +colorID)

    const idx = this.colors.findIndex(clr => clr.id === +colorID)

    if (~idx) {
      this.colors = [].concat(
        this.colors.slice(0, idx),
        this.colors.slice(idx + 1)
      )
    }
  }

  updateColor (colorID) {
    this.colors = this.colors.map(clr => (clr.id === +colorID)
      ? (
        { ...clr, color: randomColor() }
      )
      : (
        clr
      )
    )
  }

  clearColors () {
    this.colors = []
  }
}
