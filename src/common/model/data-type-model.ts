import { DataTypeFactory } from './factory/data-type-factory'
import { FHIRUtil } from './../utils/fhir-util'

export interface IElement {
  toJSON (): any
}

export class Address implements IElement {

  use: string
  type: string
  text: string
  line: string[] = []
  city: string
  district: string
  state: string
  postalCode: string
  country: string

  constructor (address: fhir.Address) {
    this.use = address.use
    this.type = address.type
    this.text = address.text
    this.line = address.line
    this.city = address.city
    this.district = address.district
    this.state = address.state
    this.postalCode = address.postalCode
    this.country = address.country
  }

  toJSON (): fhir.Address {
    return FHIRUtil.cleanJSON({
      use: this.use,
      type: this.type,
      text: this.text,
      line: this.line,
      city: this.city,
      district: this.district,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country
    })
  }

}

export class Age implements IElement {
  value: number
  system: string
  code: string

  constructor (age: fhir.Age) {
    this.value = age.value
    this.system = age.system
    this.code = age.code
  }

  toJSON (): fhir.Age {
    return FHIRUtil.cleanJSON({
      value: this.value,
      system: this.system,
      code: this.code
    })
  }

}

export class AppointmentParticipant implements IElement {

  type: CodeableConcept[] = []
  actor: Reference
  required: string
  status: string

  constructor (participant: fhir.AppointmentParticipant) {
    if (participant.type) {
      for (const type of participant.type) {
        this.type.push(DataTypeFactory.createCodeableConcept(type))
      }
    }
    this.actor = DataTypeFactory.createReference(participant.actor)
    this.required = participant.required
    this.status = participant.status
  }

  toJSON (): fhir.AppointmentParticipant {
    return FHIRUtil.cleanJSON({
      type: (this.type && this.type.length) ? this.type.map((t: CodeableConcept) => t.toJSON()) : undefined,
      actor: this.actor,
      required: this.required,
      status: this.status
    })
  }

}

export class Attachment implements IElement {

  contentType: string
  language: string
  data: string
  url: string
  size: number
  hash: string
  title: string
  creation: Date

  public constructor (attachment: fhir.Attachment) {
    if (!attachment) {
      return
    }
    this.contentType = attachment.contentType
    this.language = attachment.language
    this.data = attachment.data
    this.url = attachment.url
    this.size = attachment.size
    this.hash = attachment.hash
    this.title = attachment.title
    this.creation = attachment.creation ? new Date(attachment.creation) : null
  }

  toJSON (): fhir.Attachment {
    return FHIRUtil.cleanJSON({
      contentType: this.contentType,
      language: this.language,
      data: this.data,
      url: this.url,
      size: this.size,
      hash: this.hash,
      title: this.title,
      creation: this.creation && this.creation.toISOString()
    })
  }

}

export class AuditEventAgent implements IElement {
  role: CodeableConcept[]
  reference: Reference
  userId: Identifier
  altId: string
  name: string
  requestor: boolean
  network: AuditEventAgentNetwork

  constructor (agent: fhir.AuditEventAgent) {
    this.userId = DataTypeFactory.createIdentifier(agent.userId)
    this.reference = DataTypeFactory.createReference(agent.reference)
    this.altId = agent. altId
    this.name = agent.name
    this.requestor = agent.requestor
    this.network = DataTypeFactory.createAuditEventAgentNetwork(agent.network)
    if (agent.role) {
      this.role = []
      for (const role of agent.role) {
        this.role.push(DataTypeFactory.createCodeableConcept(role))
      }
    }
  }

  toJSON (): fhir.AuditEventAgent {
    return FHIRUtil.cleanJSON({
      role: (this.role && this.role.length) ? this.role.map((role: CodeableConcept) => role.toJSON()) : undefined,
      reference: this.reference && this.reference.toJSON(),
      userId: this.userId && this.userId.toJSON(),
      altId: this.altId,
      name: this.name,
      requestor: this.requestor,
      network: this.network && this.network.toJSON()
    })
  }

}

export class AuditEventAgentNetwork implements IElement {
  address: string
  type: string

  constructor (network: fhir.AuditEventAgentNetwork) {
    this.address = network.address
    this.type = network.type
  }

  toJSON (): fhir.AuditEventAgentNetwork {
    return FHIRUtil.cleanJSON({
      address: this.address,
      type: this.type
    })
  }

}

export class AuditEventSource implements IElement {
  site: string
  identifier: Identifier
  type: Coding[]

  constructor (source: fhir.AuditEventSource) {
    this.site = source.site
    this.identifier = DataTypeFactory.createIdentifier(source.identifier)
    if (source.type) {
      this.type = []
      for (const coding of source.type) {
        this.type.push(DataTypeFactory.createCoding(coding))
      }
    }
  }

  toJSON (): fhir.AuditEventSource {
    return FHIRUtil.cleanJSON({
      site: this.site,
      identifier: this.identifier && this.identifier.toJSON(),
      type: this.type && this.type.map((c: Coding) => c.toJSON())
    })
  }

}

export class CareTeamMember implements IElement {

  isManager: boolean
  role: CodeableConcept
  member: Reference
  onBehalfOf: Reference
  period: Period

  public constructor (member: fhir.CareTeamParticipant) {
    if (member.extension) {
      // for (const extension of member.extension) {
      //   if (extension.url === environment.extensions.CARE_TEAM_MANAGER) {
      //     this.isManager = extension.valueBoolean
      //   }
      // }
    }
    this.role = DataTypeFactory.createCodeableConcept(member.role)
    this.member = DataTypeFactory.createReference(member.member)
    this.onBehalfOf = DataTypeFactory.createReference(member.onBehalfOf)
    this.period = DataTypeFactory.createPeriod(member.period)
  }

  toJSON (): fhir.CareTeamParticipant {
    return FHIRUtil.cleanJSON({
      // extension: (this.isManager == null) ? null : [{
      //   url: environment.extensions.CARE_TEAM_MANAGER,
      //   valueBoolean: this.isManager
      // }],
      role: this.role && this.role.toJSON(),
      member: this.member,
      onBehalfOf: this.onBehalfOf,
      period: this.period && this.period.toJSON()
    })
  }

}

export class CodeableConcept implements IElement {
  coding: Coding[] = []
  text: string

  constructor (codeableConcept: fhir.CodeableConcept) {
    if (!codeableConcept) {
      return null
    }
    if (codeableConcept.coding) {
      for (const coding of codeableConcept.coding) {
        this.coding.push(DataTypeFactory.createCoding(coding))
      }
    }
    this.text = codeableConcept.text
  }

  getCodes(): string[] {
    return (this.coding || []).map((_coding: Coding) => _coding.code).filter(_ => _)
  }

  getDisplays(): string[] {
    return (this.coding || []).map((_coding: Coding) => _coding.display).filter(_ => _)
  }

  toJSON (): fhir.CodeableConcept {
    return FHIRUtil.cleanJSON({
      coding: this.coding && this.coding.map((c: Coding) => c.toJSON()),
      text: this.text
    })
  }

}

export class Coding implements IElement {

  system: string
  version: string
  code: string
  display: string

  public constructor (coding: fhir.Coding) {
    this.system = coding.system
    this.version = coding.version
    this.code = coding.code
    this.display = coding.display
  }

  toJSON (): fhir.Coding {
    return FHIRUtil.cleanJSON({
      system: this.system,
      version: this.version,
      code: this.code,
      display: this.display
    })
  }

}

export class ContactPoint implements IElement {

  system: string
  value: string
  use: string
  rank: number

  public constructor (contactPoint: fhir.ContactPoint) {
    this.system = contactPoint.system
    this.value = contactPoint.value
    this.use = contactPoint.use
    this.rank = contactPoint.rank
  }

  toJSON (): fhir.ContactPoint {
    return FHIRUtil.cleanJSON({
      system: this.system,
      value: this.value,
      use: this.use,
      rank: this.rank
    })
  }

}

// export class Dosage implements IElement {
//
//   text: string
//   timing: Timing
//   asNeeded: boolean
//   site: CodeableConcept
//   route: CodeableConcept
//   doseAndRate: Quantity
//   maxDosePerAdministration: Quantity
//
//   public constructor (dosage: fhir.DosageInstruction) {
//     this.text = dosage.text
//     this.timing = DataTypeFactory.createTiming(dosage.timing)
//     this.asNeeded = dosage.asNeededBoolean
//     this.site = DataTypeFactory.createCodeableConcept(dosage.site)
//     this.route = DataTypeFactory.createCodeableConcept(dosage.route)
//     this.dose = DataTypeFactory.createQuantity(dosage.doseQuantity)
//     this.maxDosePerAdministration = DataTypeFactory.createQuantity(dosage.maxDosePerAdministration)
//   }
//
//   toJSON (): fhir.DosageInstruction {
//     if (this.dose && this.dose.code && !this.dose.system) {
//       this.dose.system = 'http://unitsofmeasure.org'
//     }
//     return FHIRUtil.cleanJSON({
//       text: this.text,
//       timing: this.timing && this.timing.toJSON(),
//       asNeededBoolean: this.asNeeded,
//       site: this.site && this.site.toJSON(),
//       route: this.route && this.route.toJSON(),
//       doseQuantity: this.dose && this.dose.toJSON(),
//       maxDosePerAdministration: this.maxDosePerAdministration && this.maxDosePerAdministration.toJSON()
//     })
//   }
// }

// export class DoseAndRateElement implements IElement{
//   type: CodeableConcept
//   doseRange: Range
//   doseQuantity: Quantity
//   rateRange: Range
//   rateQuantity: Quantity
//
//   constructor () {
//
//   }
//
// }

export class GoalTarget implements IElement {

  measure: CodeableConcept
  detailQuantity: Quantity
  detailRange: Range
  detailCodeableConcept: CodeableConcept
  dueDate: Date
  components: GoalTarget[]

  public constructor (target: fhir.GoalTarget) {
    this.measure = DataTypeFactory.createCodeableConcept(target.measure)
    this.detailQuantity = DataTypeFactory.createQuantity(target.detailQuantity)
    this.detailRange = DataTypeFactory.createRange(target.detailRange)
    this.detailCodeableConcept = DataTypeFactory.createCodeableConcept(target.detailCodeableConcept)
    this.dueDate = target.dueDate ? new Date(target.dueDate) : null
    if (target.extension) {
      this.components = []
      target.extension.filter(extension => extension.url === 'component').forEach(extension => {
        const component: fhir.GoalTarget = {}
        extension.extension.forEach(_ext => {
          switch (_ext.url) {
            case 'measure':
              component.measure = _ext.valueCodeableConcept
              break
            case 'value':
              if (_ext.valueQuantity) {
                component.detailQuantity = _ext.valueQuantity
              } else if (_ext.valueRange) {
                component.detailRange = _ext.valueRange
              }
              break
          }
        })
        const componentObj = DataTypeFactory.createGoalTarget(component)
        if (componentObj) { this.components.push(componentObj) }
      })
      if (!this.components.length) { this.components = undefined }
    }
  }

  toJSON (): fhir.GoalTarget {
    return FHIRUtil.cleanJSON({
      extension: this.components && this.components.length ? this.components.map(component => {
        return {
          url: 'component',
          extension: [{
            url: 'measure',
            valueCodeableConcept: component.measure && component.measure.toJSON()
          }, FHIRUtil.cleanJSON({
            url: 'value',
            valueRange: component.detailRange ? component.detailRange.toJSON() : undefined,
            valueQuantity: component.detailQuantity ? component.detailQuantity.toJSON() : undefined
          })]
        }
      }) : undefined,
      measure: this.measure && this.measure.toJSON(),
      detailQuantity: this.detailQuantity && this.detailQuantity.toJSON(),
      detailRange: this.detailRange && this.detailRange.toJSON(),
      detailCodeableConcept: this.detailCodeableConcept && this.detailCodeableConcept.toJSON(),
      dueDate: this.dueDate && this.dueDate.toISODateString()
    })
  }

}

export class HumanName implements IElement {

  use: fhir.code
  text: string
  family: string
  given: string[]
  prefix: string[]
  suffix: string[]
  period: Period

  public constructor (humanName: fhir.HumanName) {
    this.use = humanName.use
    this.text = humanName.text
    this.family = humanName.family
    this.given = humanName.given
    this.prefix = humanName.prefix
    this.suffix = humanName.suffix
    this.period = DataTypeFactory.createPeriod(humanName.period)
  }

  toJSON (): fhir.HumanName {
    return FHIRUtil.cleanJSON({
      use: this.use,
      text: this.text,
      family: this.family,
      given: this.given,
      prefix: this.prefix,
      suffix: this.suffix,
      period: this.period?.toJSON()
    })
  }

}

export class Identifier implements IElement {

  use: string
  type: CodeableConcept
  system: string
  value: string
  period: Period
  assigner: Reference

  public constructor (identifier: fhir.Identifier) {
    this.use = identifier.use
    this.type = DataTypeFactory.createCodeableConcept(identifier.type)
    this.system = identifier.system
    this.value = identifier.value
    this.period = DataTypeFactory.createPeriod(identifier.period)
    this.assigner = DataTypeFactory.createReference(identifier.assigner)
  }

  toJSON (): fhir.Identifier {
    return FHIRUtil.cleanJSON({
      use: this.use,
      type: this.type && this.type.toJSON(),
      system: this.system,
      value: this.value,
      period: this.period && this.period.toJSON(),
      assigner: this.assigner
    })
  }

}

export class Note implements IElement {

  authorReference: Reference
  authorString: string
  time: Date
  text: string
  action: 'create'|'update'|'delete'

  constructor (resource: fhir.Annotation) {
    this.authorReference = DataTypeFactory.createReference(resource.authorReference)
    this.authorString = resource.authorString
    this.time = resource.time ? new Date(resource.time) : null
    this.text = resource.text
    // for (const extension of (resource.extension || [])) {
    //   if (extension.url === environment.extensions.ACTION_TYPE) {
    //     this.action = <'create'|'update'|'delete'>extension.valueCode
    //   }
    // }
  }

  toJSON (): fhir.Annotation {
    return FHIRUtil.cleanJSON({
      authorReference: this.authorReference,
      authorString: this.authorString,
      time: this.time && this.time.toISOString(),
      text: this.text
      // extension: this.action ? [{
        // url: environment.extensions.ACTION_TYPE,
      //   valueCode: this.action
      // }] : undefined
    })
  }

}

export class OrganizationContact implements IElement {

  name: string
  prefix: string[]
  given: string[]
  family: string
  purpose: CodeableConcept
  address: Address
  telecom: ContactPoint[] = []


  constructor (contact: fhir.OrganizationContact) {
    if (contact.name) {
      this.name = ''
      this.prefix = contact.name.prefix
      this.given = contact.name.given
      this.family = contact.name.family
      if (this.prefix) {
        for (const prefix of this.prefix) {
          this.name += prefix + ' '
        }
      }
      if (this.given) {
        for (const given of this.given) {
          this.name += given + ' '
        }
      }
      this.name += this.family
    }
    this.purpose = DataTypeFactory.createCodeableConcept(contact.purpose)
    this.address = DataTypeFactory.createAddress(contact.address)
    if (contact.telecom) {
      for (const telecom of contact.telecom) {
        this.telecom.push(DataTypeFactory.createContactPoint(telecom))
      }
    }
  }

  toJSON (): fhir.OrganizationContact {
    return FHIRUtil.cleanJSON({
      name: FHIRUtil.cleanJSON({
        prefix: this.prefix,
        given: this.given,
        family: this.family
      }),
      purpose: this.purpose && this.purpose.toJSON(),
      address: this.address && this.address.toJSON(),
      telecom: this.telecom && this.telecom.map((t: ContactPoint) => t.toJSON())
    })
  }

}

export class Period implements IElement {

  start: fhir.dateTime
  end: fhir.dateTime

  public constructor (period: fhir.Period) {
    if (!period) {
      return
    }
    this.start = period.start ? new Date(period.start).toISOString() : null
    this.end = period.end ? new Date(period.end).toISOString() : null
  }

  toJSON (): fhir.Period {
    return FHIRUtil.cleanJSON({
      start: this.start,
      end: this.end
    })
  }

}

export class Quantity implements IElement {

  value: number
  unit: string
  system: string
  code: string

  public constructor (quantity: fhir.Quantity) {
    this.value = quantity.value
    this.unit = quantity.unit
    this.system = quantity.system
    this.code = quantity.code
  }

  toJSON (): fhir.Quantity {
    return FHIRUtil.cleanJSON({
      value: this.value,
      unit: this.unit,
      system: this.system,
      code: this.code
    })
  }

}

export class Range implements IElement {

  low: Quantity
  high: Quantity

  public constructor (range: fhir.Range) {
    this.low = DataTypeFactory.createQuantity(range.low)
    this.high = DataTypeFactory.createQuantity(range.high)
  }

  toJSON (): fhir.Range {
    return FHIRUtil.cleanJSON({
      low: this.low && this.low.toJSON(),
      high: this.high && this.high.toJSON()
    })
  }

}

export class Ratio implements IElement {

  numerator: Quantity
  denominator: Quantity

  constructor (ratio: fhir.Ratio) {
    this.numerator = DataTypeFactory.createQuantity(ratio.numerator)
    this.denominator = DataTypeFactory.createQuantity(ratio.denominator)
  }

  toJSON (): fhir.Ratio {
    return FHIRUtil.cleanJSON({
      numerator: this.numerator && this.numerator.toJSON(),
      denominator: this.denominator && this.denominator.toJSON()
    })
  }

}

export class Reference implements IElement {

  reference: string
  identifier: Identifier
  display: string

  constructor (ref: fhir.Reference) {
    this.reference = ref.reference
    this.identifier = DataTypeFactory.createIdentifier(ref.identifier)
    this.display = ref.display
  }

  toJSON (): fhir.Reference {
    return FHIRUtil.cleanJSON({
      reference: this.reference,
      identifier: this.identifier && this.identifier.toJSON(),
      display: this.display
    })
  }

}

export class ReferenceRange implements IElement {

  low: Quantity
  high: Quantity
  age: Range
  text: string

  public constructor (referenceRange: fhir.ObservationReferenceRange) {
    this.low = DataTypeFactory.createQuantity(referenceRange.low)
    this.high = DataTypeFactory.createQuantity(referenceRange.high)
    this.age = DataTypeFactory.createRange(referenceRange.age)
    this.text = referenceRange.text
  }

  toJSON (): fhir.ObservationReferenceRange {
    return FHIRUtil.cleanJSON({
      low: this.low && this.low.toJSON(),
      high: this.high && this.high.toJSON(),
      age: this.age && this.age.toJSON(),
      text: this.text
    })
  }

}

export class Timing implements IElement {

  event: Date[] = []
  code: CodeableConcept
  bounds: Period
  count: number
  countMax: number
  duration: number
  durationMax: number
  durationUnit: string
  frequency: number
  frequencyMax: number
  period: number
  periodMax: number
  periodUnit: string
  dayOfWeek: string[]
  timeOfDay: string[]
  when: string[]
  offset: number

  constructor (timing: fhir.Timing) {
    if (timing.event) {
      for (const event of timing.event) {
        this.event.push(new Date(event))
      }
    }
    this.code = DataTypeFactory.createCodeableConcept(timing.code)
    if (timing.repeat) {
      this.bounds = DataTypeFactory.createPeriod(timing.repeat.boundsPeriod)
      this.count = timing.repeat.count
      this.countMax = timing.repeat.countMax
      this.duration = timing.repeat.duration
      this.durationMax = timing.repeat.durationMax
      this.durationUnit = timing.repeat.durationUnit
      this.frequency = timing.repeat.frequency
      this.frequencyMax = timing.repeat.frequencyMax
      this.period = timing.repeat.period
      this.periodMax = timing.repeat.periodMax
      this.periodUnit = timing.repeat.periodUnit
      this.dayOfWeek = timing.repeat.dayOfWeek
      this.timeOfDay = timing.repeat.timeOfDay
      this.when = timing.repeat.when
      this.offset = timing.repeat.offset
    }
  }

  toJSON (): fhir.Timing {
    return FHIRUtil.cleanJSON({
      event: (this.event && this.event.length) ? this.event.map((e: Date) => e.toISOString()) : undefined,
      code: this.code && this.code.toJSON(),
      repeat: FHIRUtil.cleanJSON({
        boundsPeriod: this.bounds && this.bounds.toJSON(),
        count: this.count,
        countMax: this.countMax,
        duration: this.duration,
        durationMax: this.durationMax,
        durationUnit: this.durationUnit,
        frequency: this.frequency,
        frequencyMax: this.frequencyMax,
        period: this.period,
        periodMax: this.periodMax,
        periodUnit: this.periodUnit,
        dayOfWeek: this.dayOfWeek,
        timeOfDay: this.timeOfDay,
        when: this.when,
        offset: this.offset
      })
    })
  }

}

export class AllergyIntoleranceReaction implements IElement {

  substance: CodeableConcept
  manifestation: CodeableConcept[] = []
  description: string
  onset: Date
  severity: string

  constructor (reaction: fhir.AllergyIntoleranceReaction) {
    this.substance = DataTypeFactory.createCodeableConcept(reaction.substance)
    if (reaction.manifestation) {
      for (const manifestation of reaction.manifestation) {
        this.manifestation.push(DataTypeFactory.createCodeableConcept(manifestation))
      }
    }
    this.description = reaction.description
    this.onset = reaction.onset ? new Date(reaction.onset) : null
    this.severity = reaction.severity
  }

  toJSON (): fhir.AllergyIntoleranceReaction {
    return FHIRUtil.cleanJSON({
      substance: this.substance && this.substance.toJSON(),
      manifestation: this.manifestation && this.manifestation.map((m: CodeableConcept) => m.toJSON()),
      description: this.description,
      onset: this.onset && this.onset.toISOString(),
      severity: this.severity
    })
  }

}

export class FamilyMemberHistoryCondition implements IElement {
  code: CodeableConcept
  outcome: CodeableConcept
  onset: any // TODO: onset what?
  note: Note[] = []

  constructor (fmhCondition: fhir.FamilyMemberHistoryCondition) {
    this.code = DataTypeFactory.createCodeableConcept(fmhCondition.code)
    this.outcome = DataTypeFactory.createCodeableConcept(fmhCondition.outcome)
    // TODO: this.onset = fmhCondition.onset...
    for (const note of (fmhCondition.note || [])) {
      this.note.push(DataTypeFactory.createNote(note))
    }
  }

  toJSON (): fhir.FamilyMemberHistoryCondition {
    return FHIRUtil.cleanJSON({
      code: this.code && this.code.toJSON(),
      outcome: this.outcome && this.outcome.toJSON(),
      // onset...: this.onset,
      note: (this.note && this.note.length) ? this.note.map((n: Note) => n.toJSON()) : undefined
    })
  }

}
