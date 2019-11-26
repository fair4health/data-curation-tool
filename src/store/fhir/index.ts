import { FhirService } from '@/common/utils/fhir-util'
import { urls } from '@/common/api'
import StructureDefinition = fhir.StructureDefinition

const fhirService = new FhirService()

const fhirStore = {
  namespaced: true,
  state: {
    resourceList: null,
    profileList: null,
    elementList: null,
    selectedElements: []
  },
  getters: {
    resourceList: state => state.resourceList || [],
    profileList: state => state.profileList || [],
    elementList: state => state.elementList || [],
    selectedElements: state => state.selectedElements || [],
  },
  mutations: {
    setResourceList (state, list) {
      state.resourceList = list
    },
    setProfileList (state, list) {
      state.profileList = list
    },
    setElementList (state, list) {
      state.elementList = list
    },
    setSelectedElements (state, list) {
      state.selectedElements = list
    }
  },
  actions: {
    getResources ({ commit }) {
      return new Promise((resolve, reject) => {
        fhirService.search('CapabilityStatement', {})
          .then(bundle => {
            const resource = bundle.entry?.length ? bundle.entry[0].resource as fhir.CapabilityStatement : null
            if (resource && resource.rest?.length && resource.rest[0].resource?.length) {
              commit('setResourceList', resource.rest[0].resource.map(r => r.type) || [])
            }
            resolve(true)
          })
          .catch(err => reject(err) )
      })
    },
    getProfilesByRes ({ commit }, resource: string) {
      return new Promise((resolve, reject) => {
        fhirService.search('StructureDefinition',
          {_summary: 'data', base: `${urls.hl7}/StructureDefinition/${resource}`}, true)
          .then(bundle => {
            commit('setProfileList', bundle.entry?.map(e => {
              const structure = e.resource as fhir.StructureDefinition
              return {id: structure.id, title: structure.title}
            }) || [])
            resolve(true)
          })
          .catch(err => reject(err) )
      })
    },
    getElements ({ commit }, profileId: string) {
      return new Promise((resolve, reject) => {
        fhirService.search('StructureDefinition', {_id: profileId}, true)
          .then(bundle => {
            if (bundle.entry?.length) {
              const resource = bundle.entry[0].resource as fhir.StructureDefinition
              commit('setElementList', resource?.snapshot?.element.map(e => {
                const arr = e.id?.split('.')
                arr?.shift()
                return {value: arr?.join('.') || '', type: '-'}
              }).filter(v => v.value) || [])
            }
            resolve(true)
          })
          .catch(err => reject(err) )
      })
    }
  }
}

export default fhirStore
