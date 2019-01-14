import Vue from 'vue'
import App from './App.vue'

import '../node_modules/pure-css'
// import './assets/styles/main.sass'

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App)
}).$mount('#app')
