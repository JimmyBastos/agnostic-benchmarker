<template>
  <div id='app'>
    <div class='container pure-g '>
      <div class='pure-u-12-24'>
        <div class='wrapper table'>
          <h1 class='bk-title table-cell align-middle'> {{ title }} </h1>
        </div>
      </div>

      <div class='pure-u-12-24'>
        <div class='wrapper'>
          <button
            id='button__add'
            class='pure-button bk-button bk-button-primary'
            @click.prevent='add'
          >
            Add Color
          </button>

          <button
            id='button__populate'
            class='pure-button bk-button bk-button-success'
            @click.prevent='populate'
          >
            Load {{ amount }} Colors
          </button>

          <button
            id='button__populate_hot'
            class='pure-button bk-button bk-button-warning-2'
            @click.prevent='populate(amount * 10)'
          >
            Load {{ amount * 10 }} Colors
          </button>

          <button
            id='button__shuffle'
            class='pure-button bk-button bk-button-warning'
            @click.prevent='shuffle'
          >
            Shuffle Colors
          </button>

          <button
            id='button__clear'
            class='pure-button bk-button bk-button-danger'
            @click.prevent='clear'
          >
            Clear Colors
          </button>
        </div>
      </div>
    </div>

    <div class='container'>
      <BkTable
        :colors='colors'
        @updateColor='updateColor'
        @deleteColor='deleteColor'
      />
    </div>
  </div>
</template>

<script>
import BkTable from '@/components/BkTable.vue'
import { Store } from './store'

const store = new Store()

export default {
  name: 'App',

  components: { BkTable },

  data: () => ({
    colors : store.colors,
    amount : 1000,
    title  : 'Vue@2.5.17 Bechmark'
  }),

  methods: {
    add () {
      store.appendColors(1)
      this.syncData()
    },

    populate (amount) {
      amount = !isNaN(+amount) ? (+amount) : (this.amount) // set default amount

      store.generateColors(amount)
      this.syncData()
    },

    shuffle () {
      store.shuffleColors()
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
</script>

<style lang="sass" src="@/assets/styles.sass"></style>
