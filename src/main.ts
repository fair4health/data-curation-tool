import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './quasar'
import { QVueGlobals } from 'quasar'
import { webFrame } from 'electron'
import notifier from './common/notifier'
import { FhirService } from './common/services/fhir.service'
import { TerminologyService } from '@/common/services/terminology.service'
import _ from 'lodash'
import i18n from './i18n'

webFrame.setZoomFactor(0.9)

Vue.config.productionTip = false

Vue.prototype.$fhirService = new FhirService()
Vue.prototype.$terminologyService = new TerminologyService()
Vue.prototype.$_ = _

Vue.use(notifier)

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
