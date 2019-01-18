import { Component } from '@angular/core';

// import _shf from 'lodash/shuffle';
// import _rnd from 'lodash/random';

let startTime: number;
let lastMeasure: (string | null);

const startMeasure = (name: string) => {
  startTime = performance.now();
  lastMeasure = name;
};

const stopMeasure = () => {
  const last = lastMeasure;
  if (lastMeasure) {
    window.setTimeout(() => {
      lastMeasure = null;
      const stop = performance.now();
      console.log(last + ' took ' + (stop - startTime)) // tslint:disable-line
    }, 0);
  }
};

/* tslint:disable-next-line */
const randomColor = (): string => ('#' + ('000000' + (Math.random() * (16777215) | 0) as any).toString(16).substr(-6)) // tslint:disable-line

function generateAmountOfColors(amount: number = 1, startIdx: number = 0): IColor[] {
  const colors: IColor[] = [];
  for (let i = 0; i < amount; i++) { colors.push({ id: startIdx + i + 1, color: randomColor() }); }
  return colors;
}

interface IColor {
  id: number;
  color: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent {
  public colors: IColor[] = [];
  public amount = 100;

  public trackById(index: number, item: IColor): number {
    return item.id;
  }

  public prevent($evt: Event) {
    $evt.stopPropagation();
    $evt.preventDefault();
  }

  public add(amount: number = 1) {
    this.colors = ([] as IColor[]).concat(
      generateAmountOfColors(amount, this.colors.length),
      this.colors,
    );
  }

  public shuffle() {
    this.colors = this.colors.reverse();
  }

  public sort() {
    this.colors = [...this.colors].sort((next, curr) => (next.id - curr.id));
  }

  public swap([idxOne, idxTwo]: [number, number]) {
    const size = this.colors.length;
    if (size > idxOne && size > idxTwo) {
      const newColorOne = this.colors[idxTwo];
      const newColorTwo = this.colors[idxOne];
      const newColors = [...this.colors];
      newColors[idxOne] = newColorOne;
      newColors[idxTwo] = newColorTwo;
      this.colors = newColors;
    }
  }

  public updateColor(colorID: number) {
    const idx = this.colors.findIndex((clr) => clr.id === +colorID);
    this.colors[idx].color = randomColor();
  }

  public deleteColor(colorID: number) {
    const idx = this.colors.findIndex((clr) => clr.id === +colorID);

    if (idx !== -1) {
      this.colors = ([] as IColor[]).concat(
        this.colors.slice(0, idx),
        this.colors.slice(idx + 1),
      );
    }
  }

  public clear() {
    this.colors = [];
  }
}
