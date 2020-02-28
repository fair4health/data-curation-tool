import { DataTypeFactory } from './../factory/data-type-factory'
import { Resource } from './Resource'
import { environment } from './../../environment'

export class Medication extends Resource {

  static generate (resource: fhir.Medication, payload: ResourceGenerator.Payload): Promise<any> {

    const {value, sourceType, targetField, targetSubFields, fhirType} = payload

    return new Promise<any>((resolve, reject) => {
      switch (targetField) {
        case 'code':
          if (value)
            resource.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.ATC, value))
          resolve(true)
          break
        case 'ingredient':
          if (targetSubFields?.length) {
            if (targetSubFields[0].startsWith('item[x]')) {
              if (!resource.ingredient?.length) {
                resource.ingredient = []
              }
              const itemCodeableConcept: fhir.CodeableConcept = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.SNOMED, value))
              resource.ingredient.push({itemCodeableConcept})
            }
          }
          resolve(true)
          break
        default:
          resolve(true)
      }
    })
  }

}
