// import _rnd from 'lodash/random'
// import _shf from 'lodash/shuffle'

// const rgbColorFactory = (red, green, blue) => `rgb(${red}, ${green}, ${blue})`

const randomColor = () => ('#' + (('000000' + (Math.random() * (16777215) | 0))).toString(16).substr(-6)) // tslint:disable-line

function generateAmountOfColors (amount = 1, startIndex) {
  return Array(amount).fill(0).map((_, i) => ({
    id    : startIndex + (++i),
    color : randomColor()
  }))
}

export class Store {
  constructor () {
    this.colors = []
  }

  appendColors (amount = 1) {
    this.colors = [].concat(
      generateAmountOfColors(amount, this.colors.length),
      this.colors
    )
  }

  shuffleColors () {
    this.colors = this.colors.reverse()
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
    this.colors[idx].color = randomColor()
  }

  clearColors () {
    this.colors = []
  }
}
