import HmacSHA256 from 'crypto-js/hmac-md5'
import { FhirService } from './../services/fhir.service'
import { environment } from './../environment'
import { DataTypeFactory } from './../model/factory/data-type-factory'

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
                      let match = tmpList.findIndex(_ => _.label === part)
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
                          type: element.type.map(_ => {
                            const elementType: fhir.ElementTree = {value: _.code, label: _.code, type: [{value: _.code, label: _.code}], targetProfile: _.targetProfile}
                            if (_.code !== 'CodeableConcept' && _.code !== 'Coding' && _.code !== 'Reference' && environment.datatypes[_.code])
                              elementType.lazy = true
                            return FHIRUtil.cleanJSON(elementType)
                          }),
                          children: []
                        }
                        tmpList.push(item)
                        resolveElementPart()
                      }
                      tmpList = tmpList[match].children as fhir.ElementTree[]
                      resolveElementPart()
                    }))
                  })).then(() => resolveElement()).catch(() => resolveElement())
                })
              }) || [])
                .then(() => {
                  list[0].children.map(_ => {
                    if (_.type[0].value !== 'BackboneElement') _.children = []
                    else _.noTick = true
                    return _
                  })
                  resolveParam(list)
                })
                .catch(() => rejectParam([]))
            } else { resolveParam([]) }
          })
          .catch(() => rejectParam([]))
      } else rejectParam([])
    })
  }

  /**
   * Returns the code of target group element matching the source code as string
   * @param conceptMap
   * @param sourceCode
   */
  static getConceptMapTargetAsString (conceptMap: fhir.ConceptMap, sourceCode: string): string | null {
    if (conceptMap.group?.length && conceptMap.group[0].element.length) {
      const conceptMapGroupElement = conceptMap.group[0].element.find(element => element.code === sourceCode)
      if (conceptMapGroupElement?.target?.length) {
        return conceptMapGroupElement.target[0].code || null
      } else return null
    } else return null
  }

  /**
   * Returns the code and system of target group element matching the source code as CodeableConcept
   * @param conceptMap
   * @param sourceCode
   */
  static getConceptMapTargetAsCodeable (conceptMap: fhir.ConceptMap, sourceCode: string): fhir.CodeableConcept | null {
    const coding: fhir.Coding = FHIRUtil.getConceptMapTargetAsCoding(conceptMap, sourceCode)
    if (coding) {
      return DataTypeFactory.createCodeableConcept(coding).toJSON()
    }
    return null
    // if (conceptMap.group?.length && conceptMap.group[0].element.length) {
    //   const conceptMapGroupElement = conceptMap.group[0].element.find(element => element.code === sourceCode)
    //   if (conceptMapGroupElement?.target?.length) {
    //     const conceptMapGroupElementTarget = conceptMapGroupElement.target[0]
    //     return DataTypeFactory.createCodeableConcept({
    //       code: conceptMapGroupElementTarget.code,
    //       display: conceptMapGroupElementTarget.display,
    //       system: conceptMap.group[0].target
    //     }) as fhir.CodeableConcept
    //   } else return null
    // } else return null
  }

  /**
   * Returns the target group element matching the source code as Coding
   * @param conceptMap
   * @param sourceCode
   */
  static getConceptMapTargetAsCoding (conceptMap: fhir.ConceptMap, sourceCode: string): fhir.Coding | null {
    if (conceptMap.group?.length && conceptMap.group[0].element.length) {
      const conceptMapGroupElement = conceptMap.group[0].element.find(element => element.code === sourceCode)
      if (conceptMapGroupElement?.target?.length) {
        const conceptMapGroupElementTarget = conceptMapGroupElement.target[0]
        return DataTypeFactory.createCoding({
          code: conceptMapGroupElementTarget.code,
          display: conceptMapGroupElementTarget.display,
          system: conceptMap.group[0].target
        }).toJSON()
      } else return null
    } else return null
  }

  /**
   * Returns the Reference object according to the specified resource type
   * @param keyList
   * @param resource
   * @param phrase
   */
  static searchForReference (keyList: string[], resource: Map<string, BufferResource>, phrase: string): fhir.Reference | null {
    const key: string = keyList.find(_ => _.startsWith(phrase))
    if (key) {
      const resourceType: string = key.split('.').pop()
      const item = resource.get(key)
      return DataTypeFactory.createReference({reference: `${resourceType}/${FHIRUtil.hash(String(item.value))}`}).toJSON()
    } else {
      return null
    }
  }

  private static readonly secretKey: string = 'E~w*c`r8e?aetZeid]b$y+aIl&p4eNr*a'

}
