import { expect } from 'chai'
import generators from '@/common/model/resource-generators'
import { cellType } from '@/common/model/data-table'
import { FHIRUtil } from '@/common/utils/fhir-util'
import { Generator } from '@/common/model/resource-generators/Generator'

describe('Test FHIR Resource Generators', () => {
  let bufferResourceMap: Map<string, BufferResource> = new Map<string, BufferResource>()
  let bufferResourceList: BufferResourceDefinition[] = []

  const patientMappingDetail: store.Record = {
    recordId: '5e79d65b',
    resource: 'Patient',
    profile: 'http://hl7.eu/fhir/f4h/StructureDefinition/Patient-eu-f4h',
    data: [
      {
        value: 'PatientId',
        type: 'Text',
        target: [
          {
            value: 'Patient.id'
          },
          {
            type: 'Identifier.value',
            value: 'Patient.identifier'
          }
        ]
      },
      {
        value: 'Gender',
        type: 'Text',
        target: [
          {
            value: 'Patient.gender'
          }
        ]
      },
      {
        value: 'Country',
        type: 'Text',
        target: [
          {
            type: 'Address.country',
            value: 'Patient.address'
          }
        ]
      },
      {
        value: 'Birthdate',
        type: 'Date',
        target: [
          {
            value: 'Patient.birthDate'
          }
        ]
      },
      {
        target: [
          {
            type: 'Identifier.system',
            value: 'Patient.identifier'
          }
        ],
        defaultValue: 'http://f4h.srdc.com.tr/fhir/demos/patient_id'
      }
    ]
  }
  const conditionMappingDetail: store.Record = {
    recordId: '2e35bdb2',
    resource: 'Condition',
    profile: 'http://hl7.eu/fhir/f4h/StructureDefinition/Condition-eu-f4h',
    data: [
      {
        value: 'conditionid',
        type: 'Text',
        target: [
          {
            value: 'Condition.id'
          },
          {
            type: 'Identifier.value',
            value: 'Condition.identifier'
          }
        ]
      },
      {
        value: 'encounterid',
        type: 'Text',
        target: [
          {
            type: 'Reference.Encounter',
            value: 'Condition.encounter'
          }
        ]
      },
      {
        value: 'patientid',
        type: 'Text',
        target: [
          {
            type: 'Reference.Patient',
            value: 'Condition.subject'
          }
        ]
      },
      {
        value: 'position',
        type: 'Text',
        target: [
          {
            value: 'Condition.category'
          }
        ]
      },
      {
        value: 'date',
        type: 'Text',
        target: [
          {
            type: 'dateTime',
            value: 'Condition.onset[x]'
          }
        ]
      },
      {
        value: 'conditioncode',
        type: 'Text',
        target: [
          {
            fixedUri: 'http://hl7.org/fhir/sid/icd-10',
            value: 'Condition.code'
          }
        ]
      },
      {
        target: [
          {
            type: 'Identifier.system',
            value: 'Condition.identifier'
          }
        ],
        defaultValue: 'http://f4h.srdc.com.tr/fhir/demos/condition_id'
      }
    ]
  }

  const patientData = {
    PatientId: 'p1',
    Gender: 'male',
    Country: 'ES',
    Birthdate: new Date('1945-04-23')
  }
  const conditionData = {
    conditionid: 'c1',
    encounterid: 'e1',
    patientid: 'p1',
    conditioncode: 'N18',
    date: new Date(),
    position: 1
  }

  beforeEach(() => {
    bufferResourceMap = new Map<string, BufferResource>()
    bufferResourceList = []
  })

  const createBufferResource = (mappingDetail: store.Record, data: any): Promise<any> => {
    return Promise.all(mappingDetail.data.map((sourceTargetGroup: store.SourceTargetGroup) => {
      return new Promise((resolveTargets) => {
        const entryValue: any = sourceTargetGroup.defaultValue || data[sourceTargetGroup.value]
        if (entryValue !== undefined && entryValue !== null && entryValue !== '') {
          let value = String(entryValue).trim()
          if (sourceTargetGroup.type === cellType.n) {
            value = value.replace(',', '.')
          }

          Promise.all(sourceTargetGroup.target.map((target: store.Target) => {
            // Buffer Resource creation
            const key = target.type ? `${target.value}.${target.type}` : target.value
            bufferResourceMap.set(key, FHIRUtil.cleanJSON({
              value,
              sourceType: sourceTargetGroup.type,
              targetType: target.type,
              fixedUri: target.fixedUri
            }))

          }))
            .then(() => resolveTargets())
            .catch(() => resolveTargets())
        } else resolveTargets()
      })
    }))
  }

  it('Should create a FHIR Patient resource from the buffer resource', (done) => {

    createBufferResource(patientMappingDetail, patientData)
      .then(() => {
        bufferResourceList.push({resourceType: patientMappingDetail.resource, profile: patientMappingDetail.profile, data: bufferResourceMap})
        Promise.all(bufferResourceList.map((bufferResourceDefinition: BufferResourceDefinition) => {
          return new Promise((resolve, reject) => {
            const generator: Generator = generators.get(bufferResourceDefinition.resourceType)

            generator.generateResource(bufferResourceDefinition.data, bufferResourceDefinition.profile)
              .then((patientResource: fhir.Patient) => {
                resolve(patientResource)
              }, (err) => {
                expect(JSON.stringify(err)).to.be.true
                reject()
              })
          })
        }))
          .then(res => {
            res.map((patientResource: fhir.Patient) => {
              expect(patientResource.meta.profile).include('http://hl7.eu/fhir/f4h/StructureDefinition/Patient-eu-f4h')
              expect(patientResource.resourceType).to.equal('Patient')
              expect(patientResource.gender).to.equal('male')
              expect(patientResource.birthDate).to.equal('1945-04-23')
              expect(patientResource.address).to.not.be.undefined
              expect(patientResource.address.length).to.equal(1)
              expect(patientResource.address[0].country).to.equal('ES')
              expect(patientResource.identifier).to.not.be.undefined
            })
          }, () => {
            expect(false).to.be.true
          })
          .then(done, done)
      })
      .then(null, done)
  })

  it('Should create a FHIR Condition resource from the buffer resource', (done) => {

    createBufferResource(conditionMappingDetail, conditionData)
      .then(() => {
        bufferResourceList.push({resourceType: conditionMappingDetail.resource, profile: conditionMappingDetail.profile, data: bufferResourceMap})
        Promise.all(bufferResourceList.map((bufferResourceDefinition: BufferResourceDefinition) => {
          return new Promise((resolve, reject) => {
            const generator: Generator = generators.get(bufferResourceDefinition.resourceType)

            generator.generateResource(bufferResourceDefinition.data, bufferResourceDefinition.profile)
              .then((conditionResource: fhir.Condition) => {
                resolve(conditionResource)
              }, (err) => {
                expect(JSON.stringify(err)).to.be.true
                reject()
              })
          })
        }))
          .then(res => {
            res.map((conditionResource: fhir.Condition) => {
              expect(conditionResource.meta.profile).include('http://hl7.eu/fhir/f4h/StructureDefinition/Condition-eu-f4h')
              expect(conditionResource.resourceType).to.equal('Condition')
              expect(conditionResource.identifier).to.not.be.undefined
              expect(conditionResource.code.coding).to.not.be.undefined
              const conditionCoding: fhir.Coding = conditionResource.code.coding[0]
              expect(conditionCoding.code).to.equal('N18')
              expect(conditionCoding.system).to.equal('http://hl7.org/fhir/sid/icd-10')
            })
          }, () => {
            expect(false).to.be.true
          })
          .then(done, done)
      })
      .then(null, done)
  })
})
