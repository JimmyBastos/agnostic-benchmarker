import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Store, Color } from '../store';

const store = new Store();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {
  colors = Object.freeze(store.colors);
  amount = 100;

  trackById(index: number, item: Color): number {
    return item.id;
  }

  prevent($evt: Event) {
    $evt.stopPropagation();
    $evt.preventDefault();
  }

  add(amount: number = 1) {
    store.appendColors(amount);
    this.syncData();
  }

  shuffle() {
    store.shuffleColors();
    this.syncData();
  }

  sort() {
    store.sortColorsById();
    this.syncData();
  }

  swap(rows: [number, number]) {
    store.swapColors(rows);
    this.syncData();
  }

  updateColor(id: number) {
    store.updateColor(id);
    this.syncData();
  }

  deleteColor(id: number) {
    store.deleteColor(id);
    this.syncData();
  }

  clear() {
    store.clearColors();
    this.syncData();
  }

  syncData() {
    this.colors = Object.freeze(store.colors);
  }
}
