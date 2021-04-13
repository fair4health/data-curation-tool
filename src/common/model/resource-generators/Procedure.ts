import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Procedure implements Generator {

  Procedure () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Procedure> {
    const procedure: fhir.Procedure = { resourceType: 'Procedure' } as fhir.Procedure
    if (profile) procedure.meta = { profile: [profile] }

    return new Promise<fhir.Procedure>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Procedure.id')) {
        procedure.id = String(resource.get('Procedure.id')?.value || '')
      }

      const _meta = keys.filter(_ => _.startsWith('Procedure.meta'))
      if (_meta.length) {
        const meta: fhir.Meta = {}
        if (resource.has('Procedure.meta.Meta.versionId')) {
          meta.versionId = String(resource.get('Procedure.meta.Meta.versionId')?.value || '')
        }
        if (resource.has('Procedure.meta.Meta.source')) {
          meta.source = String(resource.get('Procedure.meta.Meta.source')?.value || '')
        }
        if (resource.has('Procedure.meta.Meta.profile')) {
          meta.profile = [String(resource.get('Procedure.meta.Meta.profile')?.value || '')]
        }
        if (resource.has('Procedure.meta.Meta.security')) {
          const item = resource.get('Procedure.meta.Meta.security')
          meta.security = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        if (resource.has('Procedure.meta.Meta.tag')) {
          const item = resource.get('Procedure.meta.Meta.tag')
          meta.tag = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        procedure.meta = {...procedure.meta, ...meta}
      }

      const procedureIdentifier = keys.filter(_ => _.startsWith('Procedure.identifier'))
      if (procedureIdentifier.length) {
        const identifier: fhir.Identifier = {}
        if (resource.has('Procedure.identifier.Identifier.system')) {
          identifier.system = String(resource.get('Procedure.identifier.Identifier.system')?.value || '')
        }
        if (resource.has('Procedure.identifier.Identifier.value')) {
          identifier.value = String(resource.get('Procedure.identifier.Identifier.value')?.value || '')
        }

        procedure.identifier = [identifier]
      }

      if (resource.has('Procedure.instantiatesCanonical')) {
        procedure.instantiatesCanonical = [String(resource.get('Procedure.instantiatesCanonical')?.value || '')]
      }
      if (resource.has('Procedure.instantiatesUri')) {
        procedure.instantiatesUri = [String(resource.get('Procedure.instantiatesUri')?.value || '')]
      }

      const basedOn = FHIRUtil.searchForReference(keys, resource, 'Procedure.basedOn.Reference.')
      if (basedOn) procedure.basedOn = [basedOn]

      const partOf = FHIRUtil.searchForReference(keys, resource, 'Procedure.partOf.Reference.')
      if (partOf) procedure.partOf = [partOf]

      if (resource.has('Procedure.status')) {
        procedure.status = String(resource.get('Procedure.status').value)
      }
      if (resource.has('Procedure.statusReason')) {
        const item = resource.get('Procedure.statusReason')
        procedure.statusReason = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
      }
      if (resource.has('Procedure.category')) {
        const item = resource.get('Procedure.category')
        procedure.category = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
      }
      if (resource.has('Procedure.code')) {
        const item = resource.get('Procedure.code')
        procedure.code = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
      }

      const subject = FHIRUtil.searchForReference(keys, resource, 'Procedure.subject.Reference.')
      if (subject) procedure.subject = subject

      const encounter = FHIRUtil.searchForReference(keys, resource, 'Procedure.encounter.Reference.')
      if (encounter) procedure.encounter = encounter

      if (resource.has('Procedure.performed[x].dateTime')) {
        const item = resource.get('Procedure.performed[x].dateTime')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          procedure.performedDateTime = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Procedure.performed[x].string')) {
        procedure.performedString = String(resource.get('Procedure.performed[x].string')?.value || '')
      }
      const performedPeriod = keys.filter(_ => _.startsWith('Procedure.performed[x].Period'))
      if (performedPeriod.length) {
        const period: fhir.Period = {}
        if (resource.has('Procedure.performed[x].Period.start')) {
          const item = resource.get('Procedure.performed[x].Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Procedure.performed[x].Period.end')) {
          const item = resource.get('Procedure.performed[x].Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          procedure.performedPeriod = _period
        }
      }
      const performedAge = keys.filter(_ => _.startsWith('Procedure.performed[x].Age'))
      if (performedAge.length) {
        const age: fhir.Age = {}
        if (resource.has('Procedure.performed[x].Age.value')) {
          const item = resource.get('Procedure.performed[x].Age.value')
          age.value = Number(item.value)
        }
        if (resource.has('Procedure.performed[x].Age.comparator')) {
          const item = resource.get('Procedure.performed[x].Age.comparator')
          age.comparator = String(item.value)
        }
        if (resource.has('Procedure.performed[x].Age.unit')) {
          const item = resource.get('Procedure.performed[x].Age.unit')
          age.unit = String(item.value)
        }
        if (resource.has('Procedure.performed[x].Age.system')) {
          const item = resource.get('Procedure.performed[x].Age.system')
          age.system = String(item.value)
        }
        if (resource.has('Procedure.performed[x].Age.code')) {
          const item = resource.get('Procedure.performed[x].Age.code')
          age.code = String(item.value)
        }

        const _age = DataTypeFactory.createAge(age).toJSON()
        if (!FHIRUtil.isEmpty(_age)) {
          procedure.performedAge = _age
        }
      }
      const performedRange = keys.filter(_ => _.startsWith('Procedure.performed[x].Range'))
      if (performedRange.length) {
        const range: fhir.Range = {} as fhir.Range
        if (resource.has('Procedure.performed[x].Range.low')) {
          const item = resource.get('Procedure.performed[x].Range.low')
          range.low = { value: Number(item.value) }
        }
        if (resource.has('Procedure.performed[x].Range.high')) {
          const item = resource.get('Procedure.performed[x].Range.high')
          range.high = { value: Number(item.value) }
        }
      }

      const recorder = FHIRUtil.searchForReference(keys, resource, 'Procedure.recorder.Reference.')
      if (recorder) procedure.recorder = recorder

      const asserter = FHIRUtil.searchForReference(keys, resource, 'Procedure.asserter.Reference.')
      if (asserter) procedure.asserter = asserter

      const procedurePerformer = keys.filter(_ => _.startsWith('Procedure.performer'))
      if (procedurePerformer.length) {
        const performer: fhir.ProcedurePerformer = {} as fhir.ProcedurePerformer
        if (resource.has('Procedure.performer.function')) {
          const item = resource.get('Procedure.performer.function')
          performer.function = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
        }
        const actor = FHIRUtil.searchForReference(keys, resource, 'Procedure.performer.actor.Reference.')
        if (actor) performer.actor = actor
        const onBehalfOf = FHIRUtil.searchForReference(keys, resource, 'Procedure.performer.onBehalfOf.Reference.')
        if (onBehalfOf) performer.onBehalfOf = onBehalfOf

        procedure.performer = [performer]
      }

      const location = FHIRUtil.searchForReference(keys, resource, 'Procedure.location.Reference.')
      if (location) procedure.location = location

      if (resource.has('Procedure.reasonCode')) {
        const item = resource.get('Procedure.reasonCode')
        procedure.reasonCode = [DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})]
      }

      const reasonReference = FHIRUtil.searchForReference(keys, resource, 'Procedure.reasonReference.Reference.')
      if (reasonReference) procedure.reasonReference = [reasonReference]

      if (resource.has('Procedure.bodySite')) {
        const item = resource.get('Procedure.bodySite')
        procedure.bodySite = [DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})]
      }
      if (resource.has('Procedure.outcome')) {
        const item = resource.get('Procedure.outcome')
        procedure.outcome = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
      }

      const report = FHIRUtil.searchForReference(keys, resource, 'Procedure.report.Reference.')
      if (report) procedure.report = [report]

      if (resource.has('Procedure.complication')) {
        const item = resource.get('Procedure.complication')
        procedure.complication = [DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})]
      }

      const complicationDetail = FHIRUtil.searchForReference(keys, resource, 'Procedure.complicationDetail.Reference.')
      if (complicationDetail) procedure.complicationDetail = [complicationDetail]

      if (resource.has('Procedure.followUp')) {
        const item = resource.get('Procedure.followUp')
        procedure.followUp = [DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})]
      }

      const procedureFocalDevice = keys.filter(_ => _.startsWith('Procedure.focalDevice'))
      if (procedureFocalDevice.length) {
        const focalDevice: fhir.ProcedureFocalDevice = {} as fhir.ProcedureFocalDevice
        if (resource.has('Procedure.focalDevice.action')) {
          const item = resource.get('Procedure.focalDevice.action')
          focalDevice.action = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
        }
        const manipulated = FHIRUtil.searchForReference(keys, resource, 'Procedure.focalDevice.manipulated.Reference.')
        if (manipulated) focalDevice.manipulated = manipulated
        procedure.focalDevice = [focalDevice]
      }

      const usedReference = FHIRUtil.searchForReference(keys, resource, 'Procedure.usedReference.Reference.')
      if (usedReference) procedure.usedReference = [usedReference]

      if (resource.has('Procedure.usedCode')) {
        const item = resource.get('Procedure.usedCode')
        procedure.usedCode = [DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})]
      }

      procedure.id = this.generateID(procedure)

      if (procedure.id) resolve(procedure)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Procedure): string {
    let value: string = ''

    if (resource.id) {
      value += resource.id
    } else {
      if (resource.subject?.reference) value += resource.subject.reference
      if (resource.encounter?.reference) value += resource.encounter.reference
      if (resource.status) value += resource.status
      if (resource.code?.coding?.length) value += resource.code.coding[0].code
      if (resource.category?.coding?.length) value += resource.category.coding[0].code
      if (resource.complication?.length && resource.complication[0]?.coding?.length) value += resource.complication[0].coding[0].code
      if (resource.performedDateTime) value += resource.performedDateTime
    }

    return FHIRUtil.hash(value)
  }

}
