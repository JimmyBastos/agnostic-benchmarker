<template>
  <!-- ROOT TAG -->
  <div id='app'>

    <!-- APP MENU -->
    <div class='app-container app-menu pure-menu pure-menu-horizontal'>
      <!-- BRAND: framework@version -->
      <span class='app-menu-heading pure-menu-heading app-title'>
        Vue@2.5.17
      </span>

      <!-- <ul class='pure-menu-list'>
        <li class='app-menu-item pure-menu-item'>
          <a
            href='#'
            class='app-menu-link pure-menu-link'
          >Resultados</a>
        </li>
      </ul> -->
    </div>

    <!-- APP ACTIONS -->
    <div class='app-actions app-u-sticky app-u-pin-t app-u-shadow-lg'>
      <!-- GRID -->
      <div class='app-wrapper app-container'>
        <!-- ADD COLOR -->
        <div class='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
          <button
            id='button__add'
            class='pure-button app-button'
            style='background-color: LimeGreen'
            @click.prevent='add'
          >Inserir 1 Item</button>
        </div>

        <!-- LOAD 100 COLORS -->
        <div class='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
          <button
            id='button__populate'
            class='pure-button app-button'
            style='background-color: DodgerBlue'
            @click.prevent='add(100)'
          >Inserir 100 Itens</button>
        </div>

        <!-- SWAP 2 ROWS -->
        <div class='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
          <button
            id='button__swap'
            class='pure-button app-button'
            style='background-color: OrangeRed'
            @click.prevent='swap([0, colors.length - 1])'
          >Permutar 2 Itens</button>
        </div>

        <!-- SHUFFLE COLORS -->
        <div class='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
          <button
            id='button__shuffle'
            class='pure-button app-button'
            style='background-color: DarkViolet'
            @click.prevent='shuffle'
          >Embaralhar Lista</button>
        </div>

        <!-- SORT COLORS -->
        <div class='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
          <button
            id='button__sort'
            class='pure-button app-button'
            style='background-color: FireBrick'
            @click.prevent='sort'
          >Ordernar Lista</button>
        </div>

        <!-- CLEAR COLORS -->
        <div class='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
          <button
            id='button__clear'
            class='pure-button app-button'
            style='background-color: Crimson'
            @click.prevent='clear'
          >Limpar Lista</button>
        </div>
      </div>

    </div>

    <!-- APP TABLE -->
    <div class='app-container'>
      <table class='app-table'>

        <tbody class='app-table-body'>

          <!-- COLOR -->
          <tr
            v-for='{ color, color: label, id } of colors'
            :key='`table-row-${id}-${color}`'
            :style='{ backgroundColor: color }'
            class='app-table-row'
          >
            <!-- COLOR ID -->
            <td class='app-table-id'>
              <span
                class='app-table-label'
                style='padding: 6px'
              >
                {{ id }}
              </span>
            </td>

            <!-- COLOR LABEL -->
            <td
              class='app-table-cell'
            >
              <span class='app-table-label'>
                {{ label }}
              </span>
            </td>

            <!-- ACTION: UPDATE COLOR -->
            <td class='app-table-cell app-table-action'>

              <a
                href=''
                class='button_update pure-button app-button app-table-label'
                @click.prevent='updateColor(id)'
              >
                <!-- button icon -->
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 51.4 51.4'
                  width='24'
                  height='24'
                >
                  <g fill='#fff'><path d='M1.7 25.2a1 1 0 0 0 1-1c0-6.065 4.935-11 11-11h24v8.964L51.4 12.2 37.7 2.236V11.2h-24a13.02 13.02 0 0 0-13 13 1 1 0 0 0 1 1zm38-19.036L48 12.2l-8.3 6.036V6.164zm10 20.036a1 1 0 0 0-1 1c0 6.065-4.935 11-11 11h-24v-8.964L0 39.2l13.7 9.964V40.2h24a13.02 13.02 0 0 0 13-13 1 1 0 0 0-1-1zm-38 19.036L3.4 39.2l8.3-6.036v12.072z' /></g>
                </svg>
              </a>
            </td>

            <!-- ACTION: DELETE COLOR -->

            <td class='app-table-cell app-table-action'>
              <a
                href=''
                class='button_delete pure-button app-button app-table-label'
                @click.prevent='deleteColor(id)'
              >
                <!-- button icon -->
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 59 59'
                  width='24'
                  height='24'
                >
                  <g fill='#fff'><path d='M29.5 51a1 1 0 0 0 1-1V17a1 1 0 1 0-2 0v33a1 1 0 0 0 1 1zm-10 0a1 1 0 0 0 1-1V17a1 1 0 1 0-2 0v33a1 1 0 0 0 1 1zm20 0a1 1 0 0 0 1-1V17a1 1 0 1 0-2 0v33a1 1 0 0 0 1 1zm13-45H38.456c-.1-1.25-.495-3.358-1.813-4.7C35.8.434 34.75 0 33.5 0h-10c-1.252 0-2.3.434-3.144 1.3-1.318 1.353-1.703 3.46-1.813 4.7H6.5a1 1 0 1 0 0 2h2.04l1.915 46.02c.037 1.722 1.1 4.98 4.908 4.98h28.272c3.8 0 4.87-3.257 4.907-4.958L50.46 8h2.04a1 1 0 1 0 0-2zM21.792 2.68C22.24 2.223 22.8 2 23.5 2h10c.7 0 1.26.223 1.708.68.805.823 1.128 2.27 1.24 3.32H20.553c.112-1.048.435-2.496 1.24-3.32zm24.752 51.3c-.006.3-.144 3.02-2.908 3.02H15.364c-2.734 0-2.898-2.717-2.9-3.042L10.542 8h37.915l-1.913 45.98z' /></g>
                </svg>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { Store } from './store'

const store = new Store()

export default {
  name: 'App',

  data: () => ({
    colors : Object.freeze(store.colors),
    amount : 100
  }),

  methods: {
    async add (amount = 1) {
      await store.appendColors(amount)
      this.syncData()
    },

    async shuffle () {
      await store.shuffleColors()
      this.syncData()
    },

    async sort () {
      await store.sortColorsById()
      this.syncData()
    },

    async swap (rows) {
      await store.swapColors(rows)
      this.syncData()
    },

    async updateColor (id) {
      await store.updateColor(id)
      this.syncData()
    },

    async deleteColor (id) {
      await store.deleteColor(id)
      this.syncData()
    },

    async clear () {
      await store.clearColors()
      this.syncData()
    },

    syncData () {
      this.colors = Object.freeze(store.colors)
    }
  }
}
</script>

<style lang="sass" scoped>
@import '@/assets/styles/_breakpoints.sass'
@import '@/assets/styles/_base.sass'
@import '@/assets/styles/_utils.sass'

.app-wrapper
  display: flex
  flex-wrap: wrap
  [class*='pure-u-']
    padding: .25rem

.app-actions
  width: 100%
  padding-top: .5rem
  padding-bottom: .5rem
  background-color: $base-background-color

.app-menu
  &-active > &-link,
  &-link:hover,
  &-link:focus
    background-color: rgba(0,0,0, .1)

  &-heading,
  &-link
    color: #79838a

.app-title
  font-size: 1.5rem
  text-align: center

.app-table
  width: 100%
  border-collapse: separate
  border-spacing: 0 1rem
  // &-body
  &-row
    $border-radius: .75rem
    @extend %shadow-lg
    margin: 1rem
    border-width: 0
    border-radius: $border-radius
    td:first-child
      padding-left: 12px
      border-top-left-radius: $border-radius
      border-bottom-left-radius: $border-radius

    td:last-child
      padding-right: 12px
      border-top-right-radius: $border-radius
      border-bottom-right-radius: $border-radius

  &-cell,
  &-id
    padding: 10px 4px
  &-id
    width: 4ch
    text-align: center
  &-action
    width: 6ch
    text-align: center
    .app-button
      padding: .625rem
      width: fit-content
  &-label
    display         : inline-block
    color           : white
    background-color: rgba(0,0,0,0.275)
    border-radius   : 4px
    padding         : 6px 18px
    margin          : 0

.app-button
  @extend %shadow-lg
  font-size: 100%
  display: inline-block
  width: 100%
  border-radius: .75rem
  color: white
  padding-top: .75rem
  padding-bottom: .75rem
  &-transparent
    background-color: rgba(0,0,0,0.275)
  svg
    vertical-align: middle;

@media #{$max-screen-sm}
  .app-button
    font-size: 90%
  .app-table
    &-label
      font-size: 80%
      padding: .25rem .425rem
    &-action
      .app-button
        padding: .25rem .425rem
      svg
        max-width: 1rem
</style>
