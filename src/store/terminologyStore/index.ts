import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
import { ipcRenderer } from 'electron'
import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
import { FHIRUtil } from '@/common/utils/fhir-util'
import { environment } from '@/common/environment'

const terminologyStore = {
  state: {
    terminologyBaseUrl: '',
    conceptMapList: [],
    tBaseVerificationStatus: '',
    codeSystemList: []
  },
  getters: {
    [types.Terminology.TERMINOLOGY_BASE_URL]: state => state.terminologyBaseUrl,
    [types.Terminology.CONCEPT_MAP_LIST]: state => state.conceptMapList || [],
    [types.Terminology.T_BASE_VERIFICATION_STATUS]: state => state.tBaseVerificationStatus,
    [types.Terminology.CODE_SYSTEM_LIST]: state => state.codeSystemList || []
  },
  mutations: {
    [types.Terminology.SET_CONCEPT_MAP_LIST] (state, conceptMapList: fhir.ConceptMap[]) {
      state.conceptMapList = conceptMapList
    },
    [types.Terminology.UPDATE_TERMINOLOGY_BASE] (state, baseUrl: string) {
      state.terminologyBaseUrl = baseUrl
      this._vm.$terminologyService.setUrl(baseUrl)
      localStorage.setItem('terminologyBaseUrl', baseUrl)
    },
    [types.Terminology.SET_T_BASE_VERIFICATION_STATUS] (state, status: status) {
      state.tBaseVerificationStatus = status
    },
    [types.Terminology.SET_CODE_SYSTEM_LIST] (state, codeSystemList: string[]) {
      state.codeSystemList = codeSystemList
    }
  },
  actions: {
    [types.Terminology.GET_CONCEPT_MAPS] ({ commit, state }, noCache?: boolean): Promise<any> {
      return new Promise((resolve, reject) => {
        ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.ElectronStore.GET_ELECTRON_STORE, `${state.terminologyBaseUrl}-ConceptMapList`)
        ipcRenderer.on(ipcChannels.ElectronStore.GOT_ELECTRON_STORE, (event, cached) => {
          if (!noCache && cached && !FHIRUtil.isEmpty(cached)) {
            commit(types.Terminology.SET_CONCEPT_MAP_LIST, cached)
            resolve(true)
          } else {
            this._vm.$terminologyService.search('ConceptMap', {}, true)
              .then(res => {
                const bundle = res.data as fhir.Bundle
                if (bundle.total > 0 && bundle.entry?.length) {
                  const conceptMapList: fhir.ConceptMap[] = bundle.entry.map((bundleEntry: fhir.BundleEntry) => bundleEntry.resource as fhir.ConceptMap)
                  commit(types.Terminology.SET_CONCEPT_MAP_LIST, conceptMapList)

                  ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.ElectronStore.SET_ELECTRON_STORE, {key: `${state.terminologyBaseUrl}-ConceptMapList`, value: conceptMapList})

                }
                resolve(true)
              })
              .catch(err => reject(err))
          }
          ipcRenderer.removeAllListeners(ipcChannels.ElectronStore.GOT_ELECTRON_STORE)
        })
      })
    },
    [types.Terminology.VERIFY_TERMINOLOGY] ({ commit }, baseUrl: string): Promise<any> {

      commit(types.Terminology.UPDATE_TERMINOLOGY_BASE, baseUrl)

      return new Promise((resolve, reject) => {
        this._vm.$terminologyService.search('metadata', {}, true)
          .then(res => {
            const metadata: fhir.CapabilityStatement = res.data
            if (metadata.fhirVersion) {
              if (environment.server.compatibleFhirVersions.includes(metadata.fhirVersion)) {
                resolve(res)
              } else {
                reject(`FHIR version (${metadata.fhirVersion}) is not supported. FHIR version must be R4.`)
              }
            } else {
              reject('FHIR version couldn\'t be detected for given url.')
            }
          })
          .catch(err => reject('Given terminology url is not verified.'))
      })
    },
    [types.Terminology.GET_CODE_SYSTEMS] ({ commit, state }, noCache?: boolean): Promise<any> {
      return new Promise((resolve, reject) => {
        ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.ElectronStore.GET_ELECTRON_STORE, `${state.terminologyBaseUrl}-CodeSystemList`)
        ipcRenderer.on(ipcChannels.ElectronStore.GOT_ELECTRON_STORE, (event, cached) => {
          if (!noCache && cached && !FHIRUtil.isEmpty(cached)) {
            commit(types.Terminology.SET_CODE_SYSTEM_LIST, cached)
            resolve(true)
          } else {
            this._vm.$terminologyService.search('CodeSystem', {}, true)
              .then(res => {
                const bundle = res.data as fhir.Bundle
                if (bundle.total > 0 && bundle.entry?.length) {
                  const codeSystemList: string[] = bundle.entry.map((bundleEntry: fhir.BundleEntry) => (bundleEntry.resource as fhir.CodeSystem).url)
                  commit(types.Terminology.SET_CODE_SYSTEM_LIST, codeSystemList)

                  ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.ElectronStore.SET_ELECTRON_STORE, {key: `${state.terminologyBaseUrl}-CodeSystemList`, value: codeSystemList})

                }
                resolve(true)
              })
              .catch(err => reject(err))
          }
          ipcRenderer.removeAllListeners(ipcChannels.ElectronStore.GOT_ELECTRON_STORE)
        })
      })
    }
  }
}

export default terminologyStore
