import React from 'react'
import ReactDOM from 'react-dom'

import '../node_modules/pure-css/lib/base.css'
import '../node_modules/pure-css/lib/buttons.css'
import '../node_modules/pure-css/lib/grids.css'

import './assets/styles/main.sass'

import App from './App.jsx'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
