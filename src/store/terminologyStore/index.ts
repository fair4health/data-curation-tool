import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
import i18n from '@/i18n'

const terminologyStore = {
  state: {
    terminologyBaseUrl: '',
    tBaseVerificationStatus: '',
    tBaseVerificationStatusDetail: '',
    codeSystemList: []
  },
  getters: {
    [types.Terminology.TERMINOLOGY_BASE_URL]: state => state.terminologyBaseUrl,
    [types.Terminology.T_BASE_VERIFICATION_STATUS]: state => state.tBaseVerificationStatus,
    [types.Terminology.T_BASE_VERIFICATION_STATUS_DETAIL]: state => state.tBaseVerificationStatusDetail,
    [types.Terminology.CODE_SYSTEM_LIST]: state => state.codeSystemList || []
  },
  mutations: {
    [types.Terminology.UPDATE_TERMINOLOGY_BASE] (state, baseUrl: string) {
      state.terminologyBaseUrl = baseUrl
      this._vm.$terminologyService.setUrl(baseUrl)
      localStorage.setItem('terminologyBaseUrl', baseUrl)
    },
    [types.Terminology.SET_T_BASE_VERIFICATION_STATUS] (state, status: status) {
      state.tBaseVerificationStatus = status
    },
    [types.Terminology.SET_T_BASE_VERIFICATION_STATUS_DETAIL] (state, details: string) {
      state.tBaseVerificationStatusDetail = details
    },
    [types.Terminology.SET_CODE_SYSTEM_LIST] (state, codeSystemList: string[]) {
      state.codeSystemList = codeSystemList
      localStorage.setItem(`${state.terminologyBaseUrl}-CodeSystemList`, JSON.stringify(codeSystemList))
    }
  },
  actions: {
    [types.Terminology.VERIFY_TERMINOLOGY] ({ commit }, baseUrl: string): Promise<any> {

      commit(types.Terminology.UPDATE_TERMINOLOGY_BASE, baseUrl)
      commit(types.Terminology.SET_CODE_SYSTEM_LIST, [])

      return new Promise((resolve, reject) => {
        this._vm.$terminologyService.verify()
          .then(() => resolve(true))
          .catch(err => reject(i18n.t('ERROR.TERMINOLOGY_URL_NOT_VERIFIED') + ` ${err}`))
      })
    },
    [types.Terminology.GET_CODE_SYSTEMS] ({ commit, state }, noCache?: boolean): Promise<any> {
      return new Promise((resolve, reject) => {
        const cached: string[] = JSON.parse(localStorage.getItem(`${state.terminologyBaseUrl}-CodeSystemList`)) || []
        if (!noCache && cached.length) {
          commit(types.Terminology.SET_CODE_SYSTEM_LIST, cached)
          resolve(true)
        } else {
          this._vm.$terminologyService.getCodeSystems()
            .then((codeSystemList: string[]) => {
              commit(types.Terminology.SET_CODE_SYSTEM_LIST, codeSystemList)
              resolve(true)
            })
            .catch(err => reject(err))
        }
      })
    }
  }
}

export default terminologyStore
