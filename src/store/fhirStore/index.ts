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
    fhirBaseVerificationStatus: '',
    fhirService: new FhirService(),
    outcomeDetails: [],
    conceptMapList: []
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
    outcomeDetails: state => state.outcomeDetails || [],
    fhirBaseVerificationStatus: state => state.fhirBaseVerificationStatus,
    conceptMapList: state => state.conceptMapList
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
      localStorage.setItem('fhirBaseUrl', baseUrl)
    },
    setOutcomeDetails (state, outcomeDetails: OutcomeDetail[]) {
      state.outcomeDetails = outcomeDetails
    },
    setFhirBaseVerificationStatus (state, status: status) {
      state.fhirBaseVerificationStatus = status
    },
    setConceptMapList (state, conceptMapList: fhir.ConceptMap[]) {
      state.conceptMapList = conceptMapList
    }
  },
  actions: {
    getResources ({ commit, state }): Promise<boolean> {
      return new Promise((resolve, reject) => {
        state.fhirService.search('metadata', null)
          .then(res => {
            const resource = res.data as fhir.CapabilityStatement
            let resources: fhir.CapabilityStatementRestResource[] = []
            if (resource && resource.rest?.length && resource.rest[0].resource?.length) {
              resources = resource.rest[0].resource
            }
            commit('setResourceList', resources.map(r => r.type) || [])
            const profileMap: Map<string, string> = new Map<string, string>()
            resources.flatMap(r => r.supportedProfile).filter(_ => !!_).map(_ => {
              const id = _!.split('/').pop()
              if (id) profileMap.set(id, _!)
            })
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
              return {id: structure.id, title: structure.title, url: structure.url}
            }) || [])
            resolve(true)
          })
          .catch(err => reject(err) )
      })
    },
    getElements ({ commit, state }, { parameterName, profile }): Promise<boolean> {
      return new Promise((resolve, reject) => {
        FHIRUtil.parseElementDefinitions(parameterName, profile)
          .then(res => {
            const elementList = res[0]?.children || []
            commit('setElementList', elementList)
            resolve(true)
          })
          .catch(err => reject(err))
      })
    },
    searchResource ({ commit, state }, resourceType: string): Promise<any> {
      return new Promise((resolve, reject) => {
        state.fhirService.search(resourceType, {}, true)
          .then(res => resolve(res))
          .catch(err => reject(err))
      })
    },
    getConceptMaps ({ commit, state }, noCache?: boolean): Promise<any> {
      return new Promise((resolve, reject) => {
        // const cached = JSON.parse(localStorage.getItem(`${state.fhirBase}-ConceptMapList`) || '{}')
        const cached = electronStore.get(`${state.fhirBase}-ConceptMapList`)
        if (!noCache && cached && !FHIRUtil.isEmpty(cached)) {
          commit('setConceptMapList', cached)
          resolve(true)
        } else {
          state.fhirService.search('ConceptMap', {}, true)
            .then(res => {
              const bundle = res.data as fhir.Bundle
              if (bundle.entry?.length) {
                const conceptMapList: fhir.ConceptMap[] = bundle.entry.map((bundleEntry: fhir.BundleEntry) => bundleEntry.resource) as fhir.ConceptMap[]
                commit('setConceptMapList', conceptMapList)
                electronStore.set(`${state.fhirBase}-ConceptMapList`, conceptMapList)
              }
              resolve(true)
            })
            .catch(err => reject(err))
        }
      })
    }
  }
}

export default fhirStore
