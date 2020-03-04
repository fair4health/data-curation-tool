import { FHIRUtil } from './../../utils/fhir-util'

export class ResourceFactory {

  /**
   * Generates an id considering different criteria for each resource type
   * @param resource
   */
  static generateID (resource: fhir.Resource): string {

    // Value specifying which fields make the resource unique
    let value: string = ''

    switch (resource.resourceType) {
      case 'Patient':
        value += resource.id
        break
      case 'Practitioner':
        value += resource.id
        break
      case 'Condition':
        const condition: fhir.Condition = resource as fhir.Condition
        if (condition.subject?.reference) value += condition.subject.reference
        if (condition.code?.coding && condition.code.coding.length) value += condition.code.coding[0].code
        if (condition.onsetDateTime) value += condition.onsetDateTime
        if (condition.abatementDateTime) value += condition.abatementDateTime
        break
      case 'Medication':
        const medication: fhir.Medication = resource as fhir.Medication
        if (medication.code?.coding && medication.code.coding.length) value += medication.code?.coding![0].code
        // if (medication.ingredient?.length && medication.ingredient[0].itemCodeableConcept!.coding![0].code)
        //   value += medication.ingredient[0].itemCodeableConcept!.coding![0].code
        break
      case 'MedicationStatement':
        const medicationStatement: fhir.MedicationStatement = resource as fhir.MedicationStatement
        if (medicationStatement.status) value += medicationStatement.status
        if (medicationStatement.subject?.reference) value += medicationStatement.subject.reference
        if (medicationStatement.medicationCodeableConcept?.coding && medicationStatement.medicationCodeableConcept.coding.length)
          value += medicationStatement.medicationCodeableConcept.coding[0].code
        if (medicationStatement.medicationReference) value += medicationStatement.medicationReference.reference
        if (medicationStatement.effectiveDateTime) value += medicationStatement.effectiveDateTime
        if (medicationStatement.effectivePeriod?.start) value += medicationStatement.effectivePeriod.start
        if (medicationStatement.effectivePeriod?.end) value += medicationStatement.effectivePeriod.end
        break
      case 'MedicationRequest':
        const medicationRequest: fhir.MedicationRequest = resource as fhir.MedicationRequest
        if (medicationRequest.status) value += medicationRequest.status
        if (medicationRequest.intent) value += medicationRequest.intent
        if (medicationRequest.subject?.reference) value += medicationRequest.subject.reference
        if (medicationRequest.medicationCodeableConcept?.coding && medicationRequest.medicationCodeableConcept.coding.length)
          value += medicationRequest.medicationCodeableConcept.coding[0].code
        if (medicationRequest.medicationReference) value += medicationRequest.medicationReference.reference
        break
      case 'Observation':
        const observation: fhir.Observation = resource as fhir.Observation
        if (observation.status) value += observation.status
        if (observation.code?.coding && observation.code.coding.length) value += observation.code.coding[0].code
        if (observation.valueCodeableConcept?.coding?.length) value += observation.valueCodeableConcept.coding[0].code
        if (observation.valueQuantity?.value) value += observation.valueQuantity.value
        if (observation.subject?.reference) value += observation.subject.reference
        if (observation.effectiveInstant) value += observation.effectiveInstant
        if (observation.effectiveDateTime) value += observation.effectiveDateTime
        if (observation.effectivePeriod) value += String(observation.effectivePeriod?.start) + String(observation.effectivePeriod?.end)
        if (observation.effectiveTiming?.code?.coding?.length) value += observation.effectiveTiming.code.coding[0].code
        break
      default:
        break
    }

    return FHIRUtil.hash(value || '')

  }

}
