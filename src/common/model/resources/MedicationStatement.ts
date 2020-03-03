import { DataTypeFactory } from './../factory/data-type-factory'
import { Resource } from './Resource'
import { FHIRUtil } from './../../utils/fhir-util'
import { environment } from './../../environment'

export class MedicationStatement extends Resource {

  static generate (resource: fhir.MedicationStatement, payload: ResourceGenerator.Payload): Promise<any> {

    const {value, sourceType, targetField, targetSubFields, fhirType} = payload

    return new Promise<any>((resolve, reject) => {
      switch (targetField) {
        case 'status':
          resource.status = 'active'
          resolve(true)
          break
        case 'category':
          resource.category = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/medication-statement-category', value))
          resolve(true)
          break
        case 'medication[x]':
          if (fhirType?.startsWith('CodeableConcept')) {
            resource.medicationCodeableConcept = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.ATC, value))
          } else if (fhirType?.startsWith('Reference')) {
            resource.medicationReference = DataTypeFactory.createReference({reference: `Medication/${FHIRUtil.hash(value)}`})
          }
          resolve(true)
          break
        case 'subject':
          resource.subject = {reference: `Patient/${FHIRUtil.hash(value)}`} as fhir.Reference
          resolve(true)
          break
        case 'effective[x]':
          try {
            if (sourceType === 'Date') {
              let date = value
              if (!(value instanceof Date)) {
                date = new Date(value)
              }
              if (fhirType === 'dateTime') {
                resource.effectiveDateTime = DataTypeFactory.createDateString(date)
              } else if (fhirType?.startsWith('Period')) {
                const type = fhirType!.split('.')[1]
                if (!resource.effectivePeriod) {
                  resource.effectivePeriod = {}
                }
                resource.effectivePeriod[type] = DataTypeFactory.createDateString(date)
              }
            }
          } catch (e) { reject(e) }

          resolve(true)
          break
        case 'dosage':
          const dosage: fhir.DosageInstruction = resource.dosage?.length ? resource.dosage[0] : {}
          const typeParts = fhirType?.split('.')
          if (typeParts && typeParts.length > 1) {
            const type = typeParts[1]
            switch (type) {
              case 'timing':
                if (!dosage.timing) dosage.timing = {} as fhir.Timing
                try {
                  if (fhirType === 'Timing.event') {
                    if (sourceType === 'Date') {
                      let date = value
                      if (!(value instanceof Date)) {
                        date = new Date(value)
                      }
                      dosage.timing!.event = [DataTypeFactory.createDateString(date)]
                    }
                  } else if (fhirType === 'Timing.code') {
                    // TODO
                    // dosage.timing!.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation', 'BID'))
                  } else if (fhirType?.startsWith('Timing.repeat')) {
                    if (!dosage.timing.repeat) dosage.timing.repeat = {} as fhir.TimingRepeat
                    const repeatType = fhirType?.split('.')[2]
                    if (repeatType?.startsWith('bounds')) {
                      // TODO
                    } else {
                      dosage.timing.repeat[repeatType] = value
                    }
                  }
                } catch (e) { reject(e) }
                break
              case 'dose[x]':
                // TODO
                break
              case 'rate[x]':
                // TODO
                break
            }
          }
          resolve(true)
          break
        default:
          resolve(true)
      }
    })
  }

}
