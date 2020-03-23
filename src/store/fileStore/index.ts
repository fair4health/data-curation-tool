import {BufferElement, FileSource, Sheet, SourceDataElement} from '@/common/model/file-source'

const fileSource = {
  namespaced: true,
  state: {
    fileSourceList: [],
    currentFile: null,
    selectedElements: [],
    bufferSheetHeaders: [],
    savedRecords: null
  },
  getters: {
    sourceList: state => state.fileSourceList,
    currentFile: state => state.fileSourceList.find(f => f.path === state.currentFile?.path),
    sheets: state => state.currentFile?.sheets || [],
    currentSheet: state => state.currentFile?.sheets.find(s => s.value === state.currentFile?.currentSheet?.value),
    selectedElements: state => state.selectedElements || [],
    fileByPath : state => filePath => state.fileSourceList.find(file => file.path === filePath),
    bufferSheetHeaders: state => state.bufferSheetHeaders || [],
    savedRecords: state => state.savedRecords || null
  },
  mutations: {
    updateSourceList (state, sourceList: FileSource[]) {
      state.fileSourceList = sourceList
    },
    setCurrentFile (state, file: FileSource | null) {
      state.currentFile = state.fileSourceList.find(f => f.path === file?.path) || null
    },
    setSheets (state, sheets: string[]) {
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
    setSheetHeaders (state, headers: SourceDataElement[]) {
      if (state.currentFile) {
        if (state.currentFile.currentSheet?.headers) {
          state.currentFile.currentSheet.headers.map((header: SourceDataElement) => {
            let existingHeader = headers.find(_ => _.value === header.value)
            if (existingHeader) {
              existingHeader = header
            }
          })
        }

        state.currentFile.currentSheet.headers = headers
      }
    },
    setCurrentSheet (state, sheet: Sheet | null) {
      if (state.currentFile) {
        state.currentFile.currentSheet = sheet
      }
    },
    addFile (state, filePath: string) {
      if (!state.fileSourceList.find(file => file.path === filePath)) {
        state.fileSourceList.push(new FileSource(filePath))
      }
    },
    setSelectedElements (state, list: any[]) {
      state.selectedElements = list
    },
    setBufferSheetHeaders (state, list: BufferElement[]) {
      state.bufferSheetHeaders = list
    },
    setupBufferSheetHeaders (state) {
      state.bufferSheetHeaders = state.currentFile.currentSheet?.headers?.map(_ => ({type: _.type, value: _.value}))
    },
    setSavedRecords (state, value: store.SavedRecord[]) {
      state.savedRecords = value
    }
  },
  actions: {
    initializeStore ({commit, state}, data): Promise<boolean> {
      return new Promise((resolve, reject) => {
        if (data) {
          Object.assign(state, data)
          commit('setCurrentFile', null)
          resolve(true)
        } else {
          reject(false)
        }
      })
    },
    destroyStore ({commit}): Promise<any> {
      return new Promise<any>(resolve => {
        commit('updateSourceList', [])
        commit('setCurrentFile', null)
        commit('setSelectedElements', [])
        commit('setBufferSheetHeaders', [])
        resolve()
      })
    }
  }
}

export default fileSource
