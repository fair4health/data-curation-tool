import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Observation implements Generator {

  Observation () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Observation> {
    const observation: fhir.Observation = { resourceType: 'Observation' } as fhir.Observation
    if (profile) observation.meta = { profile: [profile] }

    return new Promise<fhir.Observation>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Observation.id')) {
        observation.id = String(resource.get('Observation.id')?.value || '')
      }
      if (resource.has('Observation.status')) {
        const item = resource.get('Observation.status')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) observation.status = targetValue
        } else {
          observation.status = String(item.value)
        }
      }
      if (resource.has('Observation.category')) {
        const item = resource.get('Observation.category')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          observation.category = [targetValue]
        } else {
          observation.category = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )]
        }
      }
      if (resource.has('Observation.code')) {
        const item = resource.get('Observation.code')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) observation.code = targetValue
        } else {
          observation.code = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }

      const subject = FHIRUtil.searchForReference(keys, resource, 'Observation.subject.Reference.')
      if (subject) observation.subject = subject

      const encounter = FHIRUtil.searchForReference(keys, resource, 'Observation.encounter.Reference.')
      if (encounter) observation.encounter = encounter

      if (resource.has('Observation.effective[x].dateTime')) {
        const item = resource.get('Observation.effective[x].dateTime')!
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          observation.effectiveDateTime = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Observation.effective[x].instant')) {
        const item = resource.get('Observation.effective[x].instant')!
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          observation.effectiveInstant = date.toISOString()
        } catch (e) { log.error('Date insertion error.', e) }
      }
      const effectivePeriod = keys.filter(_ => _.startsWith('Observation.effective[x].Period'))
      if (effectivePeriod.length) {
        const period: fhir.Period = {}
        if (resource.has('Observation.effective[x].Period.start')) {
          const item = resource.get('Observation.effective[x].Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) date = DataTypeFactory.createDate(String(item.value))
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Observation.effective[x].Period.end')) {
          const item = resource.get('Observation.effective[x].Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) date = DataTypeFactory.createDate(String(item.value))
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          observation.effectivePeriod = _period
        }
      }

      const effectiveTiming = keys.filter(_ => _.startsWith('Observation.effective[x].Timing'))
      if (effectiveTiming.length) {
        const timing: fhir.Timing = {}
        if (resource.has('Observation.effective[x].Timing.event')) {
          const item = resource.get('Observation.effective[x].Timing.event')!
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            timing.event = [DataTypeFactory.createDateString(date)]
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Observation.effective[x].Timing.code')) {
          const item = resource.get('Observation.effective[x].Timing.code')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) timing.code = targetValue
          } else {
            timing.code = DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
            )
          }
        }
        const effectingTimingRepeat = effectiveTiming.filter(_ => _.startsWith('Observation.effective[x].Timing.repeat'))
        if (effectingTimingRepeat.length) {
          if (!timing.repeat) timing.repeat = {}
          if (resource.has('Observation.effective[x].Timing.repeat.bounds[x]')) {
            // TODO
          }
          if (resource.has('Observation.effective[x].Timing.repeat.count')) {
            timing.repeat.count = Number(resource.get('Observation.effective[x].Timing.repeat.count').value)
          }
          if (resource.has('Observation.effective[x].Timing.repeat.countMax')) {
            timing.repeat.countMax = Number(resource.get('Observation.effective[x].Timing.repeat.countMax').value)
          }
          if (resource.has('Observation.effective[x].Timing.repeat.duration')) {
            timing.repeat.duration = Number(resource.get('Observation.effective[x].Timing.repeat.duration').value)
          }
          if (resource.has('Observation.effective[x].Timing.repeat.durationMax')) {
            timing.repeat.durationMax = Number(resource.get('Observation.effective[x].Timing.repeat.durationMax').value)
          }
          if (resource.has('Observation.effective[x].Timing.repeat.durationUnit')) {
            const item = resource.get('Observation.effective[x].Timing.repeat.durationUnit')
            if (item.conceptMap) {
              const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
              if (targetValue) timing.repeat.durationUnit = targetValue
            } else {
              timing.repeat.durationUnit = String(item.value)
            }
          }
          if (resource.has('Observation.effective[x].Timing.repeat.frequency')) {
            timing.repeat.frequency = Number(resource.get('Observation.effective[x].Timing.repeat.frequency').value)
          }
          if (resource.has('Observation.effective[x].Timing.repeat.frequencyMax')) {
            timing.repeat.frequencyMax = Number(resource.get('Observation.effective[x].Timing.repeat.frequencyMax').value)
          }
          if (resource.has('Observation.effective[x].Timing.repeat.period')) {
            timing.repeat.period = Number(resource.get('Observation.effective[x].Timing.repeat.period').value)
          }
          if (resource.has('Observation.effective[x].Timing.repeat.periodMax')) {
            timing.repeat.periodMax = Number(resource.get('Observation.effective[x].Timing.repeat.periodMax').value)
          }
          if (resource.has('Observation.effective[x].Timing.repeat.periodUnit')) {
            const item = resource.get('Observation.effective[x].Timing.repeat.periodUnit')
            if (item.conceptMap) {
              const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
              if (targetValue) timing.repeat.periodUnit = targetValue
            } else {
              timing.repeat.periodUnit = String(item.value)
            }
          }
          if (resource.has('Observation.effective[x].Timing.repeat.dayOfWeek')) {
            const item = resource.get('Observation.effective[x].Timing.repeat.dayOfWeek')
            if (item.conceptMap) {
              const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
              if (targetValue) timing.repeat.dayOfWeek = [targetValue]
            } else {
              timing.repeat.dayOfWeek = [String(item.value)]
            }
          }
          if (resource.has('Observation.effective[x].Timing.repeat.timeOfDay')) {
            timing.repeat.timeOfDay = [String(resource.get('Observation.effective[x].Timing.repeat.timeOfDay').value)]
          }
          if (resource.has('Observation.effective[x].Timing.repeat.when')) {
            const item = resource.get('Observation.effective[x].Timing.repeat.when')
            if (item.conceptMap) {
              const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
              if (targetValue) timing.repeat.when = [targetValue]
            } else {
              timing.repeat.when = [String(item.value)]
            }
          }
          if (resource.has('Observation.effective[x].Timing.repeat.offset')) {
            timing.repeat.offset = Number(resource.get('Observation.effective[x].Timing.repeat.offset').value)
          }
        }

        const _timing = DataTypeFactory.createTiming(timing).toJSON()
        if (!FHIRUtil.isEmpty(_timing)) {
          observation.effectiveTiming = _timing
        }
      }

      if (resource.has('Observation.issued')) {
        const item = resource.get('Observation.issued')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          observation.issued = date.toISOString()
        } catch (e) { log.error('Date insertion error.', e) }
      }

      const performer = FHIRUtil.searchForReference(keys, resource, 'Observation.performer.Reference.')
      if (performer) observation.performer = [performer]

      if (resource.has('Observation.value[x].string')) {
        observation.valueString = String(resource.get('Observation.value[x].string').value)
      }
      if (resource.has('Observation.value[x].boolean')) {
        observation.valueBoolean = !!resource.get('Observation.value[x].boolean').value
      }
      if (resource.has('Observation.value[x].dateTime')) {
        const item = resource.get('Observation.value[x].dateTime')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          observation.valueDateTime = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      const valuePeriod = keys.filter(_ => _.startsWith('Observation.value[x].Period'))
      if (valuePeriod.length) {
        const period: fhir.Period = {}
        if (resource.has('Observation.value[x].Period.start')) {
          const item = resource.get('Observation.value[x].Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Observation.value[x].Period.end')) {
          const item = resource.get('Observation.value[x].Period.end')!
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          observation.valuePeriod = _period
        }
      }
      if (resource.has('Observation.value[x].CodeableConcept')) {
        const item = resource.get('Observation.value[x].CodeableConcept')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) observation.valueCodeableConcept = targetValue
        } else {
          observation.valueCodeableConcept = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }
      if (resource.has('Observation.value[x].Range.low')) {
        const item = resource.get('Observation.value[x].Range.low')
        if (!observation.valueRange) observation.valueRange = {}
        // TODO: Quantity datatype: may need unit-value
        observation.valueRange.low = { value: Number(item.value) }
      }
      if (resource.has('Observation.value[x].Range.high')) {
        const item = resource.get('Observation.value[x].Range.high')
        if (!observation.valueRange) observation.valueRange = {}
        observation.valueRange.high = { value: Number(item.value) }
      }
      if (resource.has('Observation.value[x].Ratio.numerator')) {
        const item = resource.get('Observation.value[x].Ratio.numerator')
        if (!observation.valueRatio) observation.valueRatio = {}
        observation.valueRatio.numerator = { value: Number(item.value) }
      }
      if (resource.has('Observation.value[x].Ratio.denominator')) {
        const item = resource.get('Observation.value[x].Ratio.denominator')
        if (!observation.valueRatio) observation.valueRatio = {}
        observation.valueRatio.denominator = { value: Number(item.value) }
      }

      const valueQuantity = keys.filter(_ => _.startsWith('Observation.value[x].Quantity'))
      if (valueQuantity.length) {
        const quantity: fhir.Quantity = {}
        if (resource.has('Observation.value[x].Quantity.value')) {
          const item = resource.get('Observation.value[x].Quantity.value')
          quantity.value = Number(item.value)
        }
        if (resource.has('Observation.value[x].Quantity.comparator')) {
          const item = resource.get('Observation.value[x].Quantity.comparator')
          quantity.comparator = String(item.value)
        }
        if (resource.has('Observation.value[x].Quantity.unit')) {
          const item = resource.get('Observation.value[x].Quantity.unit')
          quantity.unit = String(item.value)
        }
        if (resource.has('Observation.value[x].Quantity.system')) {
          const item = resource.get('Observation.value[x].Quantity.system')
          quantity.system = String(item.value)
        }
        if (resource.has('Observation.value[x].Quantity.code')) {
          const item = resource.get('Observation.value[x].Quantity.code')
          quantity.code = String(item.value)
        }

        const _quantity = DataTypeFactory.createQuantity(quantity).toJSON()
        if (!FHIRUtil.isEmpty(_quantity)) {
          observation.valueQuantity = _quantity
        }
      }

      if (resource.has('Observation.dataAbsentReason')) {
        const item = resource.get('Observation.dataAbsentReason')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) observation.dataAbsentReason = targetValue
        } else {
          observation.dataAbsentReason = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }
      if (resource.has('Observation.interpretation')) {
        const item = resource.get('Observation.interpretation')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) observation.interpretation = [targetValue]
        } else {
          observation.interpretation = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )]
        }
      }
      if (resource.has('Observation.bodySite')) {
        const item = resource.get('Observation.bodySite')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) observation.bodySite = targetValue
        } else {
          observation.bodySite = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }
      if (resource.has('Observation.method')) {
        const item = resource.get('Observation.method')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) observation.method = targetValue
        } else {
          observation.method = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }

      const specimen = FHIRUtil.searchForReference(keys, resource, 'Observation.specimen.Reference.')
      if (specimen) observation.specimen = specimen

      const device = FHIRUtil.searchForReference(keys, resource, 'Observation.device.Reference.')
      if (device) observation.device = device

      const observationComponent = keys.filter(_ => _.startsWith('Observation.component'))
      if (observationComponent.length) {
        const component: fhir.ObservationComponent = {} as fhir.ObservationComponent
        if (resource.has('Observation.component.code')) {
          const item = resource.get('Observation.component.code')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) component.code = targetValue
          } else {
            component.code = DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
            )
          }
        }

        if (resource.has('Observation.component.dataAbsentReason')) {
          const item = resource.get('Observation.component.dataAbsentReason')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) component.dataAbsentReason = targetValue
          } else {
            component.dataAbsentReason = DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
            )
          }
        }
        if (resource.has('Observation.component.interpretation')) {
          const item = resource.get('Observation.component.interpretation')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) component.interpretation = [targetValue]
          } else {
            component.interpretation = [DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
            )]
          }
        }

        const _component = FHIRUtil.cleanJSON(component)
        if (!FHIRUtil.isEmpty(_component)) {
          observation.component = [_component]
        }
      }

      // TODO: Component value[x]

      observation.id = this.generateID(observation)

      if (observation.id) resolve(observation)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Observation): string {
    let value: string = ''

    if (resource.id) {
      value += resource.id
    } else {
      if (resource.status) value += resource.status
      if (resource.code?.coding && resource.code.coding.length) value += resource.code.coding[0].code
      if (resource.valueCodeableConcept?.coding?.length) value += resource.valueCodeableConcept.coding[0].code
      if (resource.valueQuantity?.value) value += resource.valueQuantity.value
      if (resource.subject?.reference) value += resource.subject.reference
      if (resource.effectiveInstant) value += resource.effectiveInstant
      if (resource.effectiveDateTime) value += resource.effectiveDateTime
      if (resource.effectivePeriod) value += String(resource.effectivePeriod?.start) + String(resource.effectivePeriod?.end)
      if (resource.effectiveTiming?.code?.coding?.length) value += resource.effectiveTiming.code.coding[0].code
      if (resource.effectiveTiming?.event?.length) value += String(resource.effectiveTiming.event[0])
      if (resource.effectiveTiming?.repeat) value += JSON.stringify(resource.effectiveTiming.repeat)
      if (resource.component?.length) value += JSON.stringify(resource.component)
    }

    return FHIRUtil.hash(value)
  }

}
