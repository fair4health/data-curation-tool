import Vue from 'vue'
import Vuex from 'vuex'

import file from './fileSource'
import fhir from './fhir'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    file,
    fhir
  },
  state: {
    curationStep: 1,
    match: false
  },
  getters: {
    curationStep: state => state.curationStep,
    match: state => state.match
  },
  mutations: {
    incrementStep (state) {
      state.curationStep += 1
    },
    decrementStep (state) {
      state.curationStep -= 1
    },
    setMatch (state, value) {
      state.match = value
    }
  },
  actions: {}
})
