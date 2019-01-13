import Vue from 'vue'
import App from './App.template.vue'

import 'pure-css'
import '@/assets/styles/main.sass' // tslint:disable-line

const isProductionEnv = (process.env.NODE_ENV === 'production')

Vue.config.productionTip = isProductionEnv
Vue.config.devtools = !isProductionEnv
Vue.config.performance = !isProductionEnv

new Vue({
  render: h => h(App)
}).$mount('#app')
