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

      const _meta = keys.filter(_ => _.startsWith('Patient.meta'))
      if (_meta.length) {
        const meta: fhir.Meta = {}
        if (resource.has('Patient.meta.Meta.versionId')) {
          meta.versionId = String(resource.get('Patient.meta.Meta.versionId')?.value || '')
        }
        if (resource.has('Patient.meta.Meta.source')) {
          meta.source = String(resource.get('Patient.meta.Meta.source')?.value || '')
        }
        if (resource.has('Patient.meta.Meta.profile')) {
          meta.profile = [String(resource.get('Patient.meta.Meta.profile')?.value || '')]
        }
        if (resource.has('Patient.meta.Meta.security')) {
          const item = resource.get('Patient.meta.Meta.security')
          meta.security = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        if (resource.has('Patient.meta.Meta.tag')) {
          const item = resource.get('Patient.meta.Meta.tag')
          meta.tag = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        patient.meta = {...patient.meta, ...meta}
      }

      const patientIdentifier = keys.filter(_ => _.startsWith('Patient.identifier'))
      if (patientIdentifier.length) {
        const identifier: fhir.Identifier = {}
        if (resource.has('Patient.identifier.Identifier.system')) {
          identifier.system = String(resource.get('Patient.identifier.Identifier.system')?.value || '')
        }
        if (resource.has('Patient.identifier.Identifier.value')) {
          identifier.value = String(resource.get('Patient.identifier.Identifier.value')?.value || '')
        }

        patient.identifier = [identifier]
      }

      if (resource.has('Patient.active')) {
        const item = resource.get('Patient.active')
        patient.active = String(item.value).toLowerCase() === 'true'
      }
      if (resource.has('Patient.gender')) {
        patient.gender = String(resource.get('Patient.gender').value)
      }
      if (resource.has('Patient.maritalStatus')) {
        const item = resource.get('Patient.maritalStatus')
        patient.maritalStatus = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
      }
      const patientTelecom = keys.filter(_ => _.startsWith('Patient.telecom'))
      if (patientTelecom.length) {
        // TODO: ContactPoint.period
        const telecom: fhir.ContactPoint = {}
        if (resource.has('Patient.telecom.ContactPoint.system')) {
          const item = resource.get('Patient.telecom.ContactPoint.system')
          telecom.system = String(item.value)
        }
        if (resource.has('Patient.telecom.ContactPoint.value')) {
          telecom.value = String(resource.get('Patient.telecom.ContactPoint.value').value)
        }
        if (resource.has('Patient.telecom.ContactPoint.use')) {
          const item = resource.get('Patient.telecom.ContactPoint.use')
          telecom.use = String(item.value)
        }
        if (resource.has('Patient.telecom.ContactPoint.rank')) {
          telecom.rank = Number(resource.get('Patient.telecom.ContactPoint.rank').value)
        }

        const _telecom = DataTypeFactory.createContactPoint(telecom).toJSON()
        if (!FHIRUtil.isEmpty(_telecom)) {
          if (patient.telecom?.length) patient.telecom.push(_telecom)
          else patient.telecom = [_telecom]
        }
      }
      if (resource.has('Patient.birthDate')) {
        const item = resource.get('Patient.birthDate')
        try {
          let date = item.value
          if (!(date instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          patient.birthDate = DataTypeFactory.shortenDate(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Patient.deceased[x].dateTime')) {
        const item = resource.get('Patient.deceased[x].dateTime')
        try {
          let date = item.value
          if (!(date instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          patient.deceasedDateTime = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Patient.deceased[x].boolean')) {
        const item = resource.get('Patient.deceased[x].boolean')
        patient.deceasedBoolean = String(item.value).toLowerCase() === 'true'
      }
      if (resource.has('Patient.multipleBirth[x].boolean')) {
        const item = resource.get('Patient.multipleBirth[x].boolean')
        patient.multipleBirthBoolean = String(item.value).toLowerCase() === 'true'
      }
      if (resource.has('Patient.multipleBirth[x].integer')) {
        patient.multipleBirthInteger = Number(resource.get('Patient.multipleBirth[x].integer').value)
      }

      const patientName = keys.filter(_ => _.startsWith('Patient.name'))
      if (patientName.length) {
        // TODO: HumanName.period
        const name: fhir.HumanName = {}
        if (resource.has('Patient.name.HumanName.use')) {
          const item = resource.get('Patient.name.HumanName.use')
          name.use = String(item.value)
        }
        if (resource.has('Patient.name.HumanName.text')) { name.text = String(resource.get('Patient.name.HumanName.text').value) }
        if (resource.has('Patient.name.HumanName.family')) { name.family = String(resource.get('Patient.name.HumanName.family').value) }
        if (resource.has('Patient.name.HumanName.given')) { name.given = [String(resource.get('Patient.name.HumanName.given').value)] }
        if (resource.has('Patient.name.HumanName.prefix')) { name.prefix = [String(resource.get('Patient.name.HumanName.prefix').value)] }
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
