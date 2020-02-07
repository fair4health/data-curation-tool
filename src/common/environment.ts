// const onfhirBase = 'http://f4h.srdc.com.tr/fhir'
const onfhirBase = 'http://localhost:8080/fhir'

export let environment = {
  server: {
    config: {
      baseUrl: onfhirBase,
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/fhir+json;charset=UTF-8',
        'Content-Type': 'application/fhir+json;charset=UTF-8'
      }
    }
  },
  hl7: 'http://hl7.org/fhir',
  profiles: {
    patient_uv_ips: 'http://hl7.org/fhir/uv/ips/StructureDefinition/patient-uv-ips',
    practitioner_uv_ips: 'http://hl7.org/fhir/uv/ips/StructureDefinition/practitioner-uv-ips',
    condition_uv_ips: 'http://hl7.org/fhir/uv/ips/StructureDefinition/condition-uv-ips'
  }
}
