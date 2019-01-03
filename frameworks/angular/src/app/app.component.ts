import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Store } from '../store';
const store = new Store();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {
  title = 'angular-benchmark';
  colors = Object.freeze(store.colors);
  amount = 100;

  trackById(index, item) {
    return item.id;
  }

  prevent($evt) {
    $evt.stopPropagation();
    $evt.preventDefault();
  }

  add(amount = 1) {
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

  swap(rows) {
    store.swapColors(rows);
    this.syncData();
  }

  updateColor(id) {
    store.updateColor(id);
    this.syncData();
  }

  deleteColor(id) {
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
