import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class MedicationStatement implements Generator {

  MedicationStatement () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.MedicationStatement> {
    const medicationStatement: fhir.MedicationStatement = { resourceType: 'MedicationStatement' } as fhir.MedicationStatement
    if (profile) medicationStatement.meta = { profile: [profile] }

    const dosage: fhir.DoseAndRateElement = {}

    return new Promise<fhir.MedicationStatement>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('MedicationStatement.status')) {
        const item = resource.get('MedicationStatement.status')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) medicationStatement.status = targetValue
        } else {
          medicationStatement.status = String(item.value)
        }
      }
      if (resource.has('MedicationStatement.statusReason') || resource.has('MedicationStatement.statusReason.CodeableConcept.coding')) {
        const item = resource.get('MedicationStatement.statusReason') || resource.get('MedicationStatement.statusReason.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) medicationStatement.statusReason = [targetValue]
        } else {
          medicationStatement.statusReason = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: environment.codesystems.SNOMED, code: String(item.value)})
          )]
        }
      }
      if (resource.has('MedicationStatement.category') || resource.has('MedicationStatement.category.CodeableConcept.coding')) {
        const item = resource.get('MedicationStatement.category') || resource.get('MedicationStatement.category.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          medicationStatement.category = targetValue
        } else {
          medicationStatement.category = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/medication-statement-category', code: String(item.value)})
          )
        }
      }
      if (resource.has('MedicationStatement.medication[x].CodeableConcept.coding')) {
        const item = resource.get('MedicationStatement.medication[x].CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) medicationStatement.medicationCodeableConcept = targetValue
        } else {
          medicationStatement.medicationCodeableConcept = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: environment.codesystems.ATC, code: String(item.value)})
          )
        }
      }
      if (resource.has('MedicationStatement.medication[x].Reference.reference')) {
        const item = resource.get('MedicationStatement.medication[x].Reference.reference')
        medicationStatement.medicationReference = DataTypeFactory.createReference({reference: `Medication/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('MedicationStatement.subject') || resource.has('MedicationStatement.subject.Reference.reference')) {
        const item = resource.get('MedicationStatement.subject') || resource.get('MedicationStatement.subject.Reference.reference')
        medicationStatement.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('MedicationStatement.context') || resource.has('MedicationStatement.context.Reference.reference')) {
        const item = resource.get('MedicationStatement.context') || resource.get('MedicationStatement.context.Reference.reference')
        medicationStatement.context = DataTypeFactory.createReference({reference: `Encounter/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('MedicationStatement.dateAsserted')) {

        const item = resource.get('MedicationStatement.dateAsserted')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
          medicationStatement.dateAsserted = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('MedicationStatement.effective[x].dateTime')) {

        const item = resource.get('MedicationStatement.effective[x].dateTime')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
          medicationStatement.effectiveDateTime = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }

      const effectivePeriod = keys.filter(_ => _.startsWith(''))
      if (effectivePeriod.length) {
        const period: fhir.Period = {}
        if (resource.has('MedicationStatement.effective[x].Period.start')) {
          const item = resource.get('MedicationStatement.effective[x].Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('MedicationStatement.effective[x].Period.end')) {
          const item = resource.get('MedicationStatement.effective[x].Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          medicationStatement.effectivePeriod = _period
        }
      }

      if (resource.has('MedicationStatement.dosage.doseAndRate.dose[x].Quantity.value')) {
        if (!dosage.doseQuantity) dosage.doseQuantity = {}

        dosage.doseQuantity.value = Number(resource.get('MedicationStatement.dosage.doseAndRate.dose[x].Quantity.value').value)
      }
      if (resource.has('MedicationStatement.dosage.doseAndRate.dose[x].Quantity.unit')) {
        if (!dosage.doseQuantity) dosage.doseQuantity = {}

        dosage.doseQuantity.unit = String(resource.get('MedicationStatement.dosage.doseAndRate.dose[x].Quantity.unit').value)
      }
      if (resource.has('MedicationStatement.dosage.doseAndRate.dose[x].Range.low')) {
        if (!dosage.doseRange) dosage.doseRange = {}

        dosage.doseRange.low = { value: Number(resource.get('MedicationStatement.dosage.doseAndRate.dose[x].Range.low').value) }
      }
      if (resource.has('MedicationStatement.dosage.doseAndRate.dose[x].Range.high')) {
        if (!dosage.rateRange) dosage.rateRange = {}

        dosage.rateRange.high = { value: Number(resource.get('MedicationStatement.dosage.doseAndRate.dose[x].Range.high').value) }
      }
      if (resource.has('MedicationStatement.dosage.doseAndRate.rate[x].Range.low')) {
        if (!dosage.rateRange) dosage.rateRange = {}

        dosage.rateRange.low = { value: Number(resource.get('MedicationStatement.dosage.doseAndRate.rate[x].Range.low').value) }
      }
      if (resource.has('MedicationStatement.dosage.doseAndRate.rate[x].Range.high')) {
        if (!dosage.rateRange) dosage.rateRange = {}

        dosage.rateRange.high = { value: Number(resource.get('MedicationStatement.dosage.doseAndRate.rate[x].Range.high').value) }
      }
      if (resource.has('MedicationStatement.dosage.doseAndRate.rate[x].Quantity.value')) {
        if (!dosage.rateQuantity) dosage.rateQuantity = {}

        dosage.rateQuantity.value = Number(resource.get('MedicationStatement.dosage.rateAndRate.rate[x].Quantity.value').value)
      }
      if (resource.has('MedicationStatement.dosage.doseAndRate.rate[x].Quantity.unit')) {
        if (!dosage.rateQuantity) dosage.rateQuantity = {}

        dosage.rateQuantity.unit = String(resource.get('MedicationStatement.dosage.rateAndRate.rate[x].Quantity.unit').value)
      }

      // TODO: Dosage

      if (!FHIRUtil.isEmpty(dosage)) medicationStatement.dosage = [{doseAndRate: [dosage]}]

      medicationStatement.id = this.generateID(medicationStatement)

      if (medicationStatement.id) resolve(medicationStatement)
      else reject('Id field is empty')
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
    if (resource.dosage?.length) value += JSON.stringify(resource.dosage[0])

    return FHIRUtil.hash(value)
  }

}
