import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Condition implements Generator {

  Condition () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Condition> {
    const condition: fhir.Condition = { resourceType: 'Condition' } as fhir.Condition
    if (profile) condition.meta = { profile: [profile] }

    return new Promise<fhir.Condition>((resolve, reject) => {

      if (resource.has('Condition.clinicalStatus')) {
        condition.clinicalStatus = DataTypeFactory.createCodeableConcept(
        DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/condition-clinical', 'resolved'))
      }
      if (resource.has('Condition.verificationStatus')) {
        condition.verificationStatus = DataTypeFactory.createCodeableConcept(
        DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/condition-ver-status', 'confirmed'))
      }
      if (resource.has('Condition.category')) {
        // TODO: Terminology server binding
      }
      if (resource.has('Condition.severity')) {
        condition.severity = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.LOINC, 'LA6751-7', 'Moderate'))
      }
      if (resource.has('Condition.code')) {
        const value = String(resource.get('Condition.code')!.value)
        condition.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.SNOMED, value, value))
      }
      if (resource.has('Condition.subject.reference')) {
        condition.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('Condition.subject.reference')!.value))}`})
      }
      if (resource.has('Condition.onset[x]')) {
        const item = resource.get('Condition.onset[x]')!

        if (item.sourceType === 'Date') {
          let date = item.value
          if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
          try {

            condition.onsetDateTime = DataTypeFactory.createDateString(date)

          } catch (e) { log.error('Date insertion error.', e) }
        }
      }

      if (resource.has('Condition.abatement[x].dateTime')) {
        const item = resource.get('Condition.abatement[x].dateTime')!

        if (item.sourceType === 'Date') {
          let date = item.value
          if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
          condition.abatementDateTime = DataTypeFactory.createDateString(date)
        }
      }
      if (resource.has('Condition.abatement[x].string')) {
        const item = resource.get('Condition.abatement[x].string')!

        if (item.sourceType === 'Date') {
          let date = item.value
          if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
          condition.abatementDateTime = DataTypeFactory.createDateString(date)
        }
      }
      if (resource.has('Condition.abatement[x].Period.start')) {
        const item = resource.get('Condition.abatement[x].Period.start')!

        if (item.sourceType === 'Date') {
          let date = item.value
          if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
          if (!condition.abatementPeriod) { condition.abatementPeriod = {} }

          condition.abatementPeriod.start = DataTypeFactory.createDateString(date)
        }
      }
      if (resource.has('Condition.abatement[x].Period.end')) {
        const item = resource.get('Condition.abatement[x].Period.end')!

        if (item.sourceType === 'Date') {
          let date = item.value
          if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
          if (!condition.abatementPeriod) { condition.abatementPeriod = {} }

          condition.abatementPeriod.end = DataTypeFactory.createDateString(date)
        }
      }
      if (resource.has('Condition.abatement[x].Age.value')) {
        const item = resource.get('Condition.abatement[x].Age.value')!
        condition.abatementAge = { value: Number(item.value) }
      }
      if (resource.has('Condition.abatement[x].Age.code')) {
        const item = resource.get('Condition.abatement[x].Age.code')!
        condition.abatementAge = { code: String(item.value) }
      }

      if (resource.has('Condition.asserter')) {
        condition.asserter = DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(String(resource.get('Condition.asserter')!.value))}`})
      }
      if (resource.has('Condition.encounter')) {
        condition.encounter = DataTypeFactory.createReference({reference: `Encounter/${FHIRUtil.hash(String(resource.get('Condition.encounter')!.value))}`})
      }

      condition.id = this.generateID(condition)

      if (condition.id) resolve(condition)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Condition): string {
    let value: string = ''

    if (resource.subject?.reference) value += resource.subject.reference
    if (resource.code?.coding && resource.code.coding.length) value += resource.code.coding[0].code
    if (resource.onsetDateTime) value += resource.onsetDateTime
    if (resource.abatementDateTime) value += resource.abatementDateTime

    return FHIRUtil.hash(value)
  }

}
