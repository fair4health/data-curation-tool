import { expect } from 'chai'
import { TerminologyService } from '@/common/services/terminology.service'

describe('Test Terminology Service Methods', () => {

  // Init Terminology Service
  const terminologyService: TerminologyService = new TerminologyService()

  beforeEach(() => {
    // Set the base URL before each one because some will replace it
    terminologyService.setUrl('https://terminology-service.atosresearch.eu')
  })

  it('Should verify the service', (done) => {
    terminologyService.verify()
      .then(res => {
        expect(res.status).to.equal(200)
      }, () => {
        expect(false).to.be.true
      })
      .then(done, done)
  })

  it('Should not verify the wrong service', (done) => {
    terminologyService.setUrl('http://localhost:8282/fhir')
    terminologyService.verify()
      .then(res => {
        expect(false).to.be.true
      }, err => {
        expect(err.startsWith('Given terminology url is not verified.')).to.be.true
      })
      .then(done, done)
  })

  it('Should list the CodeSystems', (done) => {
    terminologyService.getCodeSystems()
      .then((codeSystems: string[]) => {
        expect(codeSystems.length).have.at.least(1)
      }, () => {
        expect(false).to.be.true
      })
      .then(done, done)
  })

  it('Should translate the value by source and target system', (done) => {
    const conceptMapList: store.ConceptMap[] = [
      {
        source: 'http://snomed.info/sct',
        value: '3415004',
        target: 'http://hl7.org/fhir/sid/icd-9-cm'
      }
    ]

    terminologyService.translateBatch(conceptMapList)
      .then(bundle => {
        const parametersEntry: fhir.BundleEntry[] = bundle.entry
        const bundleEntrySize: number = bundle.entry.length

        for (let j = 0; j < bundleEntrySize; j++) {
          const parametersParameters: fhir.ParametersParameter[] = (parametersEntry[j].resource as fhir.Parameters).parameter

          if (parametersParameters.find(_ => _.name === 'result')?.valueBoolean === true) {
            const matchConcept: fhir.ParametersParameter | undefined = parametersParameters.find(_ => _.name === 'match')?.part?.find(_ => _.name === 'concept')
            if (matchConcept) {
              expect(matchConcept.valueCoding.code).to.equal('782.5')
              expect(matchConcept.valueCoding.system).to.equal('http://hl7.org/fhir/sid/icd-9-cm')
            }
          }
        }
      }, () => {
        expect(false).to.be.true
      })
      .then(done, done)
  })

})
