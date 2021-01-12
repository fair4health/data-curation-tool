// const onfhirBase = 'http://f4h.srdc.com.tr/fhir'
const onfhirBase = 'http://localhost:8080/fhir'
const hl7Base = 'http://hl7.org/fhir'

export let environment = {
  toolID: 'data-curation-tool',
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
  langs: ['en'],
  databaseTypes: ['postgres'],
  hl7: hl7Base,
  codesystems: {
    ATC: 'http://www.whocc.no/atc',
    SNOMED: 'http://snomed.info/sct',
    LOINC: 'http://loinc.org',
    ICD_10: 'http://hl7.org/fhir/sid/icd-10'
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
    Meta: `${hl7Base}/StructureDefinition/Meta`,
    Money: `${hl7Base}/StructureDefinition/Money`,
    Period: `${hl7Base}/StructureDefinition/Period`,
    Quantity: `${hl7Base}/StructureDefinition/Quantity`,
    Range: `${hl7Base}/StructureDefinition/Range`,
    Ratio: `${hl7Base}/StructureDefinition/Ratio`,
    Reference: `${hl7Base}/StructureDefinition/Reference`,
    SampledData: `${hl7Base}/StructureDefinition/SampledData`,
    Signature: `${hl7Base}/StructureDefinition/Signature`,
    Timing: `${hl7Base}/StructureDefinition/Timing`
  },
  licenses: [
    {
      display: 'CC0 (No Rights Reserved)',
      description: 'Allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, with no conditions.',
      uri: 'https://creativecommons.org/publicdomain/zero/1.0/'
    },
    {
      display: 'CC BY (Attribution)',
      description: 'Allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use.',
      uri: 'https://creativecommons.org/licenses/by/4.0/'
    },
    {
      display: 'CC BY-SA (Attribution-ShareAlike)',
      description: 'Allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use. If you remix, adapt, or build upon the material, you must license the modified material under identical terms.',
      uri: 'https://creativecommons.org/licenses/by-sa/4.0/'
    },
    {
      display: 'CC BY-ND (Attribution-NoDerivs)',
      description: 'Allows reusers to copy and distribute the material in any medium or format in unadapted form only, and only so long as attribution is given to the creator. The license allows for commercial use.',
      uri: 'https://creativecommons.org/licenses/by-nd/4.0/'
    },
    {
      display: 'CC BY-NC (Attribution-NonCommercial)',
      description: 'Allows reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator. ',
      uri: 'https://creativecommons.org/licenses/by-nc/4.0/'
    },
    {
      display: 'CC BY-NC-SA (Attribution-NonCommercial-ShareAlike)',
      description: 'Allows reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator. If you remix, adapt, or build upon the material, you must license the modified material under identical terms.',
      uri: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
    },
    {
      display: 'CC BY-NC-ND (Attribution-NonCommercial-NoDerivs)',
      description: 'Allows reusers to copy and distribute the material in any medium or format in unadapted form only, for noncommercial purposes only, and only so long as attribution is given to the creator.',
      uri: 'https://creativecommons.org/licenses/by-nc-nd/4.0/'
    }
  ]
}
