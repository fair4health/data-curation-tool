import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Device implements Generator {

  Device () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Device> {
    const device: fhir.Device = { resourceType: 'Device' } as fhir.Device
    if (profile) device.meta = { profile: [profile] }

    const udiCarrier: fhir.DeviceUdi = {}
    const deviceName: fhir.DeviceName = {name: '', type: ''}

    return new Promise<fhir.Device>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Device.id')) {
        device.id = String(resource.get('Device.id')?.value || '')
      }

      const _meta = keys.filter(_ => _.startsWith('Device.meta'))
      if (_meta.length) {
        const meta: fhir.Meta = {}
        if (resource.has('Device.meta.Meta.versionId')) {
          meta.versionId = String(resource.get('Device.meta.Meta.versionId')?.value || '')
        }
        if (resource.has('Device.meta.Meta.source')) {
          meta.source = String(resource.get('Device.meta.Meta.source')?.value || '')
        }
        if (resource.has('Device.meta.Meta.profile')) {
          meta.profile = [String(resource.get('Device.meta.Meta.profile')?.value || '')]
        }
        if (resource.has('Device.meta.Meta.security')) {
          const item = resource.get('Device.meta.Meta.security')
          meta.security = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        if (resource.has('Device.meta.Meta.tag')) {
          const item = resource.get('Device.meta.Meta.tag')
          meta.tag = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        device.meta = {...device.meta, ...meta}
      }

      const deviceIdentifier = keys.filter(_ => _.startsWith('Device.identifier'))
      if (deviceIdentifier.length) {
        const identifier: fhir.Identifier = {}
        if (resource.has('Device.identifier.Identifier.system')) {
          identifier.system = String(resource.get('Device.identifier.Identifier.system')?.value || '')
        }
        if (resource.has('Device.identifier.Identifier.value')) {
          identifier.value = String(resource.get('Device.identifier.Identifier.value')?.value || '')
        }

        device.identifier = [identifier]
      }

      if (resource.has('Device.status')) {
        device.status = String(resource.get('Device.status').value)
      }
      const patient = FHIRUtil.searchForReference(keys, resource, 'Device.patient.Reference.')
      if (patient) device.patient = patient

      const owner = FHIRUtil.searchForReference(keys, resource, 'Device.owner.Reference.')
      if (owner) device.owner = owner

      const location = FHIRUtil.searchForReference(keys, resource, 'Device.location.Reference.')
      if (location) device.location = location

      if (resource.has('Device.url')) {
        device.url = String(resource.get('Device.url').value)
      }
      if (resource.has('Device.manufacturer')) {
        device.manufacturer = String(resource.get('Device.manufacturer').value)
      }
      if (resource.has('Device.lotNumber')) {
        device.lotNumber = String(resource.get('Device.lotNumber').value)
      }
      if (resource.has('Device.manufactureDate')) {
        const item = resource.get('Device.manufactureDate')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          device.manufactureDate = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Device.expirationDate')) {
        const item = resource.get('Device.expirationDate')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          device.expirationDate = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Device.serialNumber')) {
        device.serialNumber = String(resource.get('Device.serialNumber')!.value)
      }
      if (resource.has('Device.deviceName.name')) {
        deviceName.name = String(resource.get('Device.deviceName.name')!.value)
      }
      if (resource.has('Device.deviceName.type')) {
        deviceName.type = String(resource.get('Device.deviceName.type').value)
      }
      if (resource.has('Device.modelNumber')) {
        device.modelNumber = String(resource.get('Device.modelNumber').value)
      }
      if (resource.has('Device.partNumber')) {
        device.partNumber = String(resource.get('Device.partNumber').value)
      }
      if (resource.has('Device.type')) {
        const item = resource.get('Device.type')
        device.type = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)}))
      }

      if (resource.has('Device.udiCarrier.deviceIdentifier')) {
        udiCarrier.deviceIdentifier = String(resource.get('Device.udiCarrier.deviceIdentifier').value)
      }
      if (resource.has('Device.udiCarrier.issuer')) {
        udiCarrier.issuer = String(resource.get('Device.udiCarrier.issuer').value)
      }
      if (resource.has('Device.udiCarrier.jurisdiction')) {
        udiCarrier.jurisdiction = String(resource.get('Device.udiCarrier.jurisdiction').value)
      }
      if (resource.has('Device.udiCarrier.carrierAIDC')) {
        udiCarrier.carrierAIDC = String(resource.get('Device.udiCarrier.carrierAIDC').value)
      }
      if (resource.has('Device.udiCarrier.carrierHRF')) {
        udiCarrier.carrierHRF = String(resource.get('Device.udiCarrier.carrierHRF').value)
      }
      if (resource.has('Device.udiCarrier.entryType')) {
        device.status = String(resource.get('Device.udiCarrier.entryType').value)
      }

      if (!FHIRUtil.isEmpty(udiCarrier)) device.udiCarrier = udiCarrier
      if (!FHIRUtil.isEmpty(deviceName)) device.deviceName = [deviceName]

      device.id = this.generateID(device)

      if (device.id) resolve(device)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Device): string {
    let value: string = ''
    // TODO: serialNumber ?
    if (resource.id) {
      value += resource.id
    } else {
      if (resource.serialNumber) value += resource.serialNumber
    }

    return FHIRUtil.hash(value)
  }

}
