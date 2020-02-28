import { DataTypeFactory } from './../factory/data-type-factory'
import { Resource } from './Resource'
import { FHIRUtil } from './../../utils/fhir-util'

export class Condition extends Resource {

  // TODO: Terminology binding
  // CodeableConcepts are static for dev

  static generate (resource: fhir.Condition, payload: ResourceGenerator.Payload): Promise<any> {

    const {value, sourceType, targetField, targetSubFields, fhirType} = payload

    return new Promise<any>((resolve, reject) => {
      switch (targetField) {
        case 'clinicalStatus':
          resource.clinicalStatus = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/condition-clinical', 'resolved'))
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
          resource.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(value)}`})
          resolve(true)
          break
        case 'onset[x]':
          if (sourceType === 'Date') {
            let date = value
            if (!(value instanceof Date)) {
              date = new Date(value)
            }
            try {
              resource.onsetDateTime = DataTypeFactory.createDateString(date)
            } catch (e) {
              reject(e)
            }
          }
          resolve(true)
          break
        case 'abatement[x]':
          try {
            if (sourceType === 'Date') {
              let date = value
              if (!(value instanceof Date)) {
                date = new Date(value)
              }
              if (fhirType === 'dateTime') {
                resource.abatementDateTime = DataTypeFactory.createDateString(date)
              } else if (fhirType?.startsWith('Period')) {
                const type = fhirType!.split('.')[1]
                if (!resource.abatementPeriod) {
                  resource.abatementPeriod = {}
                }
                resource.abatementPeriod[type] = DataTypeFactory.createDateString(date)
              }
            } else if (sourceType === 'Number') {
              if (fhirType?.startsWith('Age')) {
                resource.abatementAge = { value }
              }
            } else if (sourceType === 'Text') {
              // TODO: after binding terminology server
              if (fhirType?.startsWith('Age')) {
                resource.abatementAge = { code: value }
              }
            }
          } catch (e) { reject(e) }

          resolve(true)
          break
        case 'asserter':
          resource.asserter = DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(value)}`})
          resolve(true)
          break
        default:
          resolve(true)
      }
    })
  }

}
