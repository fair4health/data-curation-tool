export interface File {
  path: string
  extension: string
  label: string
  sheets?: Sheet[]
  currentSheet?: Sheet | null
}

export interface SourceDataElement {
  type?: string
  value?: string
  record?: Record[]
  conceptMap?: {id: string, name: string}
  defaultValue?: string
}

export interface Record {
  target?: TargetResource[]
  recordId: string
}

export interface TargetResource {
  resource: string
  profile: string
  value: string
  type?: string
  fixedUri?: string
}

export interface BufferElement {
  type?: string
  value?: string
  conceptMap?: {id: string, name: string}
  target?: TargetResource[]
  defaultValue?: string
}

export class FileSource implements File {
  path: string
  extension: string
  label: string
  sheets?: Sheet[] = []
  currentSheet?: Sheet | null = null

  constructor (path: string) {
    this.path = path
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
