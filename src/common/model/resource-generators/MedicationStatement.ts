import { DataTypeFactory } from './../factory/data-type-factory'
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

      if (resource.has('MedicationStatement.id')) {
        medicationStatement.id = String(resource.get('MedicationStatement.id')?.value || '')
      }
      if (resource.has('MedicationStatement.status')) {
        const item = resource.get('MedicationStatement.status')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) medicationStatement.status = targetValue
        } else {
          medicationStatement.status = String(item.value)
        }
      }
      if (resource.has('MedicationStatement.statusReason')) {
        const item = resource.get('MedicationStatement.statusReason')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) medicationStatement.statusReason = [targetValue]
        } else {
          medicationStatement.statusReason = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )]
        }
      }
      if (resource.has('MedicationStatement.category')) {
        const item = resource.get('MedicationStatement.category')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          medicationStatement.category = targetValue
        } else {
          medicationStatement.category = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }
      if (resource.has('MedicationStatement.medication[x].CodeableConcept')) {
        const item = resource.get('MedicationStatement.medication[x].CodeableConcept')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) medicationStatement.medicationCodeableConcept = targetValue
        } else {
          medicationStatement.medicationCodeableConcept = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }
      const medication = FHIRUtil.searchForReference(keys, resource, 'MedicationStatement.medication[x].Reference.')
      if (medication) medicationStatement.medicationReference = medication

      const subject = FHIRUtil.searchForReference(keys, resource, 'MedicationStatement.subject.Reference.')
      if (subject) medicationStatement.subject = subject

      const context = FHIRUtil.searchForReference(keys, resource, 'MedicationStatement.context.Reference.')
      if (context) medicationStatement.context = context

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

      const effectivePeriod = keys.filter(_ => _.startsWith('MedicationStatement.effective[x].Period'))
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

    if (resource.id) {
      value += resource.id
    } else {
      if (resource.status) value += resource.status
      if (resource.subject?.reference) value += resource.subject.reference
      if (resource.medicationCodeableConcept?.coding && resource.medicationCodeableConcept.coding.length)
        value += resource.medicationCodeableConcept.coding[0].code
      if (resource.medicationReference) value += resource.medicationReference.reference
      if (resource.effectiveDateTime) value += resource.effectiveDateTime
      if (resource.effectivePeriod?.start) value += resource.effectivePeriod.start
      if (resource.effectivePeriod?.end) value += resource.effectivePeriod.end
      if (resource.dosage?.length) value += JSON.stringify(resource.dosage[0])
    }

    return FHIRUtil.hash(value)
  }

}
