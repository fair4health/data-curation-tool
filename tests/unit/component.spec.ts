import { expect } from 'chai'
import { FhirService } from '@/common/services/fhir.service'
import 'isomorphic-fetch'

describe('Test FHIR Search', () => {
  const fhirService: FhirService = new FhirService()
  let Patient: fhir.Patient

  before(async () => {
    Patient = {
      resourceType: 'Patient',
      id: 'dd1199d8-11cf-4053-99f9-95ba5cdbe696',
      meta: {
        profile: [
          'http://hl7.org/fhir/uv/ips/StructureDefinition/patient-uv-ips'
        ]
      },
      active: true,
      gender: 'male',
      birthDate: '1996',
      name: [
        {
          text: 'Test Patient'
        }
      ]
    }
  })

  describe('SEARCH', () => {
    it('Search Resource - CapabilityStatement', (done) => {
      fhirService.search('CapabilityStatement', null)
        .then(res => {
          const bundle = res.data as fhir.Bundle
          expect(res.status).to.equal(200)
          expect(bundle.entry?.length).to.equal(1)
          done()
        }, err => {
          expect(false).to.be.true
          done()
        })
    })
    it('Get Resource by reference - StructureDefinition/Appointment', (done) => {
      fhirService.getResource('StructureDefinition/Appointment')
        .then(res => {
          const resource: fhir.Resource = res.data
          expect(res.status).to.equal(200)
          expect(resource.resourceType).to.equal('StructureDefinition')
          expect(resource.id).to.equal('Appointment')
          done()
        }, err => {
          expect(false).to.be.true
          done()
        })
    })
  })

  describe('CREATE', () => {
    it('Create - Delete', (done) => {
      fhirService.postResource(Patient)
        .then(res => {
          expect(res.status).to.equal(201)
          fhirService.deleteResource(res.data as fhir.Patient)
            .then(delRes => {
              expect(delRes.status).to.equal(204)
              done()
            }, err => {
              expect(false).to.be.true
              done()
            })
        }, err => {
          expect(false).to.be.true
          done()
        })
    })
  })

  describe('UPDATE', () => {
    it('Create - Update - Delete', (done) => {
      fhirService.postResource(Patient)
        .then(createdRes => {
          expect(createdRes.status).to.equal(201)
          const createdResource: fhir.Patient = createdRes.data
          createdResource.birthDate = '1982'

          // Update Resource
          fhirService.putResource(createdResource as fhir.Patient)
            .then(res => {
              const updatedResource: fhir.Patient = res.data
              expect(res.status).to.equal(200)
              expect(updatedResource.birthDate).to.equal('1982')

              // Delete Resource
              fhirService.deleteResource(res.data as fhir.Patient)
                .then(delRes => {
                  expect(delRes.status).to.equal(204)
                  done()
                }, err => {
                  expect(false).to.be.true
                  done()
                })

            }, err => {
              expect(false).to.be.true
              done()
            })

        }, err => {
          expect(false).to.be.true
          done()
        })
    })
  })

})
