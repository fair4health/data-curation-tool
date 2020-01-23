import { FHIRUtils } from './../../utils/fhir-util'
import { environment } from './../../environment'

export class Practitioner {

  static generate (resource: fhir.Practitioner, field: string, fieldType: string | undefined, subfields: string[], value: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!resource.meta?.profile) {
        resource.meta = {}
        resource.meta.profile = [environment.profiles.practitioner_uv_ips]
      }
      switch (field) {
        case 'id':
          resource.id = String(value)
          const identifier: fhir.Identifier = {system: environment.server.config.baseUrl, value: String(value)}
          resource.identifier = [identifier]
          resolve(true)
          break
        case 'address':
          const address: fhir.Address = {}
          address.country = String(value)
          resource.address = [address]
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
          resource.telecom.push(FHIRUtils.createCodeableConcept(FHIRUtils.createCoding('system', 'code', String(value))))
          resolve(true)
          break
        default:
          resolve(true)
      }
    })

  }

}
