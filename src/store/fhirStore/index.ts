import { FhirService } from '@/common/services/fhir.service'
import { environment } from '@/common/environment'
import StructureDefinition = fhir.StructureDefinition
import { FHIRUtil } from '@/common/utils/fhir-util'
import { ipcRenderer } from 'electron'

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
      state.elementList = [...list]
      state.elementListFlat = list?.length ? FHIRUtil.flatten([...list]) : []
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
    verifyFhir ({ state }): Promise<any> {
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
    getConceptMaps ({ commit, state }, noCache?: boolean): Promise<any> {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('to-background', 'get-electron-store', `${state.fhirBase}-ConceptMapList`)
        ipcRenderer.on('got-electron-store', (event, cached) => {
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

                  // electronStore.set(`${state.fhirBase}-ConceptMapList`, conceptMapList)
                  ipcRenderer.send('to-background', 'set-electron-store', {key: `${state.fhirBase}-ConceptMapList`, value: conceptMapList})

                }
                resolve(true)
              })
              .catch(err => reject(err))
          }
          ipcRenderer.removeAllListeners('got-electron-store')
        })
      })
    },
    getDataTypes ({ state }, url: string): Promise<any> {
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
                  // ipcRenderer.send('to-background', 'set-electron-store', {key: `${url}`, value: list})
                  resolve(list)
                })
                .catch(() => reject([]))
            } else { resolve([]) }
          })
          .catch(() => reject([]))
      })
    }
  }
}

export default fhirStore
