import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { Resource } from './Resource'

export class Condition extends Resource {

  // TODO: Terminology binding
  // CodeableConcepts are static for dev

  static generate (resource: fhir.Condition, payload: ResourceGenerator.Payload): Promise<any> {

    const {value, sourceType, targetField, targetSubFields, fhirType} = payload

    return new Promise<any>((resolve, reject) => {
      if (!resource.meta?.profile) {
        resource.meta = {}
        resource.meta.profile = [environment.profiles.condition_uv_ips]
      }
      switch (targetField) {
        case 'clinicalStatus':
          resource.clinicalStatus = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/condition-clinical', 'active'))
          resolve(true)
          break
        case 'verificationStatus':
          resource.verificationStatus = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/condition-ver-status', 'confirmed'))
          resolve(true)
          break
        case 'category':
          resolve(true)
          break
        case 'severity':
          resource.severity = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('http://loinc.org', 'LA6751-7', 'Moderate'))
          resolve(true)
          break
        case 'code':
          if (value)
            resource.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('http://snomed.info/sct', value, value))
          resolve(true)
          break
        case 'subject':
          resource.subject = {reference: `Patient/${value}`} as fhir.Reference
          resolve(true)
          break
        case 'onset[x]:onsetDateTime':
          if (sourceType === 'Date') {
            let date = value
            if (!(value instanceof Date)) {
              date = new Date(value)
            }
            try {
              resource.onsetDateTime = date.getFullYear() + '-' +
                ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2)
            } catch (e) {
              reject(e)
            }
          }
          resolve(true)
          break
        case 'asserter':
          resource.asserter = {reference: `Practitioner/${value}`} as fhir.Reference
          resolve(true)
          break
        default:
          resolve(true)
      }
    })
  }

}
