
export class DataTypeFactory {

  static createCoding (system: string, code: string, display?: string): fhir.Coding {
    return { system, code, display } as fhir.Coding
  }

  static createCodeableConcept (coding: fhir.Coding): fhir.CodeableConcept {
    return { coding: [coding] as fhir.Coding[] }
  }

}
