import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Encounter implements Generator {

  Encounter () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Encounter> {
    const encounter: fhir.Encounter = { resourceType: 'Encounter' } as fhir.Encounter
    if (profile) encounter.meta = { profile: [profile] }

    return new Promise<fhir.Encounter>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Encounter.id')) {
        encounter.id = String(resource.get('Encounter.id')?.value || '')
      }
      if (resource.has('Encounter.status')) {
        encounter.status = String(resource.get('Encounter.status').value)
      }
      if (resource.has('Encounter.statusHistory.status')) {
        const _status = String(resource.get('Encounter.statusHistory.status').value)

        if (!encounter.statusHistory?.length) {
          encounter.statusHistory = [{} as fhir.EncounterStatusHistory]
        }
        encounter.statusHistory[0].status = _status

      }
      const statusHistoryPeriod = keys.filter(_ => _.startsWith('Encounter.statusHistory.period.Period'))
      if (statusHistoryPeriod.length) {
        const period: fhir.Period = {}
        if (resource.has('Encounter.statusHistory.period.Period.start')) {
          const item = resource.get('Encounter.statusHistory.period.Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Encounter.statusHistory.period.Period.end')) {
          const item = resource.get('Encounter.statusHistory.period.Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          if (!encounter.statusHistory?.length) {
            encounter.statusHistory = [{} as fhir.EncounterStatusHistory]
          }
          encounter.statusHistory[0].period = _period
        }
      }

      if (resource.has('Encounter.class')) {
        const item = resource.get('Encounter.class')
        encounter.class = DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)}).toJSON()
      }
      if (resource.has('Encounter.classHistory.class')) {
        const item = resource.get('Encounter.classHistory.class')
        const _class: fhir.Coding = DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)}).toJSON()

        if (!encounter.classHistory?.length && _class && !FHIRUtil.isEmpty(_class)) {
          encounter.classHistory = [{} as fhir.EncounterClassHistory]
        }
        encounter.classHistory[0].class = _class
      }
      const classHistoryPeriod = keys.filter(_ => _.startsWith('Encounter.classHistory.period.Period'))
      if (classHistoryPeriod.length) {
        const period: fhir.Period = {}
        if (resource.has('Encounter.classHistory.period.Period.start')) {
          const item = resource.get('Encounter.classHistory.period.Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Encounter.classHistory.period.Period.end')) {
          const item = resource.get('Encounter.classHistory.period.Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          if (!encounter.classHistory?.length) {
            encounter.classHistory = [{} as fhir.EncounterClassHistory]
          }
          encounter.classHistory[0].period = _period
        }
      }

      if (resource.has('Encounter.type')) {
        const item = resource.get('Encounter.type')
        encounter.type = [DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )]
      }
      if (resource.has('Encounter.serviceType')) {
        const item = resource.get('Encounter.serviceType')
        encounter.serviceType = DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )
      }
      if (resource.has('Encounter.priority')) {
        const item = resource.get('Encounter.priority')
        encounter.priority = DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )
      }

      const subject = FHIRUtil.searchForReference(keys, resource, 'Encounter.subject.Reference.')
      if (subject) encounter.subject = subject

      const episodeOfCare = FHIRUtil.searchForReference(keys, resource, 'Encounter.episodeOfCare.Reference.')
      if (episodeOfCare) encounter.episodeOfCare = [episodeOfCare]

      const basedOn = FHIRUtil.searchForReference(keys, resource, 'Encounter.basedOn.Reference.')
      if (basedOn) encounter.basedOn = [basedOn]

      if (resource.has('Encounter.participant.type')) {
        const item = resource.get('Encounter.participant.type')
        const _type: fhir.CodeableConcept = DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )

        if (!encounter.participant?.length && _type && !FHIRUtil.isEmpty(_type)) {
          encounter.participant = [{} as fhir.EncounterParticipant]
        }
        encounter.participant[0].type = [_type]
      }
      const participantPeriod = keys.filter(_ => _.startsWith('Encounter.participant.period.Period'))
      if (participantPeriod.length) {
        const period: fhir.Period = {}
        if (resource.has('Encounter.participant.period.Period.start')) {
          const item = resource.get('Encounter.participant.period.Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Encounter.participant.period.Period.end')) {
          const item = resource.get('Encounter.participant.period.Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          if (!encounter.participant?.length) {
            encounter.participant = [{} as fhir.EncounterParticipant]
          }
          encounter.participant[0].period = _period
        }
      }
      const participantIndividual = FHIRUtil.searchForReference(keys, resource, 'Encounter.participant.individual.Reference.')
      if (participantIndividual) {
        if (!encounter.participant?.length) {
          encounter.participant = [{} as fhir.EncounterParticipant]
        }
        encounter.participant[0].individual = participantIndividual
      }

      const appointment = FHIRUtil.searchForReference(keys, resource, 'Encounter.appointment.Reference.')
      if (appointment) encounter.appointment = [appointment]

      const period = keys.filter(_ => _.startsWith('Encounter.period.Period'))
      if (period.length) {
        const period: fhir.Period = {}
        if (resource.has('Encounter.period.Period.start')) {
          const item = resource.get('Encounter.period.Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Encounter.period.Period.end')) {
          const item = resource.get('Encounter.period.Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          encounter.period = _period
        }
      }

      const lengthQuantity = keys.filter(_ => _.startsWith('Encounter.length.Quantity'))
      if (lengthQuantity.length) {
        const quantity: fhir.Quantity = {}
        if (resource.has('Encounter.length.Quantity.value')) {
          const item = resource.get('Encounter.length.Quantity.value')
          quantity.value = Number(item.value)
        }
        if (resource.has('Encounter.length.Quantity.comparator')) {
          const item = resource.get('Encounter.length.Quantity.comparator')
          quantity.comparator = String(item.value)
        }
        if (resource.has('Encounter.length.Quantity.unit')) {
          const item = resource.get('Encounter.length.Quantity.unit')
          quantity.unit = String(item.value)
        }
        if (resource.has('Encounter.length.Quantity.system')) {
          const item = resource.get('Encounter.length.Quantity.system')
          quantity.system = String(item.value)
        }
        if (resource.has('Encounter.length.Quantity.code')) {
          const item = resource.get('Encounter.length.Quantity.code')
          quantity.code = String(item.value)
        }

        const _quantity = DataTypeFactory.createQuantity(quantity).toJSON()
        if (!FHIRUtil.isEmpty(_quantity)) {
          encounter.length = _quantity
        }
      }

      if (resource.has('Encounter.reasonCode')) {
        const item = resource.get('Encounter.reasonCode')
        encounter.reasonCode = [DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )]
      }

      const reasonReference = FHIRUtil.searchForReference(keys, resource, 'Encounter.reasonReference.Reference.')
      if (reasonReference) encounter.reasonReference = [reasonReference]

      const diagnosis = keys.filter(_ => _.startsWith('Encounter.diagnosis'))
      if (diagnosis.length) {
        const encounterDiagnosis: fhir.EncounterDiagnosis = {} as fhir.EncounterDiagnosis

        const diagnosisCondition = FHIRUtil.searchForReference(keys, resource, 'Encounter.diagnosis.condition.Reference.')
        if (diagnosisCondition) encounterDiagnosis.condition = diagnosisCondition
        if (resource.has('Encounter.diagnosis.use')) {
          const item = resource.get('Encounter.diagnosis.use')
          encounterDiagnosis.use = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
        if (resource.has('Encounter.diagnosis.rank')) {
          const item = resource.get('Encounter.diagnosis.rank')
          encounterDiagnosis.rank = Number(item.value)
        }

        const _encounterDiagnosis = FHIRUtil.cleanJSON(encounterDiagnosis)
        if (!FHIRUtil.isEmpty(_encounterDiagnosis)) {
          encounter.diagnosis = [_encounterDiagnosis]
        }
      }

      const hospitalization = keys.filter(_ => _.startsWith('Encounter.hospitalization'))
      if (hospitalization.length) {
        const encounterHospitalization: fhir.EncounterHospitalization = {} as fhir.EncounterHospitalization

        const hospitalizationOrigin = FHIRUtil.searchForReference(keys, resource, 'Encounter.hospitalization.origin.Reference.')
        if (hospitalizationOrigin) encounterHospitalization.origin = hospitalizationOrigin

        if (resource.has('Encounter.hospitalization.admitSource')) {
          const item = resource.get('Encounter.hospitalization.admitSource')
          encounterHospitalization.admitSource = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
        if (resource.has('Encounter.hospitalization.reAdmission')) {
          const item = resource.get('Encounter.hospitalization.reAdmission')
          encounterHospitalization.reAdmission = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
        if (resource.has('Encounter.hospitalization.dietPreference')) {
          const item = resource.get('Encounter.hospitalization.dietPreference')
          encounterHospitalization.dietPreference = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )]
        }
        if (resource.has('Encounter.hospitalization.specialCourtesy')) {
          const item = resource.get('Encounter.hospitalization.specialCourtesy')
          encounterHospitalization.specialCourtesy = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )]
        }
        if (resource.has('Encounter.hospitalization.specialArrangement')) {
          const item = resource.get('Encounter.hospitalization.specialArrangement')
          encounterHospitalization.specialArrangement = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )]
        }
        if (resource.has('Encounter.hospitalization.dischargeDisposition')) {
          const item = resource.get('Encounter.hospitalization.dischargeDisposition')
          encounterHospitalization.dischargeDisposition = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }

        const hospitalizationDestination = FHIRUtil.searchForReference(keys, resource, 'Encounter.hospitalization.destination.Reference.')
        if (hospitalizationDestination) encounterHospitalization.destination = hospitalizationDestination

        const _encounterHospitalization = FHIRUtil.cleanJSON(encounterHospitalization)
        if (!FHIRUtil.isEmpty(_encounterHospitalization)) {
          encounter.hospitalization = _encounterHospitalization
        }
      }

      const location = keys.filter(_ => _.startsWith('Encounter.location'))
      if (location.length) {
        const location: fhir.EncounterLocation = {} as fhir.EncounterLocation

        const locationReference = FHIRUtil.searchForReference(keys, resource, 'Encounter.location.location.Reference.')
        if (locationReference) location.location = locationReference

        if (resource.has('Encounter.location.status')) {
          location.status = String(resource.get('Encounter.location.status').value)
        }
        if (resource.has('Encounter.location.physicalType')) {
          const item = resource.get('Encounter.location.physicalType')
          location.physicalType = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }

        const locationPeriod = keys.filter(_ => _.startsWith('Encounter.location.period.Period'))
        if (locationPeriod.length) {
          const period: fhir.Period = {}
          if (resource.has('Encounter.location.period.Period.start')) {
            const item = resource.get('Encounter.location.period.Period.start')
            try {
              let date = item.value
              if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
              period.start = DataTypeFactory.createDateString(date)
            } catch (e) { log.error('Date insertion error.', e) }
          }
          if (resource.has('Encounter.location.period.Period.end')) {
            const item = resource.get('Encounter.location.period.Period.end')
            try {
              let date = item.value
              if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
              period.end = DataTypeFactory.createDateString(date)
            } catch (e) { log.error('Date insertion error.', e) }
          }

          const _period = DataTypeFactory.createPeriod(period).toJSON()
          if (!FHIRUtil.isEmpty(_period)) {
            location.period = _period
          }
        }

        const _location = FHIRUtil.cleanJSON(location)
        if (!FHIRUtil.isEmpty(_location)) {
          encounter.location = _location
        }
      }

      const serviceProvider = FHIRUtil.searchForReference(keys, resource, 'Encounter.serviceProvider.Reference.')
      if (serviceProvider) encounter.serviceProvider = serviceProvider

      const partOf = FHIRUtil.searchForReference(keys, resource, 'Encounter.partOf.Reference.')
      if (partOf) encounter.partOf = partOf

      encounter.id = this.generateID(encounter)

      if (encounter.id) resolve(encounter)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Encounter): string {
    let value: string = ''

    if (resource.id) {
      value += resource.id
    } else {
      value += JSON.stringify(resource)
    }

    return FHIRUtil.hash(value)
  }

}
