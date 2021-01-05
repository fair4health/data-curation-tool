import { DatabaseType } from 'typeorm'

export enum DataSourceType {
  FILE = 'file',
  DB = 'db'
}

export interface File {
  path: string
  extension: string
  label: string
  sheets?: Sheet[]
  currentSheet?: Sheet | null
}

export interface DBConnectionOptions {
  dbType: DatabaseType
  host: string
  port: number
  database: string
  username: string
  password: string
  dbAuth?: {value: string, label: string}
}

export interface SourceDataElement {
  type?: string
  value?: string
  record?: Record[]
  conceptMap?: SourceDataElementConceptMap
  defaultValue?: string
}

export interface SourceDataElementConceptMap {
  source: string
  target: string
}

export interface Record {
  target?: TargetResource[]
  recordId: string
}

export interface TargetResource {
  resource?: string
  profile?: string
  value: string
  type?: string
  fixedUri?: string
}

export interface BufferElement {
  type?: string
  value?: string
  conceptMap?: SourceDataElementConceptMap
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
