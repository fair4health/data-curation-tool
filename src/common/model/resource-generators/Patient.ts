import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Patient implements Generator {

  Patient () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Patient> {
    const patient: fhir.Patient = { resourceType: 'Patient' } as fhir.Patient
    if (profile) patient.meta = { profile: [profile] }

    return new Promise<fhir.Patient>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Patient.id')) {
        patient.id = String(resource.get('Patient.id')?.value || '')
      }
      if (resource.has('Patient.active')) {
        const item = resource.get('Patient.active')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) patient.active = String(item.value).toLowerCase() === 'true'
        } else {
          patient.active = String(item.value).toLowerCase() === 'true'
        }
      }
      if (resource.has('Patient.gender')) {
        const item = resource.get('Patient.gender')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) patient.gender = targetValue
        } else {
          patient.gender = String(item.value)
        }
      }
      if (resource.has('Patient.maritalStatus')) {
        const item = resource.get('Patient.maritalStatus')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) patient.maritalStatus = targetValue
        }
      }
      const patientTelecom = keys.filter(_ => _.startsWith('Patient.telecom'))
      if (patientTelecom.length) {
        // TODO: ContactPoint.period
        const telecom: fhir.ContactPoint = {}
        if (resource.has('Patient.telecom.ContactPoint.system')) {
          const item = resource.get('Patient.telecom.ContactPoint.system')
          if (item.conceptMap) {
            const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
            if (targetValue) telecom.system = targetValue
          } else {
            telecom.system = String(item.value)
          }
        }
        if (resource.has('Patient.telecom.ContactPoint.value')) { telecom.value = String(resource.get('Patient.telecom.ContactPoint.value').value) }
        if (resource.has('Patient.telecom.ContactPoint.use')) {
          const item = resource.get('Patient.telecom.ContactPoint.use')
          if (item.conceptMap) {
            const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
            if (targetValue) telecom.use = targetValue
          } else {
            telecom.use = String(item.value)
          }
        }
        if (resource.has('Patient.telecom.ContactPoint.rank')) { telecom.rank = Number(resource.get('Patient.telecom.ContactPoint.rank').value) }

        const _telecom = DataTypeFactory.createContactPoint(telecom).toJSON()
        if (!FHIRUtil.isEmpty(_telecom)) {
          if (patient.telecom?.length) patient.telecom.push(_telecom)
          else patient.telecom = [_telecom]
        }
      }
      if (resource.has('Patient.birthDate')) {
        const item = resource.get('Patient.birthDate')

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
        const item = resource.get('Patient.deceased[x].dateTime')

        let date = item.value
        if (!(date instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
        try {

          patient.deceasedDateTime = date

        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Patient.deceased[x].boolean')) {
        const item = resource.get('Patient.deceased[x].boolean')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) patient.deceasedBoolean = String(item.value).toLowerCase() === 'true'
        } else {
          patient.deceasedBoolean = String(item.value).toLowerCase() === 'true'
        }
      }
      if (resource.has('Patient.multipleBirth[x].boolean')) {
        const item = resource.get('Patient.multipleBirth[x].boolean')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) patient.multipleBirthBoolean = String(item.value).toLowerCase() === 'true'
        } else {
          patient.multipleBirthBoolean = String(item.value).toLowerCase() === 'true'
        }

      }
      if (resource.has('Patient.multipleBirth[x].integer')) {
        const item = resource.get('Patient.multipleBirth[x].integer')

        patient.multipleBirthInteger = Number(item.value)
      }

      const patientName = keys.filter(_ => _.startsWith('Patient.name'))
      if (patientName.length) {
        // TODO: HumanName.period
        const name: fhir.HumanName = {}
        if (resource.has('Patient.name.HumanName.use')) {
          const item = resource.get('Patient.name.HumanName.use')
          if (item.conceptMap) {
            const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
            if (targetValue) name.use = targetValue
          } else {
            name.use = String(item.value)
          }
        }
        if (resource.has('Patient.name.HumanName.text')) { name.text = String(resource.get('Patient.name.HumanName.text').value) }
        if (resource.has('Patient.name.HumanName.family')) { name.family = String(resource.get('Patient.name.HumanName.family').value) }
        if (resource.has('Patient.name.HumanName.given')) { name.given = [String(resource.get('Patient.name.HumanName.given').value)] }
        if (resource.has('Patient.name.HumanName.pref"ix')) { name.prefix = [String(resource.get('Patient.name.HumanName.prefix').value)] }
        if (resource.has('Patient.name.HumanName.suffix')) { name.suffix = [String(resource.get('Patient.name.HumanName.suffix').value)] }

        const _name = DataTypeFactory.createHumanName(name).toJSON()
        if (!FHIRUtil.isEmpty(_name)) {
          if (patient.name?.length) patient.name.push(_name)
          else patient.name = [_name]
        }
      }

      const patientAddress = keys.filter(_ => _.startsWith('Patient.address'))
      if (patientAddress.length) {
        const address: fhir.Address = {}
        if (resource.has('Patient.address.Address.type')) { address.type = String(resource.get('Patient.address.Address.type').value) }
        if (resource.has('Patient.address.Address.text')) { address.text = String(resource.get('Patient.address.Address.text').value) }
        if (resource.has('Patient.address.Address.line')) { address.line = [String(resource.get('Patient.address.Address.line').value)] }
        if (resource.has('Patient.address.Address.city')) { address.city = String(resource.get('Patient.address.Address.city').value) }
        if (resource.has('Patient.address.Address.district')) { address.district = String(resource.get('Patient.address.Address.district').value) }
        if (resource.has('Patient.address.Address.state')) { address.state = String(resource.get('Patient.address.Address.state').value) }
        if (resource.has('Patient.address.Address.postalCode')) { address.postalCode = String(resource.get('Patient.address.Address.postalCode').value) }
        if (resource.has('Patient.address.Address.country')) { address.country = String(resource.get('Patient.address.Address.country').value) }

        const _address = DataTypeFactory.createAddress(address).toJSON()
        if (!FHIRUtil.isEmpty(_address)) {
          if (patient.address?.length) patient.address.push(_address)
          else patient.address = [_address]
        }
      }

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
