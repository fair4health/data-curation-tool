import { expect } from 'chai'
import generators from '@/common/model/resource-generators'
import { cellType } from '@/common/model/data-table'
import { FHIRUtil } from '@/common/utils/fhir-util'
import { Generator } from '@/common/model/resource-generators/Generator'

describe('FHIR Resource Generator Tests', () => {
  const bufferResourceMap: Map<string, BufferResource> = new Map<string, BufferResource>()
  const bufferResourceList: BufferResourceDefinition[] = []
  const mappingDetail: store.Record = {
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

  const sourceEntry = {
    PatientId: '1',
    Gender: 'male',
    Country: 'ES',
    Birthdate: new Date('1945-04-23')
  }

  it('Should create a FHIR Patient resource from the buffer resource', (done) => {

    Promise.all(mappingDetail.data.map((sourceTargetGroup: store.SourceTargetGroup) => {
      return new Promise((resolveTargets) => {
        const entryValue: any = sourceTargetGroup.defaultValue || sourceEntry[sourceTargetGroup.value]
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
      .then(() => {
        bufferResourceList.push({resourceType: mappingDetail.resource, profile: mappingDetail.profile, data: bufferResourceMap})
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
})
