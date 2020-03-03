import ElectronStore from 'electron-store'

const electronStore = new ElectronStore({
  serialize: value => JSON.stringify(value)
} as any)

export default electronStore
