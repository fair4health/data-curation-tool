import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './quasar'
import { QVueGlobals } from 'quasar'
import logger from './common/logger'
import { webFrame } from 'electron'

webFrame.setZoomFactor(0.9)

Vue.config.productionTip = false

Vue.use(logger)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
