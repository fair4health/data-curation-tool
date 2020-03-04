import HmacSHA256 from 'crypto-js/hmac-md5'
import { FhirService } from './../services/fhir.service'
import { environment } from './../environment'

export class FHIRUtil {

  static hash (data: string): string {
    if (!data) return ''
    return HmacSHA256(data, this.secretKey).toString()
  }

  static jsonToQueryString (json: object): string {
    return '?' + Object.keys(json).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(json[key])).join('&')
  }

  static flatten (tree: fhir.ElementTree[]): fhir.ElementTree[] {
    return tree.reduce((acc: any, r: any) => {
      acc.push(r)
      if (r.children && r.children.length) {
        acc = acc.concat(this.flatten(r.children))
      }
      return acc
    }, [])
  }

  static cleanJSON (obj: any, clearIfEmpty?: boolean): any {
    const propNames = Object.getOwnPropertyNames(obj)
    for (const propName of propNames) {
      if (obj[propName] === null || obj[propName] === undefined
        || (Array.isArray(obj[propName]) && !obj[propName].length)
        || (typeof obj[propName] === 'string' && !obj[propName].length)
        || (typeof obj[propName] === 'object' && !Array.isArray(obj[propName]) && !Object.getOwnPropertyNames(obj[propName]).length)) {
        delete obj[propName]
      }
    }
    if (clearIfEmpty && Object.getOwnPropertyNames(obj).length === 0) {
      return null
    }
    return obj
  }

  static groupBy (list: any[], key: string): any {
    return list.reduce((acc, curr) => {
      (acc[curr[key]] = acc[curr[key]] || []).push(curr)
      return acc
    }, {})
  }

  static isEmpty (obj: object): boolean {
    return Object.entries(obj).length === 0 && obj.constructor === Object
  }

  /**
   * Parses elements of a StructureDefinition resource (StructureDefinition.snapshot.element)
   * @param parameter - Search parameter
   * @param profileId
   */
  static parseElementDefinitions (parameter: string, profileId: string): Promise<any> {
    return new Promise((resolveParam, rejectParam) => {
      const fhirBase = localStorage.getItem('fhirBaseUrl')
      if (fhirBase) {
        const fhirService: FhirService = new FhirService(fhirBase)
        const query = {}
        query[parameter] = profileId

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
                            if (_.code && (_.code[0] === _.code[0].toUpperCase()) && environment.datatypes[_.code]) {

                              const cached = JSON.parse(localStorage.getItem(`${fhirBase}-StructureDefinition-${_.code}`) || '{}')
                              if (cached && !this.isEmpty(cached)) {
                                item.type?.push(cached)
                                resolveElementType()
                              } else {
                                if (_.code === 'Reference') resolveElementType()
                                this.parseElementDefinitions('url', environment.datatypes[_.code])
                                  .then((elementTreeList: fhir.ElementTree[]) => {
                                    elementTreeList.length ? item.type?.push({...elementTreeList[0]}) : {}
                                    // electronStore.set(`datatype-${_.code}`, {...elementTreeList[0]})
                                    localStorage.setItem(`${fhirBase}-StructureDefinition-${_.code}`, JSON.stringify({...elementTreeList[0]}))
                                    resolveElementType()
                                  })
                                  .catch(err => resolveElementType())
                              }
                            } else {
                              item.type?.push({value: _.code})
                              resolveElementType()
                            }
                          })
                        }) || [])
                          .then(() => resolveElementPart())
                          .catch(() => resolveElementPart())
                        tmpList.push(item)
                      } else resolveElementPart()
                      tmpList = tmpList[match].children as fhir.ElementTree[]
                    }))
                  })).then(() => resolveElement()).catch(() => resolveElement())
                })
              }) || [])
                .then(() => resolveParam(list))
                .catch(() => rejectParam([]))
            } else { resolveParam([]) }
          })
          .catch(() => rejectParam([]))
      } else rejectParam([])
    })
  }


  private static readonly secretKey: string = 'E~w*c`r8e?aetZeid]b$y+aIl&p4eNr*a'

}
