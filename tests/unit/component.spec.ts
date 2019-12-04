import {expect} from 'chai'
import {FhirService} from '@/common/services/fhir.service'

describe('Test FHIR Search', () => {
  it('Search CapabilityStatement', (done) => {
    const fhirService = new FhirService()
    fhirService.search('CapabilityStatement', {})
      .then(bundle => {
        expect(bundle.entry?.length).to.greaterThan(0)
        done()
      })
      .catch(() => {
        expect(false).to.be.true
        done()
      })
  })
  it('Search StructureDefinition by id - Appointment', (done) => {
    const fhirService = new FhirService()
    fhirService.search('StructureDefinition', {_id: 'Appointment'})
      .then(bundle => {
        expect(bundle.entry?.length).to.greaterThan(0)
        done()
      })
      .catch(() => {
        expect(false).to.be.true
        done()
      })
  })
});
