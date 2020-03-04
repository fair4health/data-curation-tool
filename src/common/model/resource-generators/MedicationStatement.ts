import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class MedicationStatement implements Generator {

  MedicationStatement () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string): Promise<fhir.MedicationStatement> {
    const medicationStatement: fhir.MedicationStatement = { resourceType: 'MedicationStatement' } as fhir.MedicationStatement
    medicationStatement.meta = { profile: [environment.profiles[profile]] }

    return new Promise<fhir.MedicationStatement>((resolve, reject) => {

      if (resource.has('MedicationStatement.status')) { medicationStatement.status = 'active' }
      if (resource.has('MedicationStatement.category')) {
        const value = String(resource.get('MedicationStatement.category')!.value)
        medicationStatement.category = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/medication-statement-category', value))
      }
      if (resource.has('MedicationStatement.medication[x].CodeableConcept.coding')) {
        const item = resource.get('MedicationStatement.medication[x].CodeableConcept.coding')!
        medicationStatement.medicationCodeableConcept = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.ATC, String(item.value)))
      }
      if (resource.has('MedicationStatement.medication[x].Reference.reference')) {
        const item = resource.get('MedicationStatement.medication[x].Reference.reference')!
        medicationStatement.medicationReference = DataTypeFactory.createReference({reference: `Medication/${FHIRUtil.hash(String(item.value))}`})
      }
      if (resource.has('MedicationStatement.subject')) {
        medicationStatement.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('MedicationStatement.subject')!.value))}`})
      }
      if (resource.has('MedicationStatement.subject.reference')) {
        medicationStatement.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('MedicationStatement.subject.reference')!.value))}`})
      }
      if (resource.has('MedicationStatement.effective[x].dateTime')) {

        const item = resource.get('MedicationStatement.effective[x].dateTime')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            medicationStatement.effectiveDateTime = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('MedicationStatement.effective[x].Period.start')) {

        const item = resource.get('MedicationStatement.effective[x].Period.start')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            if (!medicationStatement.effectivePeriod) { medicationStatement.effectivePeriod = {} }

            medicationStatement.effectivePeriod.start = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('MedicationStatement.effective[x].Period.end')) {

        const item = resource.get('MedicationStatement.effective[x].Period.end')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            if (!medicationStatement.effectivePeriod) { medicationStatement.effectivePeriod = {} }

            medicationStatement.effectivePeriod.end = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }

      // TODO: Dosage

      medicationStatement.id = this.generateID(medicationStatement)

      resolve(medicationStatement)
    })
  }

  public generateID (resource: fhir.MedicationStatement): string {
    let value: string = ''

    if (resource.status) value += resource.status
    if (resource.subject?.reference) value += resource.subject.reference
    if (resource.medicationCodeableConcept?.coding && resource.medicationCodeableConcept.coding.length)
      value += resource.medicationCodeableConcept.coding[0].code
    if (resource.medicationReference) value += resource.medicationReference.reference
    if (resource.effectiveDateTime) value += resource.effectiveDateTime
    if (resource.effectivePeriod?.start) value += resource.effectivePeriod.start
    if (resource.effectivePeriod?.end) value += resource.effectivePeriod.end

    return FHIRUtil.hash(value)
  }

}
