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
    drawerOpen: true,
    drawerMiniState: true,
    curationStep: 1,
    mappingList: [],
    validationStatus: '',
    resources: new Map<string, fhir.Resource[]>(),
    transformList: [] as TransformListItem[],
    transformStatus: '',
    transformOutcomeDetails: [] as OutcomeDetail[]
  },
  getters: {
    drawerOpen: state => state.drawerOpen,
    drawerMiniState: state => state.drawerMiniState,
    curationStep: state => state.curationStep,
    mappingList: state => state.mappingList || [],
    validationStatus: state => state.validationStatus,
    resources: state => state.resources || new Map<string, fhir.Resource[]>(),
    transformList: state => state.transformList || [],
    transformStatus: state => state.transformStatus,
    transformOutcomeDetails: state => state.transformOutcomeDetails || []
  },
  mutations: {
    setDrawerOpen (state, value: boolean) {
      state.drawerOpen = value
    },
    setDrawerMiniState (state, value: boolean) {
      state.drawerMiniState = value
    },
    incrementStep (state) {
      state.curationStep += 1
    },
    decrementStep (state) {
      state.curationStep -= 1
    },
    setStep (state, value: number) {
      state.curationStep = value
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
