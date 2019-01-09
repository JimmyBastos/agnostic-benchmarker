import _random from 'lodash/random'
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
    id    : startIndex + (++i),
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

  set colors (colors) {
    this._colorList = colors
    if (Array.isArray(colors)) {
      _currentIndex = this._colorList.length
    }
  }

  appendColors (amount = 1) {
    this.colors = [].concat(
      generateAmountOfColors(amount),
      this.colors
    )
  }

  shuffleColors () {
    this.colors = _shuffle(this.colors)
  }

  sortColorsById () {
    this.colors = [...this.colors].sort((next, curr) => (next.id - curr.id))
  }

  swapColors ([idxOne, idxTwo]) {
    const size = this.colors.length
    if (size > idxOne && size > idxTwo) {
      const newColorOne = this.colors[idxTwo]
      const newColorTwo = this.colors[idxOne]
      const newColors = [...this.colors]
      newColors[idxOne] = newColorOne
      newColors[idxTwo] = newColorTwo
      this.colors = newColors
    }
  }

  deleteColor (colorID) {
    const idx = this.colors.findIndex(clr => clr.id === +colorID)

    if (~idx) {
      this.colors = [].concat(
        this.colors.slice(0, idx),
        this.colors.slice(idx + 1)
      )
    }
  }

  updateColor (colorID) {
    const idx = this.colors.findIndex(clr => clr.id === +colorID)

    let newColors = [...this.colors]
    newColors[idx] = { ...newColors[idx], color: randomColor() }
    this.colors = newColors
  }

  clearColors () {
    this.colors = []
  }
}
