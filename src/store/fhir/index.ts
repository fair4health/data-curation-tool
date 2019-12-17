import { FhirService } from '@/common/services/fhir.service'
import { urls } from '@/common/api'
import StructureDefinition = fhir.StructureDefinition
import { FHIRUtils } from '@/common/utils/fhir-util'

const fhirService = new FhirService()

const fhirStore = {
  namespaced: true,
  state: {
    resourceList: null,
    profileList: null,
    elementList: null,
    elementListFlat: null,
    currentResource: '',
    currentProfile: '',
    selectedElements: []
  },
  getters: {
    resourceList: state => state.resourceList || [],
    profileList: state => state.profileList || [],
    elementList: state => state.elementList || [],
    elementListFlat: state => state.elementListFlat || [],
    currentResource: state => state.currentResource || '',
    currentProfile: state => state.currentProfile || '',
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
      state.elementListFlat = list?.length ? FHIRUtils.flatten(list) : []
    },
    setSelectedElements (state, list) {
      state.selectedElements = list
    },
    setCurrentResource (state, value) {
      state.currentResource = value
    },
    setCurrentProfile (state, value) {
      state.currentProfile = value
    }
  },
  actions: {
    getResources ({ commit }): Promise<boolean> {
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
    getProfilesByRes ({ commit }, resource: string): Promise<boolean> {
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
    getElements ({ commit }, profileId: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        fhirService.search('StructureDefinition', {_id: profileId}, true)
          .then(bundle => {
            if (bundle.entry?.length) {
              const resource = bundle.entry[0].resource as fhir.StructureDefinition
              const list: fhir.ElementTree[] = []
              resource?.snapshot?.element.forEach((element) => {
                const parts = element?.id?.split('.') || []
                let part: any
                let tmpList = list
                part = parts.shift()
                while (part) {
                  let match = tmpList.findIndex(l => l.label === part)
                  if (match === -1) {
                    match = 0
                    tmpList.push({
                      value: element?.id,
                      label: part,
                      definition: element?.definition,
                      comment: element?.comment,
                      short: element?.short,
                      min: element?.min,
                      max: element?.max,
                      children: []
                    })
                  }
                  tmpList = tmpList[match].children as fhir.ElementTree[]
                  part = parts.shift()
                }
              })

              commit('setElementList', list)
            }
            resolve(true)
          })
          .catch(err => reject(err) )
      })
    }
  }
}

export default fhirStore
