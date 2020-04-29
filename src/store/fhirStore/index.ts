import { FhirService } from '@/common/services/fhir.service'
import { environment } from '@/common/environment'
import StructureDefinition = fhir.StructureDefinition
import { FHIRUtil } from '@/common/utils/fhir-util'
import { ipcRenderer } from 'electron'
import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'

const fhirStore = {
  state: {
    resourceList: null,
    profileList: null,
    elementList: null,
    elementListFlat: null,
    currentResource: '',
    currentProfile: '',
    selectedFhirElements: [],
    fhirBase: '',
    fhirBaseVerificationStatus: '',
    fhirService: new FhirService(),
    outcomeDetails: [],
    conceptMapList: []
  },
  getters: {
    [types.Fhir.RESOURCE_LIST]: state => state.resourceList || [],
    [types.Fhir.PROFILE_LIST]: state => state.profileList || [],
    [types.Fhir.ELEMENT_LIST]: state => state.elementList || [],
    [types.Fhir.ELEMENT_LIST_FLAT]: state => state.elementListFlat || [],
    [types.Fhir.CURRENT_RESOURCE]: state => state.currentResource || '',
    [types.Fhir.CURRENT_PROFILE]: state => state.currentProfile || '',
    [types.Fhir.SELECTED_FHIR_ELEMENTS]: state => state.selectedFhirElements || [],
    [types.Fhir.FHIR_BASE]: state => state.fhirBase,
    [types.Fhir.FHIR_SERVICE]: state => state.fhirService,
    [types.Fhir.OUTCOME_DETAILS]: state => state.outcomeDetails || [],
    [types.Fhir.FHIR_BASE_VERIFICATION_STATUS]: state => state.fhirBaseVerificationStatus,
    [types.Fhir.CONCEPT_MAP_LIST]: state => state.conceptMapList
  },
  mutations: {
    [types.Fhir.SET_RESOURCE_LIST] (state, list) {
      state.resourceList = list
    },
    [types.Fhir.SET_PROFILE_LIST] (state, list) {
      state.profileList = list
    },
    [types.Fhir.SET_ELEMENT_LIST] (state, list) {
      state.elementList = [...list]
      state.elementListFlat = list?.length ? FHIRUtil.flatten([...list]) : []
    },
    [types.Fhir.SET_SELECTED_FHIR_ELEMENTS] (state, list) {
      state.selectedFhirElements = list
    },
    [types.Fhir.SET_CURRENT_RESOURCE] (state, value) {
      state.currentResource = value
    },
    [types.Fhir.SET_CURRENT_PROFILE] (state, value) {
      state.currentProfile = value
    },
    [types.Fhir.UPDATE_FHIR_BASE] (state, baseUrl: string) {
      state.fhirBase = baseUrl
      state.fhirService = new FhirService(baseUrl)
      localStorage.setItem('fhirBaseUrl', baseUrl)
    },
    [types.Fhir.SET_OUTCOME_DETAILS] (state, outcomeDetails: OutcomeDetail[]) {
      state.outcomeDetails = outcomeDetails
    },
    [types.Fhir.SET_FHIR_BASE_VERIFICATION_STATUS] (state, status: status) {
      state.fhirBaseVerificationStatus = status
    },
    [types.Fhir.SET_CONCEPT_MAP_LIST] (state, conceptMapList: fhir.ConceptMap[]) {
      state.conceptMapList = conceptMapList
    }
  },
  actions: {
    [types.Fhir.GET_RESOURCES] ({ commit, state }): Promise<boolean> {
      return new Promise((resolve, reject) => {
        state.fhirService.search('metadata', null)
          .then(res => {
            const resource = res.data as fhir.CapabilityStatement
            let resources: fhir.CapabilityStatementRestResource[] = []
            if (resource && resource.rest?.length && resource.rest[0].resource?.length) {
              resources = resource.rest[0].resource
            }
            commit(types.Fhir.SET_RESOURCE_LIST, resources.map(r => r.type) || [])
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
    [types.Fhir.GET_PROFILES_BY_RES] ({ commit, state }, resource: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        state.fhirService.search('StructureDefinition',
          {_summary: 'data', base: `${environment.hl7}/StructureDefinition/${resource}`}, true)
          .then(res => {
            const bundle = res.data as fhir.Bundle
            commit(types.Fhir.SET_PROFILE_LIST, bundle.entry?.map(e => {
              const structure = e.resource as fhir.StructureDefinition
              return {id: structure.id, title: structure.title, url: structure.url}
            }) || [])
            resolve(true)
          })
          .catch(err => reject(err) )
      })
    },
    [types.Fhir.GET_ELEMENTS] ({ commit, state }, { parameterName, profile }): Promise<boolean> {
      return new Promise((resolve, reject) => {
        FHIRUtil.parseElementDefinitions(parameterName, profile)
          .then(res => {
            const elementList = res[0]?.children || []
            commit(types.Fhir.SET_ELEMENT_LIST, elementList)
            resolve(true)
          })
          .catch(err => reject(err))
      })
    },
    [types.Fhir.VERIFY_FHIR] ({ state }): Promise<any> {
      return new Promise((resolve, reject) => {
        state.fhirService.search('metadata', {}, true)
          .then(res => {
            const metadata: fhir.CapabilityStatement = res.data
            if (metadata.fhirVersion) {
              if (environment.server.compatibleFhirVersions.includes(metadata.fhirVersion) || 1) {
                resolve(res)
              } else {
                reject(`FHIR version (${metadata.fhirVersion}) is not supported. FHIR version must be R4.`)
              }
            } else {
              throw Error()
            }
          })
          .catch(err => reject('Given url is not verified.'))
      })
    },
    [types.Fhir.GET_CONCEPT_MAPS] ({ commit, state }, noCache?: boolean): Promise<any> {
      return new Promise((resolve, reject) => {
        ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.ElectronStore.GET_ELECTRON_STORE, `${state.fhirBase}-ConceptMapList`)
        ipcRenderer.on(ipcChannels.ElectronStore.GOT_ELECTRON_STORE, (event, cached) => {
          if (!noCache && cached && !FHIRUtil.isEmpty(cached)) {
            commit(types.Fhir.SET_CONCEPT_MAP_LIST, cached)
            resolve(true)
          } else {
            state.fhirService.search('ConceptMap', {}, true)
              .then(res => {
                const bundle = res.data as fhir.Bundle
                if (bundle.entry?.length) {
                  const conceptMapList: fhir.ConceptMap[] = bundle.entry.map((bundleEntry: fhir.BundleEntry) => bundleEntry.resource) as fhir.ConceptMap[]
                  commit(types.Fhir.SET_CONCEPT_MAP_LIST, conceptMapList)

                  // electronStore.set(`${state.fhirBase}-ConceptMapList`, conceptMapList)
                  ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.ElectronStore.SET_ELECTRON_STORE, {key: `${state.fhirBase}-ConceptMapList`, value: conceptMapList})

                }
                resolve(true)
              })
              .catch(err => reject(err))
          }
          ipcRenderer.removeAllListeners(ipcChannels.ElectronStore.GOT_ELECTRON_STORE)
        })
      })
    },
    [types.Fhir.GET_DATA_TYPES] ({ state }, url: string): Promise<any> {
      return new Promise((resolve, reject) => {
        state.fhirService.search('StructureDefinition', {url}, true)
          .then(res => {
            const bundle = res.data as fhir.Bundle
            if (bundle.entry?.length) {
              const resource = bundle.entry[0].resource as fhir.StructureDefinition
              const list: fhir.ElementTree[] = []
              Promise.all(resource?.snapshot?.element.map((element: fhir.ElementDefinition) => {
                return new Promise(resolveElement => {
                  const parts = element.id?.split('.') || []
                  let tmpList = list
                  Promise.all(parts.map(part => {
                    return new Promise((resolveElementPart => {
                      let match = tmpList.findIndex(_ => _.label === part)
                      if (match === -1) {
                        match = 0
                        const item: fhir.ElementTree = {
                          value: element.id,
                          label: part,
                          definition: element.definition,
                          comment: element.comment,
                          short: element.short,
                          min: element.min,
                          max: element.max,
                          type: element.type.map(_ => {
                            const elementType: fhir.ElementTree = {value: _.code, label: _.code, type: [{value: _.code, label: _.code}], targetProfile: _.targetProfile}
                            if (_.code !== 'CodeableConcept' && _.code !== 'Coding' && _.code !== 'Reference' && environment.datatypes[_.code])
                              elementType.lazy = true
                            return FHIRUtil.cleanJSON(elementType)
                          }),
                          children: []
                        }
                        if (item.type?.length && item.type.length > 1 || (environment.datatypes[item.type[0].value]
                          && item.type[0].value !== 'CodeableConcept'
                          && item.type[0].value !== 'Coding'
                          && item.type[0].value !== 'Reference')) {
                          item.lazy = true
                        }
                        tmpList.push(item)
                        resolveElementPart()
                      }
                      tmpList = tmpList[match].children as fhir.ElementTree[]
                      resolveElementPart()
                    }))
                  })).then(() => resolveElement()).catch(() => resolveElement())
                })
              }) || [])
                .then(() => {
                  // electronStore.set(`${url}`, list)
                  // ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.ElectronStore.SET_ELECTRON_STORE, {key: `${url}`, value: list})
                  resolve(list)
                })
                .catch(() => reject([]))
            } else { resolve([]) }
          })
          .catch(() => reject([]))
      })
    },
    [types.Fhir.DELETE_ALL] ({ state }, resourceType: string): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        state.fhirService.deleteAll(resourceType)
          .then(_ => resolve(true))
          .catch(_ => reject(false))
      })
    }
  }
}

export default fhirStore
