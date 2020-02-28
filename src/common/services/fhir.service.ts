import { environment } from '../environment'
import { FhirClient } from 'ng-fhir/FhirClient'
import axios from 'axios'
import http from 'http'
import electronStore from './../electron-store'

export class FhirService {

  config: any
  client: FhirClient

  constructor (baseUrl?: any) {
    if (baseUrl) environment.server.config.baseUrl = baseUrl
    this.config = environment.server.config
    this.client = new FhirClient(this.config)
  }

  /**
   * Returns resources searched by resourceType and query as Bundle
   * @param resourceType
   * @param query
   * @param all
   * @returns {Promise<any>}
   */
  search (resourceType: string, query: any, all?: boolean): Promise<any> {
    if (!all) {
      return this.client.search({type: resourceType, query})
    } else {
      const q = Object.assign({}, query)
      q['_summary'] = 'count'
      return new Promise((resolve, reject) => {
        this.client.search({type: resourceType, query: q})
          .then(data => {
            query['_count'] = data.data.total || '1'
            this.client.search({type: resourceType, query})
              .then(result => {
                resolve(result)
              })
              .catch(err => reject(err))
          })
          .catch(err => reject(err))
      })
    }
  }

  /**
   * Returns the resource with given reference ("ResourceType/id")
   * @param ref
   * @param noCache
   * @returns {Promise<any>}
   */
  getResource (ref: string, noCache?: boolean): Promise<any> {
    if (noCache) {
      return new Promise((resolve, reject) => {
        const [resourceType, id] = ref.split('\/')
        this.search(resourceType, {_id: id})
          .then(data => {
            try {
              data.data = data.data.entry[0].resource
              resolve(data)
            } catch (err) {
              reject(err)
            }
          })
          .catch(err => reject(err))
      })
    }
    return this.client.read({type: ref.split('/')[0], id: ref.split('/')[1]})
  }

  /**
   * Post resource with given reference ("Resource")
   * @param resource
   * @returns {Promise<any>}
   */
  postResource (resource: any): Promise<any> {
    return this.client.create({resource})
  }

  /**
   * Create resource with PUT request (with given id)
   * @param resource
   * @returns {Promise<any>}
   */
  putResource (resource: any): Promise<any> {
    return this.client.update({resource})
  }

  /**
   * Delete resource with given ResourceType and id (Reference)
   * @param resource
   * @returns {Promise<any>}
   */
  deleteResource (resource: fhir.Resource): Promise<any> {
    return this.client.delete({type: resource.resourceType, id: resource.id});
  }

  /**
   * Batch upload
   * @param resources
   * @param method
   */
  postBatch (resources: fhir.Resource[], method?: 'POST' | 'PUT'): Promise<any> {
    const httpAgent = new http.Agent({keepAlive: true})
    const transactionResource: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'batch',
      entry: []
    }
    for (const resource of resources) {
      // if (resource.resourceType === 'Patient' || resource.resourceType === 'Practitioner')
      //   method = 'PUT'
      const request: fhir.BundleEntryRequest = {
        method: method || 'POST',
        url: resource.resourceType + (method === 'PUT' ? `/${resource.id}` : '')
      }
      transactionResource.entry?.push({
        resource,
        request
      })
    }
    return axios.post(this.config.baseUrl, transactionResource, {headers: this.config.headers, httpAgent})
  }

  /**
   * Validates resources
   * @param resources
   */
  validate (resources: fhir.Resource[]): Promise<any> {
    const httpAgent = new http.Agent({keepAlive: true})
    const transactionResource: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'batch',
      entry: []
    }
    for (const resource of resources) {
      const request: fhir.BundleEntryRequest = {
        method: 'POST',
        url: `${resource.resourceType}/$validate?profile=${resource.meta?.profile![0]}`
      }
      transactionResource.entry?.push({
        resource,
        request
      })
    }
    return axios.post(this.config.baseUrl, transactionResource, {headers: this.config.headers, httpAgent})
  }

  /**
   * Just for DEV
   * Delete all resources
   * @param resourceType
   */
  deleteAll (resourceType: string) {
    return axios.delete(this.config.baseUrl + '/' + resourceType)
  }

  /**
   * Parses elements of a StructureDefinition resource (StructureDefinition.snapshot.element)
   * @param parameter - Search parameter
   * @param profileId
   */
  parseElementDefinitions (parameter: string, profileId: string): Promise<any> {
    const fhirService: FhirService = new FhirService(electronStore.get('fhirBase'))
    const query = {}
    query[parameter] = profileId
    return new Promise((resolveParam, rejectParam) => {
      fhirService.search('StructureDefinition', query, true)
        .then(res => {
          const bundle = res.data as fhir.Bundle
          if (bundle.entry?.length) {
            const resource = bundle.entry[0].resource as fhir.StructureDefinition
            const list: fhir.ElementTree[] = []
            Promise.all(resource?.snapshot?.element.map((element: fhir.ElementDefinition) => {
              return new Promise(resolveElement => {
                const parts = element?.id?.split('.') || []
                let tmpList = list
                Promise.all(parts.map(part => {
                  return new Promise((resolveElementPart => {
                    let match = tmpList.findIndex(l => l.label === part)
                    if (match === -1) {
                      match = 0
                      const item: fhir.ElementTree = {
                        value: element?.id,
                        label: part,
                        definition: element?.definition,
                        comment: element?.comment,
                        short: element?.short,
                        min: element?.min,
                        max: element?.max,
                        type: [],
                        children: []
                      }
                      Promise.all(element.type?.map((_: fhir.ElementDefinitionType) => {
                        return new Promise(resolveElementType => {
                          if (_.code && _.code[0] === _.code[0].toUpperCase() && environment.datatypes[_.code]) {

                            const cached = electronStore.get(`datatype-${_.code}`)
                            if (cached) {
                              item.type?.push(cached)
                              resolveElementType()
                            } else {
                              if (_.code === 'Reference') resolveElementType()
                              this.parseElementDefinitions('url', environment.datatypes[_.code])
                                .then((elementTreeList: fhir.ElementTree[]) => {
                                  elementTreeList.length ? item.type?.push({...elementTreeList[0]}) : {}
                                  electronStore.set(`datatype-${_.code}`, {...elementTreeList[0]})
                                  resolveElementType()
                                })
                                .catch(err => resolveElementType())
                            }
                          } else {
                            item.type?.push({value: _.code})
                            resolveElementType()
                          }
                        })
                      }) || []).then(() => resolveElementPart()).catch(() => resolveElementPart())
                      tmpList.push(item)
                    } else resolveElementPart()
                    tmpList = tmpList[match].children as fhir.ElementTree[]
                  }))
                })).then(() => resolveElement()).catch(() => resolveElement())
              })
            }) || [])
              .then(() => resolveParam(list))
              .catch(() => rejectParam([]))
          } else {
            resolveParam([])
          }
        })
        .catch(err => {
          rejectParam([])
        })
    })

  }

}
