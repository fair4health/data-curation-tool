import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'

export class MedicationRequest implements Generator {

  MedicationRequest () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.MedicationRequest> {
    const medicationRequest: fhir.MedicationRequest = { resourceType: 'MedicationRequest' } as fhir.MedicationRequest
    if (profile) medicationRequest.meta = { profile: [profile] }

    return new Promise<fhir.MedicationRequest>((resolve, reject) => {

      if (resource.has('MedicationRequest.status')) { medicationRequest.status = 'active' }
      if (resource.has('MedicationRequest.intent')) { medicationRequest.intent = 'proposal' }
      if (resource.has('MedicationRequest.category')) {
        const value = String(resource.get('MedicationRequest.category')!.value)
        medicationRequest.category = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/medicationrequest-category', 'inpatient'))
      }
      if (resource.has('MedicationRequest.medication[x].CodeableConcept.coding')) {
        const item = resource.get('MedicationRequest.medication[x].CodeableConcept.coding')!
        medicationRequest.medicationCodeableConcept = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.ATC, String(item.value)))
      }
      if (resource.has('MedicationRequest.medication[x].Reference.reference')) {
        const item = resource.get('MedicationRequest.medication[x].Reference.reference')!
        medicationRequest.medicationReference = DataTypeFactory.createReference({reference: `Medication/${FHIRUtil.hash(String(item.value))}`})
      }
      if (resource.has('MedicationRequest.subject')) {
        medicationRequest.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('MedicationRequest.subject')!.value))}`})
      }
      if (resource.has('MedicationRequest.subject.reference')) {
        medicationRequest.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('MedicationRequest.subject.reference')!.value))}`})
      }
      if (resource.has('MedicationRequest.performer')) {
        medicationRequest.performer = DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(String(resource.get('MedicationRequest.performer')!.value))}`})
      }
      if (resource.has('MedicationRequest.recorder')) {
        medicationRequest.recorder = DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(String(resource.get('MedicationRequest.recorder')!.value))}`})
      }
      if (resource.has('MedicationRequest.encounter')) {
        medicationRequest.encounter = DataTypeFactory.createReference({reference: `Encounter/${FHIRUtil.hash(String(resource.get('MedicationRequest.encounter')!.value))}`})
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
