import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
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

      if (resource.has('Encounter.status')) {
        const item = resource.get('Encounter.status')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) encounter.status = targetValue
        } else {
          encounter.status = 'planned' // String(item.value)
        }
      }
      if (resource.has('Encounter.statusHistory.status')) {
        const item = resource.get('Encounter.statusHistory.status')
        let _status = ''
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) _status = targetValue
        } else {
          _status = String(item.value)
        }

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
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Encounter.statusHistory.period.Period.end')) {
          const item = resource.get('Encounter.statusHistory.period.Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
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
        if (item.conceptMap) {
          const targetValue: fhir.Coding = FHIRUtil.getConceptMapTargetAsCoding(item.conceptMap, String(item.value))
          if (targetValue) encounter.class = targetValue
        } else {
          encounter.class = DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: String(item.value)}).toJSON()
        }
      }
      if (resource.has('Encounter.classHistory.class')) {
        const item = resource.get('Encounter.classHistory.class')
        let _class: fhir.Coding
        if (item.conceptMap) {
          const targetValue: fhir.Coding = FHIRUtil.getConceptMapTargetAsCoding(item.conceptMap, String(item.value))
          if (targetValue) _class = targetValue
        } else {
          _class = DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: String(item.value)}).toJSON()
        }

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
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Encounter.classHistory.period.Period.end')) {
          const item = resource.get('Encounter.classHistory.period.Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
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
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          encounter.type = [targetValue]
        } else {
          encounter.type = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/encounter-type', code: String(item.value)})
          )]
        }
      }
      if (resource.has('Encounter.serviceType')) {
        const item = resource.get('Encounter.serviceType')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) encounter.serviceType = targetValue
        } else {
          encounter.serviceType = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/service-type', code: String(item.value)})
          )
        }
      }
      if (resource.has('Encounter.priority')) {
        const item = resource.get('Encounter.priority')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          encounter.priority = targetValue
        } else {
          encounter.priority = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/v3-ActPriority', code: String(item.value)})
          )
        }
      }

      const subject = FHIRUtil.searchForReference(keys, resource, 'Encounter.subject.Reference.')
      if (subject) encounter.subject = subject

      const episodeOfCare = FHIRUtil.searchForReference(keys, resource, 'Encounter.episodeOfCare.Reference.')
      if (episodeOfCare) encounter.episodeOfCare = [episodeOfCare]

      const basedOn = FHIRUtil.searchForReference(keys, resource, 'Encounter.basedOn.Reference.')
      if (basedOn) encounter.basedOn = [basedOn]

      if (resource.has('Encounter.participant.type')) {
        const item = resource.get('Encounter.participant.type')
        let _type: fhir.CodeableConcept
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) _type = targetValue
        } else {
          _type = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: String(item.value)})
          )
        }

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
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Encounter.participant.period.Period.end')) {
          const item = resource.get('Encounter.participant.period.Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
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
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Encounter.period.Period.end')) {
          const item = resource.get('Encounter.period.Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
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
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) encounter.reasonCode = [targetValue]
        } else {
          encounter.reasonCode = [DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: environment.codesystems.SNOMED, code: String(item.value)})
          )]
        }
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
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) encounterDiagnosis.use = targetValue
          } else {
            encounterDiagnosis.use = DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role', code: String(item.value)})
            )
          }
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
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) encounterHospitalization.admitSource = targetValue
          } else {
            encounterHospitalization.admitSource = DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/admit-source', code: String(item.value)})
            )
          }
        }
        if (resource.has('Encounter.hospitalization.reAdmission')) {
          const item = resource.get('Encounter.hospitalization.reAdmission')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) encounterHospitalization.reAdmission = targetValue
          } else {
            encounterHospitalization.reAdmission = DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/v2-0092', code: String(item.value)})
            )
          }
        }
        if (resource.has('Encounter.hospitalization.dietPreference')) {
          const item = resource.get('Encounter.hospitalization.dietPreference')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) encounterHospitalization.dietPreference = [targetValue]
          } else {
            encounterHospitalization.dietPreference = [DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/diet', code: String(item.value)})
            )]
          }
        }
        if (resource.has('Encounter.hospitalization.specialCourtesy')) {
          const item = resource.get('Encounter.hospitalization.specialCourtesy')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) encounterHospitalization.specialCourtesy = [targetValue]
          } else {
            encounterHospitalization.specialCourtesy = [DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/v3-EncounterSpecialCourtesy', code: String(item.value)})
            )]
          }
        }
        if (resource.has('Encounter.hospitalization.specialArrangement')) {
          const item = resource.get('Encounter.hospitalization.specialArrangement')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) encounterHospitalization.specialArrangement = [targetValue]
          } else {
            encounterHospitalization.specialArrangement = [DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/encounter-special-arrangements', code: String(item.value)})
            )]
          }
        }
        if (resource.has('Encounter.hospitalization.dischargeDisposition')) {
          const item = resource.get('Encounter.hospitalization.dischargeDisposition')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) encounterHospitalization.dischargeDisposition = targetValue
          } else {
            encounterHospitalization.dischargeDisposition = DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/discharge-disposition', code: String(item.value)})
            )
          }
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
          const item = resource.get('Encounter.location.status')
          if (item.conceptMap) {
            const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
            if (targetValue) location.status = targetValue
          } else {
            location.status = String(item.value)
          }
        }
        if (resource.has('Encounter.location.physicalType')) {
          const item = resource.get('Encounter.location.physicalType')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) location.physicalType = targetValue
          } else {
            location.physicalType = DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: 'http://terminology.hl7.org/CodeSystem/location-physical-type', code: String(item.value)})
            )
          }
        }

        const locationPeriod = keys.filter(_ => _.startsWith('Encounter.location.period.Period'))
        if (locationPeriod.length) {
          const period: fhir.Period = {}
          if (resource.has('Encounter.location.period.Period.start')) {
            const item = resource.get('Encounter.location.period.Period.start')
            try {
              let date = item.value
              if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
              period.start = DataTypeFactory.createDateString(date)
            } catch (e) { log.error('Date insertion error.', e) }
          }
          if (resource.has('Encounter.location.period.Period.end')) {
            const item = resource.get('Encounter.location.period.Period.end')
            try {
              let date = item.value
              if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
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

    // TODO
    value += JSON.stringify(resource)

    return FHIRUtil.hash(value)
  }

}
