
import { Component, Vue } from 'vue-property-decorator'
// import _rnd from 'lodash/random'
// import _shf from 'lodash/shuffle'

let startTime: number
let lastMeasure: (string | null)

const startMeasure = (name: string) => {
  startTime = performance.now()
  lastMeasure = name
}

const stopMeasure = () => {
  const last = lastMeasure
  if (lastMeasure) {
    window.setTimeout(() => {
      lastMeasure = null
      const stop = performance.now()
      console.log(last + ' took ' + (stop - startTime)) // tslint:disable-line
    }, 0)
  }
}

const randomColor = (): string => ('#' + ('000000' + (Math.random() * (16777215) | 0) as any).toString(16).substr(-6)) // tslint:disable-line

function generateAmountOfColors(amount: number = 1, startIdx: number = 0): IColor[] {
  const colors: IColor[] = []
  for (let i = 0; i < amount; i++) { colors.push({ id: startIdx + i + 1, color: randomColor() }) }
  return colors
}

interface IColor {
  id: number
  color: string
}

@Component({})
export default class App extends Vue {
  /* tslint:disable-next-line */
  public colors: IColor[] = []
  public amount = 100

  public add(amount: number = 1) {
    this.colors = ([] as IColor[]).concat(
      generateAmountOfColors(amount, this.colors.length),
      this.colors,
    )
  }

  public shuffle() {
    this.colors = this.colors.reverse()
  }

  public sort() {
    this.colors = [...this.colors].sort((next, curr) => (next.id - curr.id))
  }

  public swap([idxOne, idxTwo]: [number, number]) {
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

  public updateColor(colorID: number) {
    const idx = this.colors.findIndex((clr) => clr.id === +colorID)
    this.colors[idx].color = randomColor()
  }

  public deleteColor(colorID: number) {
    const idx = this.colors.findIndex((clr) => clr.id === +colorID)

    if (idx !== -1) {
      this.colors = ([] as IColor[]).concat(
        this.colors.slice(0, idx),
        this.colors.slice(idx + 1),
      )
    }
  }

  public clear() {
    this.colors = []
  }
}
