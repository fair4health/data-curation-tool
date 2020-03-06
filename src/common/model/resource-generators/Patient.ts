import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Patient implements Generator {

  Patient () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string): Promise<fhir.Patient> {
    const patient: fhir.Patient = { resourceType: 'Patient' } as fhir.Patient
    patient.meta = { profile: [environment.profiles[profile]] }

    const name: fhir.HumanName = {}
    const address: fhir.Address = {}
    const telecom: fhir.ContactPoint = {}

    return new Promise<fhir.Patient>((resolve, reject) => {

      if (resource.has('Patient.id')) { patient.id = String(resource.get('Patient.id')?.value || '') }
      if (resource.has('Patient.gender')) { patient.gender = String(resource.get('Patient.gender')?.value || 'male') }
      if (resource.has('Patient.telecom')) {
        telecom.system = 'phone'
        telecom.value = String(resource.get('Patient.telecom')!.value)
      }
      if (resource.has('Patient.birthDate')) {
        const item = resource.get('Patient.birthDate')!

        if (item.sourceType === 'Date') {
          let date = item.value
          if (!(date instanceof Date)) { date = new Date(String(item.value)) }
          try {

            patient.birthDate = date.getFullYear() + '-' +
              ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2)

          } catch (e) { log.error('Date insertion error.', e) }
        }
      }
      if (resource.has('Patient.deceased[x].dateTime')) {
        const item = resource.get('Patient.deceased[x].dateTime')!

        let date = item.value
        if (!(date instanceof Date)) { date = new Date(String(item.value)) }
        try {

          patient.deceasedDateTime = DataTypeFactory.createDateString(date)

        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Patient.deceased[x].boolean')) {
        const item = resource.get('Patient.deceased[x].boolean')!

        // TODO
        patient.deceasedBoolean = !!item.value
      }
      if (resource.has('Patient.multipleBirth[x].boolean')) {
        const item = resource.get('Patient.multipleBirth[x].boolean')!

        patient.multipleBirthBoolean = String(item.value) === 'true'
      }
      if (resource.has('Patient.multipleBirth[x].integer')) {
        const item = resource.get('Patient.multipleBirth[x].integer')!

        patient.multipleBirthInteger = Number(item.value)
      }

      if (resource.has('Patient.name.text')) { name.text = String(resource.get('Patient.name.text')!.value) }
      if (resource.has('Patient.name.family')) { name.family = String(resource.get('Patient.name.family')!.value) }
      if (resource.has('Patient.name.given')) { name.given = [String(resource.get('Patient.name.given')!.value)] }
      if (resource.has('Patient.name.prefix')) { name.prefix = [String(resource.get('Patient.name.prefix')!.value)] }
      if (resource.has('Patient.name.suffix')) { name.suffix = [String(resource.get('Patient.name.suffix')!.value)] }

      if (resource.has('Patient.address.type')) { address.type = String(resource.get('Patient.address.type')!.value) }
      if (resource.has('Patient.address.text')) { address.text = String(resource.get('Patient.address.text')!.value) }
      if (resource.has('Patient.address.line')) { address.line = [String(resource.get('Patient.address.line')!.value)] }
      if (resource.has('Patient.address.city')) { address.city = String(resource.get('Patient.address.city')!.value) }
      if (resource.has('Patient.address.district')) { address.district = String(resource.get('Patient.address.district')!.value) }
      if (resource.has('Patient.address.state')) { address.state = String(resource.get('Patient.address.state')!.value) }
      if (resource.has('Patient.address.postalCode')) { address.postalCode = String(resource.get('Patient.address.postalCode')!.value) }
      if (resource.has('Patient.address.country')) { address.country = String(resource.get('Patient.address.country')!.value) }

      if (!FHIRUtil.isEmpty(name)) patient.name = [name]
      if (!FHIRUtil.isEmpty(address)) patient.address = [address]
      if (!FHIRUtil.isEmpty(telecom)) patient.telecom = [telecom]

      patient.id = this.generateID(patient)

      if (patient.id) resolve(patient)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Patient): string {
    let value: string = ''

    if (resource.id) value += resource.id

    return FHIRUtil.hash(value)
  }

}
