import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Device implements Generator {

  Device () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Device> {
    const device: fhir.Device = { resourceType: 'Device' } as fhir.Device
    if (profile) device.meta = { profile: [profile] }

    const udi: fhir.DeviceUdi = {}
    const deviceName: fhir.DeviceName = {}

    return new Promise<fhir.Device>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Device.id')) {
        device.id = String(resource.get('Device.id')?.value || '')
      }
      if (resource.has('Device.status')) {
        const item = resource.get('Device.status')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) device.status = targetValue
        } else {
          device.status = String(item.value)
        }
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
        const item = resource.get('Device.deviceName.type')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) deviceName.type = targetValue
        } else {
          deviceName.type = String(item.value)
        }
      }
      if (resource.has('Device.modelNumber')) {
        device.modelNumber = String(resource.get('Device.modelNumber').value)
      }
      if (resource.has('Device.partNumber')) {
        device.partNumber = String(resource.get('Device.partNumber').value)
      }
      if (resource.has('Device.type')) {
        const item = resource.get('Device.type')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) device.type = targetValue
        } else {
          device.type = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }

      if (resource.has('Device.udiCarrier.deviceIdentifier')) {
        udi.deviceIdentifier = String(resource.get('Device.udiCarrier.deviceIdentifier').value)
      }
      if (resource.has('Device.udiCarrier.issuer')) {
        udi.issuer = String(resource.get('Device.udiCarrier.issuer').value)
      }
      if (resource.has('Device.udiCarrier.jurisdiction')) {
        udi.jurisdiction = String(resource.get('Device.udiCarrier.jurisdiction').value)
      }
      if (resource.has('Device.udiCarrier.carrierAIDC')) {
        udi.carrierAIDC = String(resource.get('Device.udiCarrier.carrierAIDC').value)
      }
      if (resource.has('Device.udiCarrier.carrierHRF')) {
        udi.carrierHRF = String(resource.get('Device.udiCarrier.carrierHRF').value)
      }
      if (resource.has('Device.udiCarrier.entryType')) {
        const item = resource.get('Device.udiCarrier.entryType')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) device.status = targetValue
        } else {
          device.status = String(item.value)
        }
      }

      if (!FHIRUtil.isEmpty(udi)) device.udi = udi
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
