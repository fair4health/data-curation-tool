import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Practitioner implements Generator {

  Practitioner () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Practitioner> {
    const practitioner: fhir.Practitioner = { resourceType: 'Practitioner' } as fhir.Practitioner
    if (profile) practitioner.meta = { profile: [profile] }

    const name: fhir.HumanName = {}
    const address: fhir.Address = {}
    const telecom: fhir.ContactPoint = {}

    return new Promise<fhir.Practitioner>((resolve, reject) => {

      if (resource.has('Practitioner.id')) { practitioner.id = String(resource.get('Practitioner.id')?.value || '') }
      if (resource.has('Practitioner.gender')) { practitioner.gender = 'male' }
      if (resource.has('Practitioner.telecom')) {
        telecom.system = 'phone'
        telecom.value = String(resource.get('Practitioner.telecom')!.value)
      }
      if (resource.has('Practitioner.birthDate')) {
        const item = resource.get('Practitioner.birthDate')!

        if (item.sourceType === 'Date') {
          let date = item.value
          if (!(date instanceof Date)) { date = new Date(String(item.value)) }
          try {

            practitioner.birthDate = date.getFullYear() + '-' +
              ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2)

          } catch (e) { log.error('Date insertion error.', e) }
        }
      }

      if (resource.has('Practitioner.name.text')) { name.text = String(resource.get('Practitioner.name.text')!.value) }
      if (resource.has('Practitioner.name.family')) { name.family = String(resource.get('Practitioner.name.family')!.value) }
      if (resource.has('Practitioner.name.given')) { name.given = [String(resource.get('Practitioner.name.given')!.value)] }
      if (resource.has('Practitioner.name.prefix')) { name.prefix = [String(resource.get('Practitioner.name.prefix')!.value)] }
      if (resource.has('Practitioner.name.suffix')) { name.suffix = [String(resource.get('Practitioner.name.suffix')!.value)] }

      if (resource.has('Practitioner.address.type')) { address.type = String(resource.get('Practitioner.address.type')!.value) }
      if (resource.has('Practitioner.address.text')) { address.text = String(resource.get('Practitioner.address.text')!.value) }
      if (resource.has('Practitioner.address.line')) { address.line = [String(resource.get('Practitioner.address.line')!.value)] }
      if (resource.has('Practitioner.address.city')) { address.city = String(resource.get('Practitioner.address.city')!.value) }
      if (resource.has('Practitioner.address.district')) { address.district = String(resource.get('Practitioner.address.district')!.value) }
      if (resource.has('Practitioner.address.state')) { address.state = String(resource.get('Practitioner.address.state')!.value) }
      if (resource.has('Practitioner.address.postalCode')) { address.postalCode = String(resource.get('Practitioner.address.postalCode')!.value) }
      if (resource.has('Practitioner.address.country')) { address.country = String(resource.get('Practitioner.address.country')!.value) }

      if (!FHIRUtil.isEmpty(name)) practitioner.name = [name]
      if (!FHIRUtil.isEmpty(address)) practitioner.address = [address]
      if (!FHIRUtil.isEmpty(telecom)) practitioner.telecom = [telecom]

      practitioner.id = this.generateID(practitioner)

      if (practitioner.id) resolve(practitioner)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Practitioner): string {
    let value: string = ''

    if (resource.id) value += resource.id

    return FHIRUtil.hash(value)
  }

}
