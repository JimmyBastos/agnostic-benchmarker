import Vue from 'vue'
import App from './App.template.vue'

import '../node_modules/pure-css/lib/base.css'
import '../node_modules/pure-css/lib/buttons.css'
import '../node_modules/pure-css/lib/grids.css'

import '@/assets/styles/main.sass'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
