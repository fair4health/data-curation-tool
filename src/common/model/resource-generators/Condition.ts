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

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Condition.clinicalStatus') || resource.has('Condition.clinicalStatus.CodeableConcept.coding')) {
        const item = resource.get('Condition.clinicalStatus') || resource.get('Condition.clinicalStatus.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) condition.clinicalStatus = targetValue
        }
      }
      if (resource.has('Condition.verificationStatus') || resource.has('Condition.verificationStatus.CodeableConcept.coding')) {
        const item = resource.get('Condition.verificationStatus') || resource.get('Condition.verificationStatus.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) condition.verificationStatus = targetValue
        }
      }
      if (resource.has('Condition.category') || resource.has('Condition.category.CodeableConcept.coding')) {
        const item = resource.get('Condition.category') || resource.get('Condition.category.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          condition.category = [targetValue]
        } else {
          condition.category = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: String(item.value)})
          )]
        }
      }
      if (resource.has('Condition.severity') || resource.has('Condition.severity.CodeableConcept.coding')) {
        const item = resource.get('Condition.severity') || resource.get('Condition.severity.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) condition.severity = targetValue
        }
      }
      if (resource.has('Condition.code') || resource.has('Condition.code.CodeableConcept.coding')) {
        const item = resource.get('Condition.code') || resource.get('Condition.code.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) condition.code = targetValue
        } else {
          condition.code = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: environment.codesystems.SNOMED, code: String(item.value)})
          )
        }
      }
      if (resource.has('Condition.bodySite') || resource.has('Condition.bodySite.CodeableConcept.coding')) {
        const item = resource.get('Condition.bodySite') || resource.get('Condition.bodySite.CodeableConcept.coding')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))

          if (condition.bodySite?.length) condition.bodySite.push(targetValue)
          else condition.bodySite = [targetValue]
        } else {
          condition.bodySite = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: environment.codesystems.SNOMED, code: String(item.value)})
          )]
        }
      }
      if (resource.has('Condition.subject') || resource.has('Condition.subject.Reference.reference')) {
        const item = resource.get('Condition.subject') || resource.get('Condition.subject.Reference.reference')
        condition.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('Condition.encounter') || resource.has('Condition.encounter.Reference.reference')) {
        const item = resource.get('Condition.encounter') || resource.get('Condition.encounter.Reference.reference')
        condition.encounter = DataTypeFactory.createReference({reference: `Encounter/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('Condition.onset[x]') || resource.has('Condition.onset[x].dateTime')) {
        const item = resource.get('Condition.onset[x]') || resource.get('Condition.onset[x].dateTime')
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
      const abatementPeriod = keys.filter(_ => _.startsWith('Condition.abatement[x].Period'))
      if (abatementPeriod.length) {
        const period: fhir.Period = {}
        if (resource.has('Condition.abatement[x].Period.start')) {
          const item = resource.get('Condition.abatement[x].Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) date = new Date(String(item.value))
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Condition.abatement[x].Period.end')) {
          const item = resource.get('Condition.abatement[x].Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) date = new Date(String(item.value))
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          condition.abatementPeriod = _period
        }
      }
      const abatementAge = keys.filter(_ => _.startsWith('Condition.abatement[x].Age'))
      if (abatementAge.length) {
        const age: fhir.Age = {}
        if (resource.has('Condition.abatement[x].Age.value')) {
          const item = resource.get('Condition.abatement[x].Age.value')
          age.value = Number(item.value)
        }
        if (resource.has('Condition.abatement[x].Age.comparator')) {
          const item = resource.get('Condition.abatement[x].Age.comparator')
          age.comparator = String(item.value)
        }
        if (resource.has('Condition.abatement[x].Age.unit')) {
          const item = resource.get('Condition.abatement[x].Age.unit')
          age.unit = String(item.value)
        }
        if (resource.has('Condition.abatement[x].Age.system')) {
          const item = resource.get('Condition.abatement[x].Age.system')
          age.system = String(item.value)
        }
        if (resource.has('Condition.abatement[x].Age.code')) {
          const item = resource.get('Condition.abatement[x].Age.code')
          age.code = String(item.value)
        }

        const _age = DataTypeFactory.createAge(age).toJSON()
        if (!FHIRUtil.isEmpty(_age)) {
          condition.abatementAge = _age
        }
      }

      if (resource.has('Condition.recordedDate')) {
        const item = resource.get('Condition.recordedDate')!
        if (item.sourceType === 'Date') {
          let date = item.value
          if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
          try {
            condition.recordedDate = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
      }
      if (resource.has('Condition.recorder') || resource.has('Condition.recorder.Reference.reference')) {
        const item = resource.get('Condition.recorder') || resource.get('Condition.recorder.Reference.reference')
        condition.recorder = DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(String(item.value))}`}).toJSON()
      }
      if (resource.has('Condition.asserter') || resource.has('Condition.asserter.Reference.reference')) {
        const item = resource.get('Condition.asserter') || resource.get('Condition.asserter.Reference.reference')
        condition.asserter = DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(String(item.value))}`}).toJSON()
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
