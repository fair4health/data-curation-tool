import axios, { AxiosInstance } from 'axios'
import i18n from '@/i18n'

export class TerminologyService {

  private client: AxiosInstance

  constructor () {}

  /**
   * Update the baseUrl of the client
   * @param url
   */
  setUrl (url: string) {
    this.client = axios.create({
      baseURL: url
    })
  }

  /**
   * Verifies Terminology Service CodeSystem endpoint
   */
  verify (): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.get('/CodeSystem/$metadata')
        .then(res => {
          const parameters: fhir.Parameters = res.data
          if (parameters.resourceType === 'Parameters') {
            resolve(res)
          } else {
            reject(i18n.t('ERROR.TERMINOLOGY_URL_NOT_VERIFIED'))
          }
        })
        .catch(err => reject(i18n.t('ERROR.TERMINOLOGY_URL_NOT_VERIFIED') + ` ${err}`))
    })
  }

  /**
   * Batch translation of the values according to the source and target system
   * Executes /ConceptMap/$translate operation
   * Returns batch-response in a bundle
   * @param body
   */
  translateBatch (body: store.ConceptMap[]): Promise<fhir.Bundle> {
    return new Promise((resolve, reject) => {
      const batchResource: fhir.Bundle = {
        resourceType: 'Bundle',
        type: 'batch',
        entry: []
      }
      for (const conceptMap of body) {
        const request: fhir.BundleEntryRequest = {
          method: 'POST',
          url: '/ConceptMap/$translate'
        }
        const resource: fhir.Parameters = {
          resourceType: 'Parameters',
          parameter: [{
            name: 'coding',
            valueCoding: {
              system: conceptMap.source,
              code: conceptMap.value
            }
          }]
        }
        if (conceptMap.target) {
          resource.parameter.push({
            name: 'targetsystem',
            valueUri: conceptMap.target
          })
        }
        batchResource.entry.push({
          resource,
          request
        })
      }
      this.client.post('/ConceptMap/$translate', batchResource)
        .then(res => resolve(res.data))
        .catch(err => reject(err))
    })
  }

  /**
   * Returns CodeSystem systems
   */
  getCodeSystems (): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.client.get('/CodeSystem/$metadata')
        .then(res => {
          const parameters: fhir.Parameters = res.data
          const codeSystemList: string[] = []

          parameters.parameter.forEach((_: fhir.ParametersParameter) => {
            if ((_.name === 'system' || _.name === 'organization') && _.valueCoding?.system) {
              codeSystemList.push(_.valueCoding.system)
            }
          })

          resolve(codeSystemList)
        })
        .catch(err => reject(err))
    })
  }

}
