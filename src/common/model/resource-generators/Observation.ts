import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Observation implements Generator {

  Observation () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string): Promise<fhir.Observation> {
    const observation: fhir.Observation = { resourceType: 'Observation' } as fhir.Observation
    observation.meta = { profile: [environment.profiles[profile]] }

    const effectiveTiming: fhir.Timing = {}
    const components: fhir.ObservationComponent[] = []

    return new Promise<fhir.Observation>((resolve, reject) => {

      if (resource.has('Observation.status')) { observation.status = 'final' }
      if (resource.has('Observation.category')) {
        const value = String(resource.get('Observation.category')!.value)
        observation.category = [DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/observation-category', 'social-history'))]
      }
      if (resource.has('Observation.code')) {
        const value = String(resource.get('Observation.code')!.value)
        observation.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.LOINC, value, value))
      }
      if (resource.has('Observation.subject')) {
        observation.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('Observation.subject')!.value))}`})
      }
      if (resource.has('Observation.subject.reference')) {
        observation.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('Observation.subject.reference')!.value))}`})
      }

      if (resource.has('Observation.effective[x].dateTime')) {
        const item = resource.get('Observation.effective[x].dateTime')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            observation.effectiveDateTime = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Observation.effective[x].Period.start')) {
        const item = resource.get('Observation.effective[x].Period.start')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            if (!observation.effectivePeriod) { observation.effectivePeriod = {} }

            observation.effectivePeriod.start = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Observation.effective[x].Period.end')) {
        const item = resource.get('Observation.effective[x].Period.end')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            if (!observation.effectivePeriod) { observation.effectivePeriod = {} }

            observation.effectivePeriod.end = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Observation.effective[x].instant')) {
        const item = resource.get('Observation.effective[x].instant')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            observation.effectiveInstant = date.toISOString()
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }

      if (resource.has('Observation.effective[x].Timing.event')) {
        const item = resource.get('Observation.effective[x].Timing.event')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            effectiveTiming.event = [DataTypeFactory.createDateString(date)]
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Observation.effective[x].Timing.code')) {
        // TODO: https://www.hl7.org/fhir/valueset-timing-abbreviation.html
        // const item = resource.get('Observation.effective[x].Timing.code')!
        effectiveTiming.code = DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation', 'BID'))
      }
      if (resource.has('Observation.effective[x].Timing.repeat.bounds[x]')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}
        // TODO
      }
      if (resource.has('Observation.effective[x].Timing.repeat.count')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.count = Number(resource.get('Observation.effective[x].Timing.repeat.count')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.countMax')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.countMax = Number(resource.get('Observation.effective[x].Timing.repeat.countMax')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.duration')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.duration = Number(resource.get('Observation.effective[x].Timing.repeat.duration')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.durationMax')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.durationMax = Number(resource.get('Observation.effective[x].Timing.repeat.durationMax')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.durationUnit')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}
        // TODO: UnitsOfTime https://www.hl7.org/fhir/valueset-units-of-time.html
        effectiveTiming.repeat!.durationUnit = 'wk'
        // effectiveTiming.repeat!.durationUnit = String(resource.get('Observation.effective[x].Timing.repeat.durationUnit')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.frequency')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.frequency = Number(resource.get('Observation.effective[x].Timing.repeat.frequency')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.frequencyMax')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.frequencyMax = Number(resource.get('Observation.effective[x].Timing.repeat.frequencyMax')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.period')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.period = Number(resource.get('Observation.effective[x].Timing.repeat.period')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.periodMax')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.periodMax = Number(resource.get('Observation.effective[x].Timing.repeat.periodMax')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.periodUnit')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}
        // TODO: UnitsOfTime https://www.hl7.org/fhir/valueset-units-of-time.html
        effectiveTiming.repeat!.periodUnit = 'h'
        // effectiveTiming.repeat!.periodUnit = String(resource.get('Observation.effective[x].Timing.repeat.periodUnit')!.value)
      }
      if (resource.has('Observation.effective[x].Timing.repeat.dayOfWeek')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}
        // TODO: DayOfWeek https://www.hl7.org/fhir/valueset-days-of-week.html

        effectiveTiming.repeat!.dayOfWeek = [String(resource.get('Observation.effective[x].Timing.repeat.dayOfWeek')!.value)]
      }
      if (resource.has('Observation.effective[x].Timing.repeat.timeOfDay')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.timeOfDay = [String(resource.get('Observation.effective[x].Timing.repeat.timeOfDay')!.value)]
      }
      if (resource.has('Observation.effective[x].Timing.repeat.when')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}
        // TODO: EventTiming https://www.hl7.org/fhir/valueset-event-timing.html

        effectiveTiming.repeat!.when = [String(resource.get('Observation.effective[x].Timing.repeat.when')!.value)]
      }
      if (resource.has('Observation.effective[x].Timing.repeat.offset')) {
        if (!effectiveTiming.repeat) effectiveTiming.repeat = {}

        effectiveTiming.repeat!.offset = Number(resource.get('Observation.effective[x].Timing.repeat.offset')!.value)
      }

      if (resource.has('Observation.issued')) {
        const item = resource.get('Observation.issued')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            observation.issued = date.toISOString()
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }

      if (resource.has('Observation.value[x].string')) {
        observation.valueString = String(resource.get('Observation.value[x].string')!.value)
      }
      if (resource.has('Observation.value[x].boolean')) {
        observation.valueBoolean = !!resource.get('Observation.value[x].boolean')!.value
      }
      if (resource.has('Observation.value[x].dateTime')) {
        const item = resource.get('Observation.value[x].dateTime')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            observation.valueDateTime = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Observation.value[x].Period.start')) {
        const item = resource.get('Observation.value[x].Period.start')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            if (!observation.valuePeriod) { observation.valuePeriod = {} }

            observation.valuePeriod.start = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Observation.value[x].Period.end')) {
        const item = resource.get('Observation.value[x].Period.end')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            if (!observation.valuePeriod) { observation.valuePeriod = {} }

            observation.valuePeriod.end = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Observation.value[x].CodeableConcept.coding')) {
        const item = resource.get('MedicationRequest.medication[x].CodeableConcept.coding')!
        observation.valueCodeableConcept = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.LOINC, String(item.value)))
      }
      if (resource.has('Observation.value[x].Range.low')) {
        const item = resource.get('Observation.value[x].Range.low')!
        if (!observation.valueRange) observation.valueRange = {}
        // TODO: Quantity datatype: may need unit-value
        observation.valueRange.low = { value: Number(item.value) }
      }
      if (resource.has('Observation.value[x].Range.high')) {
        const item = resource.get('Observation.value[x].Range.high')!
        if (!observation.valueRange) observation.valueRange = {}
        observation.valueRange.high = { value: Number(item.value) }
      }
      if (resource.has('Observation.value[x].Ratio.numerator')) {
        const item = resource.get('Observation.value[x].Ratio.numerator')!
        if (!observation.valueRatio) observation.valueRatio = {}
        observation.valueRatio.numerator = { value: Number(item.value) }
      }
      if (resource.has('Observation.value[x].Ratio.denominator')) {
        const item = resource.get('Observation.value[x].Ratio.denominator')!
        if (!observation.valueRatio) observation.valueRatio = {}
        observation.valueRatio.denominator = { value: Number(item.value) }
      }
      if (resource.has('Observation.value[x].Quantity.value')) {
        const item = resource.get('Observation.value[x].Quantity.value')!
        if (!observation.valueQuantity) observation.valueQuantity = {}
        observation.valueQuantity.value = Number(item.value)
      }
      if (resource.has('Observation.value[x].Quantity.comparator')) {
        const item = resource.get('Observation.value[x].Quantity.comparator')!
        if (!observation.valueQuantity) observation.valueQuantity = {}
        observation.valueQuantity.comparator = String(item.value)
      }
      if (resource.has('Observation.value[x].Quantity.unit')) {
        const item = resource.get('Observation.value[x].Quantity.unit')!
        if (!observation.valueQuantity) observation.valueQuantity = {}
        observation.valueQuantity.unit = String(item.value)
      }
      if (resource.has('Observation.value[x].Quantity.system')) {
        const item = resource.get('Observation.value[x].Quantity.system')!
        if (!observation.valueQuantity) observation.valueQuantity = {}
        observation.valueQuantity.system = String(item.value)
      }
      if (resource.has('Observation.value[x].Quantity.code')) {
        const item = resource.get('Observation.value[x].Quantity.code')!
        if (!observation.valueQuantity) observation.valueQuantity = {}
        observation.valueQuantity.code = String(item.value)
      }

      if (resource.has('Observation.subject')) {
        observation.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('Observation.subject')!.value))}`})
      }
      if (resource.has('Observation.subject.reference')) {
        observation.subject = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('Observation.subject.reference')!.value))}`})
      }
      if (resource.has('Observation.performer')) {
        // TODO: Can have more then one
        observation.performer = [DataTypeFactory.createReference({reference: `Practitioner/${FHIRUtil.hash(String(resource.get('Observation.performer')!.value))}`})]
      }
      if (resource.has('Observation.encounter')) {
        observation.encounter = DataTypeFactory.createReference({reference: `Encounter/${FHIRUtil.hash(String(resource.get('Observation.encounter')!.value))}`})
      }
      if (resource.has('Observation.device')) {
        observation.device = DataTypeFactory.createReference({reference: `Device/${FHIRUtil.hash(String(resource.get('Observation.device')!.value))}`})
      }

      if (resource.has('Observation.component.code')) {
        const value = String(resource.get('Observation.component.code')!.value)
        const coding = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.LOINC, value, value))
        components.push({ code: coding })
      }

      // TODO: Component value[x]

      if (!FHIRUtil.isEmpty(effectiveTiming)) observation.effectiveTiming = FHIRUtil.cleanJSON(effectiveTiming)
      if (components.length) observation.component = components

      observation.id = this.generateID(observation)

      resolve(observation)
    })
  }

  public generateID (resource: fhir.Observation): string {
    let value: string = ''

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

    return FHIRUtil.hash(value)
  }

}
