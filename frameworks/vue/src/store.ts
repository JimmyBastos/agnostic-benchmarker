import _random from 'lodash/random'
import _shuffle from 'lodash/shuffle'

const rgbColorFactory = (red: number, green: number, blue: number): string => `rgb(${red}, ${green}, ${blue})`

const randomColor = (lower: number = 0, upper: number = 255): string =>
  rgbColorFactory(
    _random(lower, upper),
    _random(lower, upper),
    _random(lower, upper),
  )

/* tslint:disable-next-line */
let _currentIndex = 0

export class Color {
   /* tslint:disable-next-line */
   constructor (public id: number, public color: string) { }
}

function generateAmountOfColors(amount: number = 1, startIdx: number = _currentIndex): Color[] {
  return Array(amount)
    .fill(null)
    .map((_, i) =>
      new Color(startIdx + (++i), randomColor()),
    )
}

export class Store {
  /* tslint:disable-next-line */
  public _colorList: Color[]

  constructor() {
    this._colorList = []
  }

  get colors(): Color[] {
    return this._colorList
  }

  set colors(colors: Color[]) {
    this._colorList = colors
    if (Array.isArray(colors)) {
      _currentIndex = this._colorList.length
    }
  }

  public appendColors(amount = 1) {
    this.colors = ([] as Color[]).concat(
      generateAmountOfColors(amount),
      this.colors,
    )
  }

  public shuffleColors() {
    this.colors = _shuffle(this.colors)
  }

  public sortColorsById() {
    this.colors = [...this.colors].sort((next, curr) => (next.id - curr.id))
  }

  public swapColors([idxOne, idxTwo]: [number, number]) {
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

  public deleteColor(colorID: number) {
    const idx = this.colors.findIndex((clr) => clr.id === +colorID)

    if (idx !== -1) {
      this.colors = ([] as Color[]).concat(
        this.colors.slice(0, idx),
        this.colors.slice(idx + 1),
      )
    }
  }

  public updateColor(colorID: number) {
    const idx = this.colors.findIndex((clr) => clr.id === +colorID)
    const newColors = [...this.colors]; newColors[idx] = new Color(newColors[idx].id, randomColor())
    this.colors = newColors
  }

  public clearColors() {
    this.colors = []
  }
}
