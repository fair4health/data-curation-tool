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
        if (medicationStatement.medicationCodeableConcept?.coding && medicationStatement.medicationCodeableConcept.coding.length)
          value += medicationStatement.medicationCodeableConcept.coding[0].code
        if (medicationStatement.medicationReference) value += medicationStatement.medicationReference.reference
        if (medicationStatement.effectiveDateTime) value += medicationStatement.effectiveDateTime
        if (medicationStatement.effectivePeriod?.start) value += medicationStatement.effectivePeriod.start
        if (medicationStatement.effectivePeriod?.end) value += medicationStatement.effectivePeriod.end
        break
      default:
        break
    }

    return FHIRUtil.hash(value || '')

  }

}
