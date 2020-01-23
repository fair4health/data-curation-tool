import Vue from 'vue'
import Vuex from 'vuex'

import file from './fileStore'
import fhir from './fhirStore'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    file,
    fhir
  },
  state: {
    curationStep: 1,
    log: ''
  },
  getters: {
    curationStep: state => state.curationStep,
    log: state => state.log
  },
  mutations: {
    incrementStep (state) {
      state.curationStep += 1
    },
    decrementStep (state) {
      state.curationStep -= 1
    },
    updateLog (state, message) {
      state.log += message + '<br/>'
    }
  },
  actions: {}
})
