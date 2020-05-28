import { IDBService } from '@/common/services/idb.service'
import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'

const iDBStore = {
  state: {
    iDbService: new IDBService()
  },
  actions: {
    [types.IDB.DELETE_RESOURCE] ({ state }, resourceType: string): Promise<any> {
      return new Promise((resolve, reject) => {
        state.iDbService.deleteResource(resourceType)
          .then(() => resolve(true))
          .catch(err => reject(err))
      })
    },
    [types.IDB.CLEAR_RESOURCES] ({ state }): Promise<any> {
      return new Promise((resolve, reject) => {
        state.iDbService.clearResources()
          .then(() => resolve(true))
          .catch(err => reject(err))
      })
    },
    [types.IDB.GET_SAVED_RESOURCES] ({ state }): Promise<any> {
      return new Promise((resolve, reject) => {
        state.iDbService.getResources()
          .then(_ => resolve(_))
          .catch(err => reject(err))
      })
    },
    [types.IDB.SAVE_RESOURCE] ({ state }, resource: any): Promise<any> {
      return new Promise((resolve, reject) => {
        state.iDbService.saveResource(resource)
          .then(() => resolve(true))
          .catch(err => reject(err))
      })
    }
  }
}

export default iDBStore
