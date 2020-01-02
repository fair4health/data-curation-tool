import store from '@/store'

export default {

  install (Vue, options) {
    function log (type, title, text) {
      let color: string
      const time = (new Date()).toISOString()
      if (type === 'success') color = 'green'
      else if (type === 'error') color = 'red'
      else if (type === 'warning') color = 'orange'
      else color = 'primary'
      store.commit(
        'updateLog',
        `<span class="text-weight-bold text-grey-8">[${time}]</span>
         <span class="text-${color} text-weight-bold bg-grey-2 q-mx-sm">[${type}]:</span>
         <span class="text-weight-bold q-mx-xs text-grey-10">${title.toUpperCase()}</span>
         <span class="q-ml-sm text-grey-7">${text}</span>`
      )
    }

    Vue.prototype.$log = {
      success (title, text) { log('success', title, text) },
      error (title, text) { log('error', title, text) },
      warning (title, text) { log('warning', title, text) },
      info (title, text) { log('info', title, text) },
      log
    }
  }
}
