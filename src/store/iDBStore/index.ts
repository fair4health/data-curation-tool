import { IDBService } from '@/common/services/idb.service'
import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'

const iDBStore = {
  state: {
    iDbService: new IDBService()
  },
  actions: {
    [types.IDB.DELETE] ({ state }, resourceType: string): Promise<any> {
      return new Promise((resolve, reject) => {
        state.iDbService.delete(resourceType)
          .then(() => resolve(true))
          .catch(err => reject(err))
      })
    },
    [types.IDB.CLEAR_ALL] ({ state }): Promise<any> {
      return new Promise((resolve, reject) => {
        state.iDbService.clearAll()
          .then(() => resolve(true))
          .catch(err => reject(err))
      })
    },
    [types.IDB.GET] ({ state }, resourceType: string): Promise<any> {
      return new Promise((resolve, reject) => {
        state.iDbService.get(resourceType)
          .then(_ => resolve(_))
          .catch(err => reject(err))
      })
    },
    [types.IDB.GET_ALL] ({ state }): Promise<any> {
      return new Promise((resolve, reject) => {
        state.iDbService.getAll()
          .then(_ => resolve(_))
          .catch(err => reject(err))
      })
    },
    [types.IDB.SAVE] ({ state }, resource: any): Promise<any> {
      return new Promise((resolve, reject) => {
        state.iDbService.save(resource)
          .then(() => resolve(true))
          .catch(err => reject(err))
      })
    }
  }
}

export default iDBStore
