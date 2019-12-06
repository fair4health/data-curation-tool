import { FileSource, Sheet } from '@/common/file-source'

const fileSource = {
  namespaced: true,
  state: {
    fileSourceList: [],
    currentFile: null,
    selectedElements: []
  },
  getters: {
    sourceList: state => state.fileSourceList,
    currentFile: state => state.fileSourceList.find(f => f.path === state.currentFile?.path),
    sheets: state => state.currentFile?.sheets || [],
    currentSheet: state => state.currentFile?.currentSheet,
    selectedElements: state => state.selectedElements || [],
    fileByPath : state => filePath => state.fileSourceList.find(file => file.path === filePath)
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
    setSheetHeaders (state, headers: any) {
      state.currentFile.currentSheet.headers = headers
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
    setSelectedElements (state, list) {
      state.selectedElements = list
    }
  },
  actions: {
    initializeStore (state) {
      return new Promise((resolve, reject) => {
        const fileSourceList = localStorage.getItem('f4h-store-fileSourceList')
        if (fileSourceList) {
          Object.assign(state.state, JSON.parse(fileSourceList))
          resolve(true)
        }
        reject(false)
      })
    }
  }
}

export default fileSource
