import { DataTypeFactory } from './../factory/data-type-factory'
import { Resource } from './Resource'

export class Observation extends Resource {

  static generate (resource: fhir.Observation, payload: ResourceGenerator.Payload): Promise<any> {

    const {value, sourceType, targetField, targetSubFields, fhirType} = payload

    return new Promise<any>((resolve, reject) => {
      switch (targetField) {
        case 'status':
          // TODO: <Review>
          resource.status = value || 'final'
          break
        case 'effectiveDateTime':
          // TODO: <Review>
          if (sourceType === 'Date') {
            let date = value
            if (!(value instanceof Date)) {
              date = new Date(value)
            }
            try {
              resource.effectiveDateTime = date.getFullYear() + '-' +
                ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2)
            } catch (e) {
              reject(e)
            }
          }
          resolve(true)
          break
        case 'effectivePeriod':
          // TODO
          break
        case 'code':
          // TODO: <Review>
          if (value)
            resource.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('http://snomed.info/sct', value, value))
          resolve(true)
          break
        case 'subject':
          resource.subject = {reference: `Patient/${value}`} as fhir.Reference
          resolve(true)
          break
        case 'performer':
          if (resource.performer?.length) resource.performer = []
          resource.performer?.push({reference: `Practitioner/${value}`})
          resolve(true)
          break
        default:
          resolve(true)
      }
    })
  }

}
