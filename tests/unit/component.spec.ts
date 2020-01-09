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

  it('Create Resource with given id', (done) => {
    fhirService.putResource(Patient)
      .then(res => {
        expect(res.status).to.equal(201)
        done()
      }, err => {
        expect(false).to.be.true
        done()
      })
  })

  it('Update Resource', (done) => {
    Patient.birthDate = '1990'
    fhirService.putResource(Patient)
      .then(res => {
        const updatedResource: fhir.Patient = res.data
        expect(res.status).to.equal(200)
        expect(updatedResource.birthDate).to.equal('1990')
        done()
      }, err => {
        expect(false).to.be.true
        done()
      })
  })

  it('Delete Resource', (done) => {
    fhirService.deleteResource(Patient)
      .then(res => {
        expect(res.status).to.equal(204)
        done()
      }, err => {
        expect(false).to.be.true
        done()
      })
  })

})
