import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

import _shf from 'lodash/shuffle';

/* tslint:disable-next-line */
const randomColor = (): string => ('#' + (('000000' + Math.floor(Math.random() * (1 << 24) | 0)) as any).toString(16).substr(-6))

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
  styleUrls: ['./app.component.sass'],
  // changeDetection: ChangeDetectionStrategy.OnPush
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
    this.colors = _shf(this.colors);
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
    const newColors = [...this.colors]; newColors[idx] = { id: newColors[idx].id, color: randomColor() } as IColor;
    this.colors = newColors;
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
