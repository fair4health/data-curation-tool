import { DataTypeFactory } from './../factory/data-type-factory'
import { Resource } from './Resource'
import { FHIRUtil } from './../../utils/fhir-util'
import { environment } from './../../environment'

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
              resource.effectiveDateTime = DataTypeFactory.createDateString(date)
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
            resource.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.LOINC, value, value))
          resolve(true)
          break
        case 'subject':
          resource.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(value)}`})
          resolve(true)
          break
        case 'performer':
          if (resource.performer?.length) resource.performer = []
          resource.performer?.push(DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(value)}`}))
          resolve(true)
          break
        default:
          resolve(true)
      }
    })
  }

}
