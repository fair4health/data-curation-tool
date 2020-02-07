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
        resource.meta.profile = [environment.profiles.patient_uv_ips]
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
          resource.gender = value.toLowerCase()
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
            switch (targetSubFields[0]) {
              case 'text':
                resource.name[0].text = value
                break
              case 'family':
                resource.name[0].family = value
                break
              case 'given':
                resource.name[0].given = value.split(' ')
                break
              case 'prefix':
                resource.name[0].prefix = value.split(' ')
                break
              case 'suffix':
                resource.name[0].suffix = value.split(' ')
                break
            }
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
        default:
          resolve(true)
      }
    })

  }

}
