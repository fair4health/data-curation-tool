import { Address, Age, AllergyIntoleranceReaction, AppointmentParticipant, Attachment, CareTeamMember, CodeableConcept,
  Coding, ContactPoint, FamilyMemberHistoryCondition, GoalTarget, HumanName, Identifier, Note, OrganizationContact,
  Period, Quantity, Range, Ratio, ReferenceRange, Timing, AuditEventSource, AuditEventAgentNetwork, AuditEventAgent, Reference
} from '../data-type-model'

export class DataTypeFactory {

  static createAddress (address: fhir.Address): Address { return address ? new Address(address) : null }
  static createAge (age: fhir.Age): Age { return age ? new Age(age) : null }
  static createAppointmentParticipant (appointmentParticipant: fhir.AppointmentParticipant): AppointmentParticipant {
    return appointmentParticipant ? new AppointmentParticipant(appointmentParticipant) : null
  }
  static createAttachment (attachment: fhir.Attachment): Attachment { return attachment ? new Attachment(attachment) : null }
  static createAuditEventAgent (auditEventAgent: fhir.AuditEventAgent): AuditEventAgent {
    return auditEventAgent ? new AuditEventAgent(auditEventAgent) : null
  }
  static createAuditEventAgentNetwork (auditEventAgentNetwork: fhir.AuditEventAgentNetwork): AuditEventAgentNetwork {
    return auditEventAgentNetwork ? new AuditEventAgentNetwork(auditEventAgentNetwork) : null
  }
  static createAuditEventSource (auditEventSource: fhir.AuditEventSource): AuditEventSource {
    return auditEventSource ? new AuditEventSource(auditEventSource) : null
  }
  static createCareTeamMember (careTeamMember: fhir.CareTeamParticipant): CareTeamMember {
    return careTeamMember ? new CareTeamMember(careTeamMember) : null
  }
  static createCodeableConcept (coding: fhir.Coding): CodeableConcept {
    return coding ? new CodeableConcept({coding: [coding]}) : null
  }
  static createCoding (coding: fhir.Coding): Coding { return coding ? new Coding(coding) : null }
  static createContactPoint (contactPoint: fhir.ContactPoint): ContactPoint { return contactPoint ? new ContactPoint(contactPoint) : null }
  // static createDosage (dosage: fhir.DosageInstruction): Dosage { return dosage ? new Dosage(dosage) : null }
  static createGoalTarget (target: fhir.GoalTarget): GoalTarget { return target ? new GoalTarget(target) : null }
  static createHumanName (humanName: fhir.HumanName): HumanName { return humanName ? new HumanName(humanName) : null }
  static createIdentifier (identifier: fhir.Identifier): Identifier { return identifier ? new Identifier(identifier) : null }
  static createNote (note: fhir.Annotation): Note { return note ? new Note(note) : null }
  static createOrganizationContact (contact: fhir.OrganizationContact): OrganizationContact {
    return contact ? new OrganizationContact(contact) : null
  }
  static createPeriod (period: fhir.Period) { return period ? new Period(period) : null }
  static createQuantity (quantity: fhir.Quantity) { return quantity ? new Quantity(quantity) : null }
  static createRange (range: fhir.Range): Range { return range ? new Range(range) : null }
  static createRatio (ratio: fhir.Ratio): Ratio { return ratio ? new Ratio(ratio) : null }
  static createReference (reference: fhir.Reference): Reference { return reference ? new Reference(reference) : null }
  static createReferenceRange (referenceRange: fhir.ObservationReferenceRange): ReferenceRange {
    return referenceRange ? new ReferenceRange(referenceRange) : null
  }
  static createTiming (timing: fhir.Timing): Timing { return timing ? new Timing(timing) : null }
  static createAllergyIntoleranceReaction (reaction: fhir.AllergyIntoleranceReaction): AllergyIntoleranceReaction {
    return reaction ? new AllergyIntoleranceReaction(reaction) : null
  }
  static createFamilyMemberHistoryCondition (fmhCondition: fhir.FamilyMemberHistoryCondition): FamilyMemberHistoryCondition {
    return fmhCondition ? new FamilyMemberHistoryCondition(fmhCondition) : null
  }
  static createDate (date: any): Date {
    return date ? new Date(date) : null
  }
  static createDateString (date: Date): string {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
  }

}
