import HmacSHA256 from 'crypto-js/hmac-md5'
import { FhirService } from './../services/fhir.service'
import { environment } from './../environment'
import { DataTypeFactory } from './../model/factory/data-type-factory'
import path from 'path'
import fs from 'fs'
import { remote } from 'electron'
import StructureDefinition = fhir.StructureDefinition;

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
   * If the element have a choice of more than one data type, it takes the form nnn[x]
   * Returns true if it is in the form of multi datatype
   * @param element
   */
  static isMultiDataTypeForm (element: string): boolean {
    return element.substr(element.length - 3) === '[x]'
  }

  /**
   * Filter the StructureDefinition resources from standard profiles-resources.json and save them into
   * tofhir-structure-definitions.json so that subsequent calls do not need to parse a very large file again and again.
   *
   * @return Return an array of #fhir.StructureDefinition objects from the base resource definition files.
   */
  static readStructureDefinitionsOfBaseResources (): fhir.StructureDefinition[] {
    let structureDefinitionsFilePath = localStorage.getItem('structure-definitions-file')

    if (structureDefinitionsFilePath === undefined || structureDefinitionsFilePath === null || !fs.existsSync(structureDefinitionsFilePath)) {
      const parsedZipPath = path.parse(environment.FHIRDefinitionsZipPath)
      const resourcesFilePath = path.join(remote.app.getPath('userData'), parsedZipPath.name, 'profiles-resources.json')
      structureDefinitionsFilePath = path.join(remote.app.getPath('userData'), parsedZipPath.name, 'tofhir-structure-definitions.json')

      const content = fs.readFileSync(resourcesFilePath)
      const bundle = JSON.parse(content.toString('utf-8')) as fhir.Bundle
      const structureDefinitionResources = bundle.entry.flatMap<StructureDefinition>(e => e.resource.resourceType === 'StructureDefinition' ? e.resource as StructureDefinition : [])
      fs.writeFileSync(structureDefinitionsFilePath, JSON.stringify(structureDefinitionResources))

      localStorage.setItem('structure-definitions-file', structureDefinitionsFilePath)

      return structureDefinitionResources
    }

    return JSON.parse(fs.readFileSync(structureDefinitionsFilePath).toString('utf-8')) as StructureDefinition[]
  }

  /**
   * Retrieve the #StructureDefinition of a given resource type from the base FHIR definitions.
   * @param resourceType
   */
  static getStructureDefinitionFromBaseResources (resourceType: string): Promise<StructureDefinition> {
    return new Promise((resolve, reject) => {
      const baseResourceDefinition = this.readStructureDefinitionsOfBaseResources().find(sd => sd.url.split('/').pop() === resourceType)
      if (baseResourceDefinition === undefined || baseResourceDefinition === null) {
        reject(`Base resource definition file does not include the resourceType: ${resourceType}`)
      }
      resolve(baseResourceDefinition)
    })
  }

  /**
   * Retrieve the profile definition from the given FHIR endpoint.
   * @param fhirService
   * @param profileUrl
   */
  static getStructureDefinitionOfProfile (fhirService: FhirService, profileUrl: string): Promise<StructureDefinition> {
    return new Promise((resolve, reject) => {
      const query = {}
      query['url'] = profileUrl

      fhirService.search('StructureDefinition', query, true)
        .then(res => {
          const bundle = res.data as fhir.Bundle
          if (bundle.entry?.length) {
            resolve(bundle.entry[0].resource as fhir.StructureDefinition)
          } else {
            reject(`Returned bundle from the StructureDefinition search endpoint does no include any entries for the profile: ${profileUrl}.`)
          }
        })
        .catch(() => reject(`Cannot invoke the search under StructureDefinition endpoint of the FHIR service for the profile: ${profileUrl}.`))
    })
  }

  /**
   * Parses elements of a StructureDefinition resource (StructureDefinition.snapshot.element)
   * @param fhirService
   * @param parameter - Search parameter
   * @param profileId
   */
  static parseElementDefinitions (fhirService: FhirService, parameter: string, profileId: string): Promise<any> {
    return new Promise((resolveParam, rejectParam) => {
      const promise = parameter === 'url' ? this.getStructureDefinitionOfProfile(fhirService, profileId) : this.getStructureDefinitionFromBaseResources(profileId)
      promise.then(resource => {
        const list: fhir.ElementTree[] = []
        Promise.all(resource?.snapshot?.element.map((element: fhir.ElementDefinition) => {
          return new Promise(resolveElement => {
            // Mark the id field as required field
            const idSplitted = element.id.split('.')
            if (idSplitted.length === 2 && idSplitted[1] === 'id') element.min = 1
            const parts = element.id?.split('.') || []
            let tmpList = list

            // Fixed code-system uri for code fields
            const fixedUri = element.fixedUri

            Promise.all(parts.map(part => {
              return new Promise((resolveElementPart => {
                let match = tmpList.findIndex(_ => _.label === part)
                if (match === -1) {
                  match = 0
                  const item: fhir.ElementTree = {
                    value: element.id,
                    label: part,
                    definition: element.definition,
                    comment: element.comment,
                    short: element.short,
                    min: element.min,
                    max: element.max,
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
                if (fixedUri) tmpList[match].fixedUri = fixedUri
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
      })
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

  /**
   * Removes the trailing slash in the url
   * @param url
   */
  static trimUrl (url: string): string {
    return (url || '').replace(/\/$/, '')
  }

  private static readonly secretKey: string = 'E~w*c`r8e?aetZeid]b$y+aIl&p4eNr*a'

}
