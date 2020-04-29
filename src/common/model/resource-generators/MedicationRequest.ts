import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'

export class MedicationRequest implements Generator {

  MedicationRequest () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.MedicationRequest> {
    const medicationRequest: fhir.MedicationRequest = { resourceType: 'MedicationRequest' } as fhir.MedicationRequest
    if (profile) medicationRequest.meta = { profile: [profile] }

    return new Promise<fhir.MedicationRequest>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('MedicationRequest.status')) {
        const item = resource.get('MedicationRequest.status')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) medicationRequest.status = targetValue
        } else {
          medicationRequest.status = String(item.value)
        }
      }
      if (resource.has('MedicationRequest.statusReason')) {
        const item = resource.get('MedicationRequest.statusReason')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) medicationRequest.statusReason = targetValue
        } else {
          medicationRequest.statusReason = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }
      if (resource.has('MedicationRequest.intent')) {
        const item = resource.get('MedicationRequest.intent')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) medicationRequest.intent = targetValue
        } else {
          medicationRequest.intent = String(item.value)
        }
      }
      if (resource.has('MedicationRequest.category')) {
        const item = resource.get('MedicationRequest.category')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          medicationRequest.category = [targetValue]
        } else {
          medicationRequest.category = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )]
        }
      }
      if (resource.has('MedicationRequest.medication[x].CodeableConcept')) {
        const item = resource.get('MedicationRequest.medication[x].CodeableConcept')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) medicationRequest.medicationCodeableConcept = targetValue
        } else {
          medicationRequest.medicationCodeableConcept = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }

      const medication = FHIRUtil.searchForReference(keys, resource, 'MedicationRequest.medication[x].Reference.')
      if (medication) medicationRequest.medicationReference = medication

      const subject = FHIRUtil.searchForReference(keys, resource, 'MedicationRequest.subject.Reference.')
      if (subject) medicationRequest.subject = subject

      const encounter = FHIRUtil.searchForReference(keys, resource, 'MedicationRequest.encounter.Reference.')
      if (encounter) medicationRequest.encounter = encounter

      const requester = FHIRUtil.searchForReference(keys, resource, 'MedicationRequest.requester.Reference.')
      if (requester) medicationRequest.requester = requester

      const performer = FHIRUtil.searchForReference(keys, resource, 'MedicationRequest.performer.Reference.')
      if (performer) medicationRequest.performer = performer

      const recorder = FHIRUtil.searchForReference(keys, resource, 'MedicationRequest.recorder.Reference.')
      if (recorder) medicationRequest.recorder = recorder

      if (resource.has('MedicationRequest.reasonCode')) {
        const item = resource.get('MedicationRequest.reasonCode')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          medicationRequest.reasonCode = [targetValue]
        } else {
          medicationRequest.reasonCode = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )]
        }
      }

      // TODO: Dosage

      medicationRequest.id = this.generateID(medicationRequest)

      if (medicationRequest.id) resolve(medicationRequest)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.MedicationRequest): string {
    let value: string = ''

    if (resource.status) value += resource.status
    if (resource.intent) value += resource.intent
    if (resource.subject?.reference) value += resource.subject.reference
    if (resource.medicationCodeableConcept?.coding && resource.medicationCodeableConcept.coding.length)
      value += resource.medicationCodeableConcept.coding[0].code
    if (resource.medicationReference) value += resource.medicationReference.reference

    return FHIRUtil.hash(value)
  }

}
