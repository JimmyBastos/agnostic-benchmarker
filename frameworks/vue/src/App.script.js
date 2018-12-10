
import { Store } from './store'

const store = new Store()

export default {
  name: 'App',

  data: () => ({
    colors : Object.freeze(store.colors),
    amount : 100
  }),

  methods: {
    add (amount = 1) {
      store.appendColors(amount)
      this.syncData()
    },

    shuffle () {
      store.shuffleColors()
      this.syncData()
    },

    sort () {
      store.sortColorsById()
      this.syncData()
    },

    swap (rows) {
      store.swapColors(rows)
      this.syncData()
    },

    updateColor (id) {
      store.updateColor(id)
      this.syncData()
    },

    deleteColor (id) {
      store.deleteColor(id)
      this.syncData()
    },

    clear () {
      store.clearColors()
      this.syncData()
    },

    syncData () {
      this.colors = Object.freeze(store.colors)
    }
  }
}
