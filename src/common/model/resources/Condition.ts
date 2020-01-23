import { FHIRUtils } from './../../utils/fhir-util'
import { environment } from './../../environment'
import { FhirService } from './../../services/fhir.service'

export class Condition {

  // TODO: Terminology binding
  // CodeableConcepts are static for dev

  static generate (resource: fhir.Condition, field: string, fieldType: string | undefined, subfields: string[], value: any): Promise<any> {
    const fhirService: FhirService = new FhirService()
    return new Promise<any>((resolve, reject) => {
      if (!resource.meta?.profile) {
        resource.meta = {}
        resource.meta.profile = [environment.profiles.condition_uv_ips]
      }
      switch (field) {
        case 'clinicalStatus':
          resource.clinicalStatus = FHIRUtils.createCodeableConcept(
            FHIRUtils.createCoding('http://terminology.hl7.org/CodeSystem/condition-clinical', 'active'))
          resolve(true)
          break
        case 'verificationStatus':
          resource.verificationStatus = FHIRUtils.createCodeableConcept(
            FHIRUtils.createCoding('http://terminology.hl7.org/CodeSystem/condition-ver-status', 'confirmed'))
          resolve(true)
          break
        case 'category':
          resolve(true)
          break
        case 'severity':
          resource.severity = FHIRUtils.createCodeableConcept(FHIRUtils.createCoding('http://loinc.org', 'LA6751-7', 'Moderate'))
          resolve(true)
          break
        case 'code':
          if (value)
            resource.code = FHIRUtils.createCodeableConcept(FHIRUtils.createCoding('http://snomed.info/sct', String(value), String(value)))
          resolve(true)
          break
        case 'subject':
          fhirService.search('Patient', {identifier: String(value)})
            .then(res => {
              const bundle: fhir.Bundle = res.data
              if (bundle.entry?.length) {
                const patient: fhir.Patient = bundle.entry[0].resource as fhir.Patient
                resource.subject = {reference: `Patient/${patient.id}`} as fhir.Reference
              }
              resolve(true)
            })
            .catch(err => {
              reject(err)
            })
          break
        case 'onset[x]:onsetDateTime':
          if (fieldType === 'Date') {
            if (!(value instanceof Date)) {
              value = new Date(String(value))
            }
            resource.onsetDateTime = value.getFullYear() + '-' +
              ('0' + (value.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + value.getUTCDate()).slice(-2)
          }
          resolve(true)
          break
        case 'asserter':
          fhirService.search('Practitioner', {identifier: String(value)})
            .then(res => {
              const bundle: fhir.Bundle = res.data
              if (bundle.entry?.length) {
                const practitioner: fhir.Practitioner = bundle.entry[0].resource as fhir.Practitioner
                resource.asserter = {reference: `Practitioner/${practitioner.id}`} as fhir.Reference
              }
              resolve(true)
            })
            .catch(err => {
              reject(err)
            })
          break
        default:
          resolve(true)
      }
    })
  }
}
