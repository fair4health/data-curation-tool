import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Device implements Generator {

  Device () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string): Promise<fhir.Device> {
    const device: fhir.Device = { resourceType: 'Device' } as fhir.Device
    device.meta = { profile: [environment.profiles[profile]] }

    const udi: fhir.DeviceUdi = {}
    const deviceName: fhir.DeviceName = {}

    return new Promise<fhir.Device>((resolve, reject) => {

      if (resource.has('Device.status')) {
        // TODO: https://www.hl7.org/fhir/valueset-device-status.html
        device.status = 'active'
      }
      if (resource.has('Device.patient')) {
        device.patient = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('Device.patient')!.value))}`})
      }
      if (resource.has('Device.patient.reference')) {
        device.patient = DataTypeFactory.createReference({reference: `Patient/${FHIRUtil.hash(String(resource.get('Device.patient.reference')!.value))}`})
      }
      if (resource.has('Device.owner')) {
        device.owner = DataTypeFactory.createReference({reference: `Organization/${FHIRUtil.hash(String(resource.get('Device.owner')!.value))}`})
      }
      if (resource.has('Device.owner.reference')) {
        device.owner = DataTypeFactory.createReference({reference: `Organization/${FHIRUtil.hash(String(resource.get('Device.owner.reference')!.value))}`})
      }
      if (resource.has('Device.location')) {
        device.location = DataTypeFactory.createReference({reference: `Location/${FHIRUtil.hash(String(resource.get('Device.location')!.value))}`})
      }
      if (resource.has('Device.location.reference')) {
        device.location = DataTypeFactory.createReference({reference: `Location/${FHIRUtil.hash(String(resource.get('Device.location.reference')!.value))}`})
      }
      if (resource.has('Device.url')) {
        device.url = String(resource.get('Device.url')!.value)
      }
      if (resource.has('Device.manufacturer')) {
        device.manufacturer = String(resource.get('Device.manufacturer')!.value)
      }
      if (resource.has('Device.lotNumber')) {
        device.lotNumber = String(resource.get('Device.lotNumber')!.value)
      }
      if (resource.has('Device.manufactureDate')) {
        const item = resource.get('Device.manufactureDate')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            device.manufactureDate = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Device.expirationDate')) {
        const item = resource.get('Device.expirationDate')!
        try {
          if (item.sourceType === 'Date') {
            let date = item.value
            if (!(item.value instanceof Date)) { date = new Date(String(item.value)) }
            device.expirationDate = DataTypeFactory.createDateString(date)
          }
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Device.serialNumber')) {
        device.serialNumber = String(resource.get('Device.serialNumber')!.value)
      }
      if (resource.has('Device.deviceName.name')) {
        deviceName.name = String(resource.get('Device.deviceName.name')!.value)
      }
      if (resource.has('Device.deviceName.type')) {
        // TODO: http://hl7.org/fhir/device-nametype
        // deviceName.type = String(resource.get('Device.deviceName.type')!.value)
        deviceName.type = 'manufacturer-name'
      }
      if (resource.has('Device.modelNumber')) {
        device.modelNumber = String(resource.get('Device.modelNumber')!.value)
      }
      if (resource.has('Device.partNumber')) {
        device.partNumber = String(resource.get('Device.partNumber')!.value)
      }
      if (resource.has('Device.type')) {
        const value = String(resource.get('Device.type')!.value)
        device.type = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.SNOMED, value))
      }

      if (resource.has('Device.udiCarrier.deviceIdentifier')) {
        udi.deviceIdentifier = String(resource.get('Device.udiCarrier.deviceIdentifier')!.value)
      }
      if (resource.has('Device.udiCarrier.issuer')) {
        udi.issuer = String(resource.get('Device.udiCarrier.issuer')!.value)
      }
      if (resource.has('Device.udiCarrier.jurisdiction')) {
        udi.jurisdiction = String(resource.get('Device.udiCarrier.jurisdiction')!.value)
      }
      if (resource.has('Device.udiCarrier.carrierAIDC')) {
        udi.carrierAIDC = String(resource.get('Device.udiCarrier.carrierAIDC')!.value)
      }
      if (resource.has('Device.udiCarrier.carrierHRF')) {
        udi.carrierHRF = String(resource.get('Device.udiCarrier.carrierHRF')!.value)
      }
      if (resource.has('Device.udiCarrier.entryType')) {
        // TODO: http://hl7.org/fhir/udi-entry-type
        // udi.entryType = String(resource.get('Device.udiCarrier.entryType')!.value)
        udi.entryType = 'barcode'
      }

      if (!FHIRUtil.isEmpty(udi)) device.udi = udi
      if (!FHIRUtil.isEmpty(deviceName)) device.deviceName = [deviceName]

      device.id = this.generateID(device)

      resolve(device)
    })
  }

  public generateID (resource: fhir.Device): string {
    let value: string = ''
    // TODO
    // if (resource.patient?.reference) value += resource.patient.reference
    // if (resource.deviceName?.name) value += resource.deviceName.name
    // if (resource.deviceName?.type) value += resource.deviceName.type
    // if (resource.modelNumber) value += resource.modelNumber
    if (resource.serialNumber) value += resource.serialNumber
    // if (resource.expirationDate) value += resource.expirationDate
    // if (resource.manufactureDate) value += resource.manufactureDate
    // if (resource.modelNumber) value += resource.modelNumber

    return FHIRUtil.hash(value)
  }

}
