import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'

export class Patient {

  // TODO: Check nested field values ex: name -> [given, family, prefix] or contact -> [...]

  static generate (resource: fhir.Patient, field: string, fieldType: string | undefined, subfields: string[], value: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!resource.meta?.profile) {
        resource.meta = {}
        resource.meta.profile = [environment.profiles.patient_uv_ips]
      }
      switch (field) {
        case 'id':
          resource.id = String(value)
          const identifier: fhir.Identifier = {system: environment.server.config.baseUrl, value: String(value)}
          resource.identifier = [identifier]
          resolve(true)
          break
        case 'address':
          const address: fhir.Address = resource.address?.length ? resource.address[0] : {}
          if (!subfields.length) {
            address.country = String(value)
          } else {
            if (subfields[0] === 'line') {
              address.line = [String(value)]
            } else {
              address[subfields[0]] = String(value)
            }
          }
          resource.address = [address]
          resolve(true)
          break
        case 'gender':
          resource.gender = String(value).toLowerCase()
          resolve(true)
          break
        case 'birthDate':
          if (fieldType === 'Date') {
            if (!(value instanceof Date)) {
              value = new Date(String(value))
            }
            resource.birthDate = value.getFullYear() + '-' +
              ('0' + (value.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + value.getUTCDate()).slice(-2)
          }
          resolve(true)
          break
        case 'name':
          if (!subfields.length) {
            const given = String(value).split(' ')
            const family = given.pop()
            resource.name = [] as fhir.HumanName[]
            resource.name.push({ family, given })
          } else {
            if (!resource.name?.length)
              resource.name = [{}] as fhir.HumanName[]
            switch (subfields[0]) {
              case 'text':
                resource.name[0].text = String(value)
                break
              case 'family':
                resource.name[0].family = String(value)
                break
              case 'given':
                resource.name[0].given = String(value).split(' ')
                break
              case 'prefix':
                resource.name[0].prefix = String(value).split(' ')
                break
              case 'suffix':
                resource.name[0].suffix = String(value).split(' ')
                break
            }
          }
          resolve(true)
          break
        case 'telecom':
          resource.telecom = [] as fhir.ContactPoint[]
          resource.telecom.push(DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding('system', 'code', String(value))))
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
