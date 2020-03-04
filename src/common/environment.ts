// const onfhirBase = 'http://f4h.srdc.com.tr/fhir'
const onfhirBase = 'http://localhost:8080/fhir'
const IPSFhirBase = 'http://hl7.org/fhir/uv/ips'
const hl7Base = 'http://hl7.org/fhir'

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
  hl7: hl7Base,
  profiles: {
    'AllergyIntolerance-uv-ips': `${IPSFhirBase}/StructureDefinition/AllergyIntolerance-uv-ips`,
    'Condition-uv-ips': `${IPSFhirBase}/StructureDefinition/Condition-uv-ips`,
    'Device-observer-uv-ips': `${IPSFhirBase}/StructureDefinition/Device-observer-uv-ips`,
    'Device-uv-ips': `${IPSFhirBase}/StructureDefinition/Device-uv-ips`,
    'DeviceUseStatement-uv-ips': `${IPSFhirBase}/StructureDefinition/DeviceUseStatement-uv-ips`,
    'DiagnosticReport-uv-ips': `${IPSFhirBase}/StructureDefinition/DiagnosticReport-uv-ips`,
    'ImagingStudy-uv-ips': `${IPSFhirBase}/StructureDefinition/ImagingStudy-uv-ips`,
    'Immunization-uv-ips': `${IPSFhirBase}/StructureDefinition/Immunization-uv-ips`,
    'Medication-uv-ips': `${IPSFhirBase}/StructureDefinition/Medication-uv-ips`,
    'MedicationStatement-uv-ips': `${IPSFhirBase}/StructureDefinition/MedicationStatement-uv-ips`,
    'Observation-alcoholuse-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-alcoholuse-uv-ips`,
    'Observation-imaging-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-imaging-uv-ips`,
    'Observation-laboratory-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-laboratory-uv-ips`,
    'Observation-media-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-media-uv-ips`,
    'Observation-member-imaging-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-member-imaging-uv-ips`,
    'Observation-member-laboratory-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-member-laboratory-uv-ips`,
    'Observation-member-pathology-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-member-pathology-uv-ips`,
    'Observation-pathology-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-pathology-uv-ips`,
    'Observation-pregnancy-edd-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-pregnancy-edd-uv-ips`,
    'Observation-pregnancy-outcome-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-pregnancy-outcome-uv-ips`,
    'Observation-pregnancy-status-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-pregnancy-status-uv-ips`,
    'Observation-tobaccouse-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-tobaccouse-uv-ips`,
    'Observation-uv-ips': `${IPSFhirBase}/StructureDefinition/Observation-uv-ips`,
    'Organization-laboratory-uv-ips': `${IPSFhirBase}/StructureDefinition/Organization-laboratory-uv-ips`,
    'Organization-observation-uv-ips': `${IPSFhirBase}/StructureDefinition/Organization-observation-uv-ips`,
    'Patient-uv-ips': `${IPSFhirBase}/StructureDefinition/Patient-uv-ips`,
    'Practitioner-uv-ips': `${IPSFhirBase}/StructureDefinition/Practitioner-uv-ips`,
    'Procedure-uv-ips': `${IPSFhirBase}/StructureDefinition/Procedure-uv-ips`
  },
  codesystems: {
    ATC: 'http://www.whocc.no/atc',
    SNOMED: 'http://snomed.info/sct',
    LOINC: 'http://loinc.org'
  },
  datatypes: {
    Address: `${hl7Base}/StructureDefinition/Address`,
    Age: `${hl7Base}/StructureDefinition/Age`,
    Annotation: `${hl7Base}/StructureDefinition/Annotation`,
    Attachment: `${hl7Base}/StructureDefinition/Attachment`,
    CodeableConcept: `${hl7Base}/StructureDefinition/CodeableConcept`,
    Coding: `${hl7Base}/StructureDefinition/Coding`,
    ContactPoint: `${hl7Base}/StructureDefinition/ContactPoint`,
    Count: `${hl7Base}/StructureDefinition/Count`,
    Distance: `${hl7Base}/StructureDefinition/Distance`,
    Dosage: `${hl7Base}/StructureDefinition/Dosage`,
    Duration: `${hl7Base}/StructureDefinition/Duration`,
    HumanName: `${hl7Base}/StructureDefinition/HumanName`,
    Identifier: `${hl7Base}/StructureDefinition/Identifier`,
    Money: `${hl7Base}/StructureDefinition/Money`,
    Period: `${hl7Base}/StructureDefinition/Period`,
    Quantity: `${hl7Base}/StructureDefinition/Quantity`,
    Range: `${hl7Base}/StructureDefinition/Range`,
    Ratio: `${hl7Base}/StructureDefinition/Ratio`,
    Reference: `${hl7Base}/StructureDefinition/Reference`,
    SampledData: `${hl7Base}/StructureDefinition/SampledData`,
    Signature: `${hl7Base}/StructureDefinition/Signature`,
    Timing: `${hl7Base}/StructureDefinition/Timing`
  }
}
