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

      if (resource.has('MedicationRequest.status')) {
        const item = resource.get('MedicationRequest.status')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) medicationRequest.status = targetValue
        } else {
          medicationRequest.status = String(item.value)
        }
      }
      if (resource.has('MedicationRequest.statusReason') || resource.has('MedicationRequest.statusReason.CodeableConcept.coding')) {
        const item = resource.get('MedicationRequest.statusReason') || resource.get('MedicationRequest.statusReason.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) medicationRequest.statusReason = targetValue
        } else {
          medicationRequest.statusReason = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-status-reason', code: String(item.value)})
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
      if (resource.has('MedicationRequest.category') || resource.has('MedicationRequest.category.CodeableConcept.coding')) {
        const item = resource.get('MedicationRequest.category') || resource.get('MedicationRequest.category.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          medicationRequest.category = [targetValue]
        } else {
          medicationRequest.category = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-category', code: String(item.value)})
          )]
        }
      }
      if (resource.has('MedicationRequest.medication[x].CodeableConcept.coding')) {
        const item = resource.get('MedicationRequest.medication[x].CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) medicationRequest.medicationCodeableConcept = targetValue
        } else {
          medicationRequest.medicationCodeableConcept = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: environment.codesystems.ATC, code: String(item.value)})
          )
        }
      }
      if (resource.has('MedicationRequest.medication[x].Reference.reference')) {
        const item = resource.get('MedicationRequest.medication[x].Reference.reference')
        medicationRequest.medicationReference = DataTypeFactory.createReference({reference: `Medication/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }

      if (resource.has('MedicationRequest.subject') || resource.has('MedicationRequest.subject.Reference.reference')) {
        const item = resource.get('MedicationRequest.subject') || resource.get('MedicationRequest.subject.Reference.reference')
        medicationRequest.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('MedicationRequest.encounter') || resource.has('MedicationRequest.encounter.Reference.reference')) {
        const item = resource.get('MedicationRequest.encounter') || resource.get('MedicationRequest.encounter.Reference.reference')
        medicationRequest.encounter = DataTypeFactory.createReference({reference: `Encounter/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('MedicationRequest.requester') || resource.has('MedicationRequest.requester.Reference.reference')) {
        const item = resource.get('MedicationRequest.requester') || resource.get('MedicationRequest.requester.Reference.reference')
        medicationRequest.requester = DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('MedicationRequest.performer') || resource.has('MedicationRequest.performer.Reference.reference')) {
        const item = resource.get('MedicationRequest.performer') || resource.get('MedicationRequest.performer.Reference.reference')
        medicationRequest.performer = DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('MedicationRequest.recorder') || resource.has('MedicationRequest.recorder.Reference.reference')) {
        const item = resource.get('MedicationRequest.recorder') || resource.get('MedicationRequest.recorder.Reference.reference')
        medicationRequest.recorder = DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('MedicationRequest.reasonCode') || resource.has('MedicationRequest.reasonCode.CodeableConcept.coding')) {
        const item = resource.get('MedicationRequest.reasonCode') || resource.get('MedicationRequest.reasonCode.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          medicationRequest.reasonCode = [targetValue]
        } else {
          medicationRequest.reasonCode = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-category', code: String(item.value)})
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
