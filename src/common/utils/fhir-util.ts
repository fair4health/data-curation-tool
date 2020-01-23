export class FHIRUtils {

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

  static createCoding (system: string, code: string, display?: string): fhir.Coding {
    return { system, code, display } as fhir.Coding
  }

  static createCodeableConcept (coding: fhir.Coding): fhir.CodeableConcept {
    return { coding: [coding] as fhir.Coding[] }
  }

}
