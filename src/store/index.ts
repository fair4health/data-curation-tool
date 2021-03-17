import Vue from 'vue'
import Vuex from 'vuex'
import file from './fileStore'
import fhir from './fhirStore'
import terminology from './terminologyStore'
import iDB from './iDBStore'
import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
import { DataSourceType, DBConnectionOptions } from '@/common/model/data-source'
import Status from '@/common/Status'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    file,
    fhir,
    terminology,
    iDB
  },
  state: {
    drawerOpen: true,
    drawerMiniState: false,
    curationStep: 1,
    mappingList: [],
    validationStatus: '',
    resources: new Map<string, fhir.Resource[]>(),
    transformList: [] as TransformListItem[],
    transformStatus: '',
    transformOutcomeDetails: [] as OutcomeDetail[],
    dataSourceType: DataSourceType.FILE,
    dbConnectionStatus: Status.NONE,
    dbConnectionOptions: {
      dbType: 'postgres',
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: '',
      dbAuth: {value: 'none', label: 'None'}
    } as DBConnectionOptions
  },
  getters: {
    [types.DRAWER_OPEN]: state => state.drawerOpen,
    [types.DRAWER_MINI_STATE]: state => state.drawerMiniState,
    [types.CURATION_STEP]: state => state.curationStep,
    [types.MAPPING_LIST]: state => state.mappingList || [],
    [types.VALIDATION_STATUS]: state => state.validationStatus,
    [types.RESOURCES]: state => state.resources || new Map<string, fhir.Resource[]>(),
    [types.TRANSFORM_LIST]: state => state.transformList || [],
    [types.TRANSFORM_STATUS]: state => state.transformStatus,
    [types.TRANSFORM_OUTCOME_DETAILS]: state => state.transformOutcomeDetails || [],
    [types.DATA_SOURCE_TYPE]: state => state.dataSourceType,
    [types.DB_CONNECTION_STATUS]: state => state.dbConnectionStatus,
    [types.DB_CONNECTION_OPTIONS]: state => state.dbConnectionOptions
  },
  mutations: {
    [types.SET_DRAWER_OPEN] (state, value: boolean) {
      state.drawerOpen = value
    },
    [types.SET_DRAWER_MINI_STATE] (state, value: boolean) {
      state.drawerMiniState = value
    },
    [types.INCREMENT_STEP] (state) {
      state.curationStep += 1
    },
    [types.DECREMENT_STEP] (state) {
      state.curationStep -= 1
    },
    [types.SET_STEP] (state, value: number) {
      state.curationStep = value
    },
    [types.SET_MAPPING_LIST] (state, list: any) {
      state.mappingList = list
    },
    [types.SET_VALIDATION_STATUS] (state, status: status) {
      state.validationStatus = status
    },
    [types.SET_RESOURCES] (state, resources: Map<string, fhir.Resource[]>) {
      state.resources = resources
    },
    [types.SET_TRANSFORM_LIST] (state, list: TransformListItem[]) {
      state.transformList = list
    },
    [types.SET_TRANSFORM_STATUS] (state, status: status) {
      state.transformStatus = status
    },
    [types.SET_TRANSFORM_OUTCOME_DETAILS] (state, details: OutcomeDetail[]) {
      state.transformOutcomeDetails = details
    },
    [types.SET_DATA_SOURCE_TYPE] (state, type: DataSourceType) {
      state.dataSourceType = type
    },
    [types.SET_DB_CONNECTION_STATUS] (state, status: Status) {
      state.dbConnectionStatus = status
    },
    [types.SET_DB_CONNECTION_OPTIONS] (state, options: DBConnectionOptions) {
      state.dbConnectionOptions = options
    }
  },
  actions: {}
})
