import { environment } from '../environment'
import { FhirClient } from 'ng-fhir/FhirClient'
import axios from 'axios'
import http from 'http'

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
      let url

      if (resource.meta?.profile?.length && resource.meta.profile[0])
        url = resource.resourceType + '/$validate?profile=' + resource.meta.profile[0]
      else
        url = resource.resourceType + '/$validate'

      const request: fhir.BundleEntryRequest = {
        method: 'POST',
        url
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

}
