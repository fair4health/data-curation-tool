
export class Resource {

  /**
   * Resource generator field by field
   * @param resource
   * @param options
   */
  static generate (
    resource: fhir.Patient | fhir.Practitioner | fhir.Condition | fhir.Observation | fhir.AllergyIntolerance
      | fhir.Medication | fhir.MedicationRequest | fhir.Location | fhir.Device | fhir.DeviceUseStatement
      | fhir.Appointment | fhir.ReferralRequest | fhir.Encounter,
    options: ResourceGenerator.Payload
  ) {}

}
