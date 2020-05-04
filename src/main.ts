import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './quasar'
import { QVueGlobals } from 'quasar'
import { webFrame } from 'electron'
import notifier from './common/notifier'
import { FhirService } from './common/services/fhir.service'

window.process.env.ELECTRON_WEBPACK_APP_F4H_HOMEPAGE = require('./../package.json').homepage

webFrame.setZoomFactor(0.9)

Vue.config.productionTip = false

Vue.prototype.$fhirService = new FhirService()

Vue.use(notifier)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
