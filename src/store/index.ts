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
    log: '',
    mappingList: [],
    validationStatus: '',
    resources: new Map<string, fhir.Resource[]>(),
    transformList: [] as TransformListItem[],
    transformStatus: '',
    transformOutcomeDetails: [] as OutcomeDetail[]
  },
  getters: {
    curationStep: state => state.curationStep,
    log: state => state.log,
    mappingList: state => state.mappingList || [],
    validationStatus: state => state.validationStatus,
    resources: state => state.resources || new Map<string, fhir.Resource[]>(),
    transformList: state => state.transformList || [],
    transformStatus: state => state.transformStatus,
    transformOutcomeDetails: state => state.transformOutcomeDetails || []
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
    },
    setMappingList (state, list: any) {
      state.mappingList = list
    },
    setValidationStatus (state, status: status) {
      state.validationStatus = status
    },
    setResources (state, resources: Map<string, fhir.Resource[]>) {
      state.resources = resources
    },
    setTransformList (state, list: TransformListItem[]) {
      state.transformList = list
    },
    setTransformStatus (state, status: status) {
      state.transformStatus = status
    },
    setTransformOutcomeDetails (state, details: OutcomeDetail[]) {
      state.transformOutcomeDetails = details
    }
  },
  actions: {}
})
