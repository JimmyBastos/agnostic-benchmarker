import React, { Component } from 'react'
import './App.style.sass'

import Template from './App.template.jsx'

import { Store } from './store.js'
const store = new Store()

class App extends Component {
  constructor () {
    super()

    this.state = {
      colors : Object.freeze(store.colors),
      amount : 100
    }

    this.syncData = this.syncData.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.handleShuffle = this.handleShuffle.bind(this)
    this.handleSort = this.handleSort.bind(this)
    this.handleSwap = this.handleSwap.bind(this)
    this.handleUpdateColor = this.handleUpdateColor.bind(this)
    this.handleDeleteColor = this.handleDeleteColor.bind(this)
    this.handleClear = this.handleClear.bind(this)
  }

  syncData () {
    this.setState({ ...this.state, colors: store.colors })
  }

  handleAdd ($evt, amount = 1) {
    $evt.preventDefault()
    store.appendColors(amount)
    this.syncData()
  }

  handleShuffle ($evt) {
    $evt.preventDefault()
    store.shuffleColors()
    this.syncData()
  }

  handleSort ($evt) {
    $evt.preventDefault()
    store.sortColorsById()
    this.syncData()
  }

  handleSwap ($evt, rows) {
    $evt.preventDefault()
    store.swapColors(rows)
    this.syncData()
  }

  handleUpdateColor ($evt, id) {
    $evt.preventDefault()
    store.updateColor(id)
    this.syncData()
  }

  handleDeleteColor ($evt, id) {
    $evt.preventDefault()
    store.deleteColor(id)
    this.syncData()
  }

  handleClear ($evt) {
    $evt.preventDefault()
    store.clearColors()
    this.syncData()
  }

  render () {
    return (
      <Template
        colors={this.state.colors}
        handleAdd={this.handleAdd}
        handleShuffle={this.handleShuffle}
        handleSort={this.handleSort}
        handleSwap={this.handleSwap}
        handleUpdateColor={this.handleUpdateColor}
        handleDeleteColor={this.handleDeleteColor}
        handleClear={this.handleClear}
      />
    )
  }
}

export default App
