// const onfhirBase = 'http://f4h.srdc.com.tr/fhir'
const onfhirBase = 'http://localhost:8080/fhir'
const IPSFhirBase = 'http://hl7.org/fhir/uv/ips'

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
    AllergyIntolerance_uv_ips: `${IPSFhirBase}/StructureDefinition/AllergyIntolerance-uv-ips`,
    Condition_uv_ips: `${IPSFhirBase}/StructureDefinition/Condition-uv-ips`,
    Device_uv_ips: `${IPSFhirBase}/StructureDefinition/Device-uv-ips`,
    DeviceUseStatement_uv_ips: `${IPSFhirBase}/StructureDefinition/DeviceUseStatement-uv-ips`,
    Device_observer_uv_ips: `${IPSFhirBase}/StructureDefinition/Device-observer-uv-ips`,
    DiagnosticReport_uv_ips: `${IPSFhirBase}/StructureDefinition/DiagnosticReport-uv-ips`,
    ImagingStudy_uv_ips: `${IPSFhirBase}/StructureDefinition/ImagingStudy-uv-ips`,
    Immunization_uv_ips: `${IPSFhirBase}/StructureDefinition/Immunization-uv-ips`,
    Medication_uv_ips: `${IPSFhirBase}/StructureDefinition/Medication-uv-ips`,
    MedicationStatement_uv_ips: `${IPSFhirBase}/StructureDefinition/MedicationStatement-uv-ips`,
    Observation_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-uv-ips`,
    Observation_alcoholuse_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-alcoholuse-uv-ips`,
    Observation_imaging_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-imaging-uv-ips`,
    Observation_laboratory_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-laboratory-uv-ips`,
    Observation_media_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-media-uv-ips`,
    Observation_member_imaging_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-member-imaging-uv-ips`,
    Observation_member_laboratory_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-member-laboratory-uv-ips`,
    Observation_member_pathology_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-member-pathology-uv-ips`,
    Observation_pathology_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-pathology-uv-ips`,
    Observation_pregnancy_edd_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-pregnancy-edd-uv-ips`,
    Observation_pregnancy_outcome_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-pregnancy-outcome-uv-ips`,
    Observation_pregnancy_status_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-pregnancy-status-uv-ips`,
    Observation_tobaccouse_uv_ips: `${IPSFhirBase}/StructureDefinition/Observation-tobaccouse-uv-ips`,
    Organization_observation_uv_ips: `${IPSFhirBase}/StructureDefinition/Organization-observation-uv-ips`,
    Organization_laboratory_uv_ips: `${IPSFhirBase}/StructureDefinition/Organization-laboratory-uv-ips`,
    Patient_uv_ips: `${IPSFhirBase}/StructureDefinition/Patient-uv-ips`,
    Practitioner_uv_ips: `${IPSFhirBase}/StructureDefinition/Practitioner-uv-ips`,
    Procedure_uv_ips: `${IPSFhirBase}/StructureDefinition/Procedure-uv-ips`
  }
}
