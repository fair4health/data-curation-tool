import { FhirService } from '@/common/services/fhir.service'
import { environment } from '@/common/environment'
import StructureDefinition = fhir.StructureDefinition
import { FHIRUtil } from '@/common/utils/fhir-util'
import electronStore from '@/common/electron-store'

const fhirStore = {
  namespaced: true,
  state: {
    resourceList: null,
    profileList: null,
    elementList: null,
    elementListFlat: null,
    currentResource: '',
    currentProfile: '',
    selectedElements: [],
    fhirBase: '',
    fhirService: new FhirService(),
    outcomeDetails: []
  },
  getters: {
    resourceList: state => state.resourceList || [],
    profileList: state => state.profileList || [],
    elementList: state => state.elementList || [],
    elementListFlat: state => state.elementListFlat || [],
    currentResource: state => state.currentResource || '',
    currentProfile: state => state.currentProfile || '',
    selectedElements: state => state.selectedElements || [],
    fhirBase: state => state.fhirBase,
    fhirService: state => state.fhirService,
    outcomeDetails: state => state.outcomeDetails || []
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
      state.elementListFlat = list?.length ? FHIRUtil.flatten(list) : []
    },
    setSelectedElements (state, list) {
      state.selectedElements = list
    },
    setCurrentResource (state, value) {
      state.currentResource = value
    },
    setCurrentProfile (state, value) {
      state.currentProfile = value
    },
    updateFhirBase (state, baseUrl: string) {
      state.fhirBase = baseUrl
      state.fhirService = new FhirService(baseUrl)
      electronStore.set('fhirBase', baseUrl)
    },
    setOutcomeDetails (state, outcomeDetails: OutcomeDetail[]) {
      state.outcomeDetails = outcomeDetails
    }
  },
  actions: {
    getResources ({ commit, state }): Promise<boolean> {
      return new Promise((resolve, reject) => {
        state.fhirService.search('CapabilityStatement', null)
          .then(res => {
            const bundle = res.data as fhir.Bundle
            const resource = bundle.entry?.length ? bundle.entry[0].resource as fhir.CapabilityStatement : null
            if (resource && resource.rest?.length && resource.rest[0].resource?.length) {
              commit('setResourceList', resource.rest[0].resource.map(r => r.type) || [])
            }
            resolve(true)
          })
          .catch(err => reject(err) )
      })
    },
    getProfilesByRes ({ commit, state }, resource: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        state.fhirService.search('StructureDefinition',
          {_summary: 'data', base: `${environment.hl7}/StructureDefinition/${resource}`}, true)
          .then(res => {
            const bundle = res.data as fhir.Bundle
            commit('setProfileList', bundle.entry?.map(e => {
              const structure = e.resource as fhir.StructureDefinition
              return {id: structure.id, title: structure.title}
            }) || [])
            resolve(true)
          })
          .catch(err => reject(err) )
      })
    },
    getElements ({ commit, state }, profileId: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const cached = electronStore.get(`StructureDefinition-${profileId}`)
        if (cached) {
          commit('setElementList', cached)
          resolve(true)
        } else {
          state.fhirService.parseElementDefinitions('_id', profileId)
            .then(res => {
              commit('setElementList', res[0]?.children || [])
              electronStore.set(`StructureDefinition-${profileId}`, res[0]?.children || [])
              resolve(true)
            })
            .catch(err => reject(err))
        }
      })
    },
    searchResource ({ commit, state }, resourceType: string): Promise<any> {
      return new Promise((resolve, reject) => {
        state.fhirService.search(resourceType, {}, true)
          .then(res => resolve(res))
          .catch(err => reject(err))
      })
    }
  }
}

export default fhirStore
