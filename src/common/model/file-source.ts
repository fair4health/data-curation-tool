export interface File {
  path: string
  extension: string
  value: string
  label: string
  sheets?: Sheet[]
  currentSheet?: Sheet | null
}

export interface SourceDataElement {
  type?: string
  value?: string
  target?: Target[]
  group?: any
}

export interface Target {
  resource: string
  profile: string
  value: string
  type?: string
}

export class FileSource implements File {
  path: string
  extension: string
  value: string
  label: string
  sheets?: Sheet[] = []
  currentSheet?: Sheet | null = null

  constructor (path: string) {
    this.path = this.value = path
    this.label = path.split('\\').pop() || ''
    this.extension = this.label.split('.').pop() || ''
  }
}

export class Sheet {
  value: string
  label: string
  headers?: SourceDataElement[]

  constructor (name: string) {
    this.value = name
    this.label = name
  }
}
