import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { Resource } from './Resource'

export class Practitioner extends Resource {

  static generate (resource: fhir.Practitioner, payload: ResourceGenerator.Payload): Promise<any> {

    const {value, sourceType, targetField, targetSubFields, fhirType} = payload

    return new Promise<any>((resolve, reject) => {
      if (!resource.meta?.profile) {
        resource.meta = {}
        resource.meta.profile = [environment.profiles.practitioner_uv_ips]
      }
      switch (targetField) {
        case 'id':
          resource.id = value
          const identifier: fhir.Identifier = {system: environment.server.config.baseUrl, value}
          resource.identifier = [identifier]
          resolve(true)
          break
        case 'address':
          const address: fhir.Address = {}
          address.country = value
          resource.address = [address]
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
        default:
          resolve(true)
      }
    })

  }

}
