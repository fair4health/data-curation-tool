import { Notify } from 'quasar'

export default {

  install (Vue, options) {
    Vue.prototype.$notify = {
      success (message: string) { Notify.create({type: 'positive', message}) },
      error (message: string) { Notify.create({type: 'negative', message}) },
      info (message: string) { Notify.create({type: 'info', message}) },
      warning (message: string) { Notify.create({type: 'warning', message}) }
    }
  }

}
