// const onfhirBase = 'http://f4h.srdc.com.tr/fhir'
const onfhirBase = 'http://localhost:8080/fhir'
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
    },
    compatibleFhirVersions: ['4.0.0', '4.0.1']
  },
  hl7: hl7Base,
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
    Extension: `${hl7Base}/StructureDefinition/Extension`,
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
