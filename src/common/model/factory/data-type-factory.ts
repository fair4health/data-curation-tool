
export class DataTypeFactory {

  static createCoding (system: string, code: string, display?: string): fhir.Coding {
    return { system, code, display } as fhir.Coding
  }

  static createCodeableConcept (coding: fhir.Coding): fhir.CodeableConcept {
    return { coding: [coding] as fhir.Coding[] }
  }

  static createDateString (date: Date): string {
    return date.getFullYear() + '-' + ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2)
  }

  static createReference (ref: fhir.Reference): fhir.Reference {
    return {reference: ref.reference}
  }

  static createTiming () {

  }

}
