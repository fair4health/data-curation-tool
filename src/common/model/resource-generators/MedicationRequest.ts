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

      if (resource.has('MedicationRequest.id')) {
        medicationRequest.id = String(resource.get('MedicationRequest.id')?.value || '')
      }

      const medicationRequestIdentifier = keys.filter(_ => _.startsWith('MedicationRequest.identifier'))
      if (medicationRequestIdentifier.length) {
        const identifier: fhir.Identifier = {}
        if (resource.has('MedicationRequest.identifier.Identifier.system')) {
          identifier.system = String(resource.get('MedicationRequest.identifier.Identifier.system')?.value || '')
        }
        if (resource.has('MedicationRequest.identifier.Identifier.value')) {
          identifier.value = String(resource.get('MedicationRequest.identifier.Identifier.value')?.value || '')
        }

        medicationRequest.identifier = [identifier]
      }

      if (resource.has('MedicationRequest.status')) {
        medicationRequest.status = String(resource.get('MedicationRequest.status').value)
      }
      if (resource.has('MedicationRequest.statusReason')) {
        const item = resource.get('MedicationRequest.statusReason')
        medicationRequest.statusReason = DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )
      }
      if (resource.has('MedicationRequest.intent')) {
        medicationRequest.intent = String(resource.get('MedicationRequest.intent').value)
      }
      if (resource.has('MedicationRequest.category')) {
        const item = resource.get('MedicationRequest.category')
        medicationRequest.category = [DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )]
      }
      if (resource.has('MedicationRequest.medication[x].CodeableConcept')) {
        const item = resource.get('MedicationRequest.medication[x].CodeableConcept')
        medicationRequest.medicationCodeableConcept = DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )
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
        medicationRequest.reasonCode = [DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )]
      }

      // TODO: Dosage

      medicationRequest.id = this.generateID(medicationRequest)

      if (medicationRequest.id) resolve(medicationRequest)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.MedicationRequest): string {
    let value: string = ''

    if (resource.id) {
      value += resource.id
    } else {
      if (resource.status) value += resource.status
      if (resource.intent) value += resource.intent
      if (resource.subject?.reference) value += resource.subject.reference
      if (resource.medicationCodeableConcept?.coding && resource.medicationCodeableConcept.coding.length)
        value += resource.medicationCodeableConcept.coding[0].code
      if (resource.medicationReference) value += resource.medicationReference.reference
    }

    return FHIRUtil.hash(value)
  }

}
