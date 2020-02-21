import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { Resource } from './Resource'

export class Patient extends Resource {

  // TODO: Check nested field values ex: name -> [given, family, prefix] or contact -> [...]

  static generate (resource: fhir.Patient, payload: ResourceGenerator.Payload): Promise<any> {

    const {value, sourceType, targetField, targetSubFields, fhirType} = payload

    return new Promise<any>((resolve, reject) => {
      if (!resource.meta?.profile) {
        resource.meta = {}
        resource.meta.profile = [environment.profiles.Patient_uv_ips]
      }
      switch (targetField) {
        case 'id':
          resource.id = value
          const identifier: fhir.Identifier = {system: environment.server.config.baseUrl, value}
          resource.identifier = [identifier]
          resolve(true)
          break
        case 'address':
          const address: fhir.Address = resource.address?.length ? resource.address[0] : {}
          if (!targetSubFields.length) {
            address.country = value
          } else {
            if (targetSubFields[0] === 'line') {
              address.line = [value]
            } else {
              address[targetSubFields[0]] = value
            }
          }
          resource.address = [address]
          resolve(true)
          break
        case 'gender':
          resource.gender = 'male'
          resolve(true)
          break
        case 'birthDate':
          if (sourceType === 'Date') {
            let date = value
            if (!(date instanceof Date)) {
              date = new Date(value)
            }
            try {
              resource.birthDate = date.getFullYear() + '-' +
                ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2)
            } catch (e) {
              reject(e)
            }
          }
          resolve(true)
          break
        case 'name':
          if (!targetSubFields.length) {
            const given = value.split(' ')
            const family = given.pop()
            resource.name = [] as fhir.HumanName[]
            resource.name.push({ family, given })
          } else {
            if (!resource.name?.length)
              resource.name = [{}] as fhir.HumanName[]
            if (targetSubFields[0] === 'text' || targetSubFields[0] === 'family')
              resource.name[0][targetSubFields[0]] = value
            else
              resource.name[0][targetSubFields[0]] = value.split(' ')

          }
          resolve(true)
          break
        case 'telecom':
          resource.telecom = [] as fhir.ContactPoint[]
          resource.telecom.push(DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('system', 'code', value)))
          resolve(true)
          break
        case 'contact':
          // TODO
          resolve(true)
          break
        case 'deceased[x]':
          if (fhirType === 'dateTime') {
            let date = value
            if (!(date instanceof Date)) {
              date = new Date(value)
            }
            try {
              resource.deceasedDateTime = date.getFullYear() + '-' +
                ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2)
            } catch (e) {
              reject(e)
            }
          } else if (fhirType === 'boolean') {
            // TODO
            resource.deceasedBoolean = !!value
          }
          resolve(true)
          break
        default:
          resolve(true)
      }
    })

  }

}
