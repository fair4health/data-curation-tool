import { BufferElement, FileSource, Sheet, SourceDataElement } from '@/common/model/file-source'
import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'

const fileStore = {
  state: {
    fileSourceList: [],
    currentFile: null,
    selectedHeaders: [],
    bufferSheetHeaders: [],
    savedRecords: null
  },
  getters: {
    [types.File.SOURCE_LIST]: state => state.fileSourceList,
    [types.File.CURRENT_FILE]: state => state.fileSourceList.find(f => f.path === state.currentFile?.path),
    [types.File.SHEETS]: state => state.currentFile?.sheets || [],
    [types.File.CURRENT_SHEET]: state => state.currentFile?.sheets.find(s => s.value === state.currentFile?.currentSheet?.value),
    [types.File.SELECTED_HEADERS]: state => state.selectedHeaders || [],
    [types.File.BUFFER_SHEET_HEADERS]: state => state.bufferSheetHeaders || [],
    [types.File.SAVED_RECORDS]: state => state.savedRecords || null
  },
  mutations: {
    [types.File.UPDATE_SOURCE_LIST] (state, sourceList: FileSource[]) {
      state.fileSourceList = sourceList
    },
    [types.File.SET_CURRENT_FILE] (state, file: FileSource | null) {
      state.currentFile = state.fileSourceList.find(f => f.path === file?.path) || null
    },
    [types.File.SET_SHEETS] (state, sheets: string[]) {
      if (state.currentFile) {
        const tmpSheet: Sheet[] = []
        for (const sheetName of sheets) {
          tmpSheet.push(new Sheet(sheetName))
        }
        state.currentFile.sheets = tmpSheet

        // Update current sheet according to new list
        state.currentFile.currentSheet = tmpSheet.find(s => s.value === state.currentFile?.currentSheet?.value) || null
      }
    },
    [types.File.SET_SHEET_HEADERS] (state, headers: SourceDataElement[]) {
      if (state.currentFile?.currentSheet) {
        if (state.currentFile.currentSheet.headers) {
          const currentSheet = state.currentFile.currentSheet
          state.currentFile.currentSheet.headers = headers.map((header: SourceDataElement) => {
            const existingHeader = currentSheet.headers.find(_ => _.value === header.value)
            if (existingHeader) {
              header = existingHeader
            }
            return header
          })
        } else {
          state.currentFile.currentSheet.headers = headers
        }
      }
    },
    [types.File.SET_CURRENT_SHEET] (state, sheet: Sheet | null) {
      if (state.currentFile) {
        state.currentFile.currentSheet = sheet
      }
    },
    [types.File.ADD_FILE] (state, filePath: string) {
      if (!state.fileSourceList.find(file => file.path === filePath)) {
        state.fileSourceList.push(new FileSource(filePath))
      }
    },
    [types.File.SET_SELECTED_HEADERS] (state, list: any[]) {
      state.selectedHeaders = list
    },
    [types.File.SET_BUFFER_SHEET_HEADERS] (state, list: BufferElement[]) {
      state.bufferSheetHeaders = list
    },
    [types.File.SETUP_BUFFER_SHEET_HEADERS] (state) {
      state.bufferSheetHeaders = state.currentFile.currentSheet?.headers?.filter(_ => _.value).map(_ => {
        return {type: _.type, value: _.value}
      })
    },
    [types.File.SET_SAVED_RECORDS] (state, value: store.SavedRecord[]) {
      state.savedRecords = value
    }
  },
  actions: {
    [types.File.INITIALIZE_STORE] ({commit, state}, data): Promise<boolean> {
      return new Promise((resolve, reject) => {
        if (data) {
          Object.assign(state, data)
          commit(types.File.SET_CURRENT_FILE, null)
          resolve(true)
        } else {
          reject(false)
        }
      })
    },
    [types.File.DESTROY_STORE] ({commit}): Promise<any> {
      return new Promise<any>(resolve => {
        commit(types.File.UPDATE_SOURCE_LIST, [])
        commit(types.File.SET_CURRENT_FILE, null)
        commit(types.File.SET_SELECTED_HEADERS, [])
        commit(types.File.SET_BUFFER_SHEET_HEADERS, [])
        resolve()
      })
    }
  }
}

export default fileStore
