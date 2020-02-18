import { FHIRUtil } from './../../utils/fhir-util'

export class ResourceFactory {

  /**
   * Generates an id considering different criteria for each resource type
   * @param resource
   */
  static generateID (resource: fhir.Resource): string {

    // Value specifying which fields make the resource unique
    let value: string = ''

    switch (resource.resourceType) {
      case 'Condition':
        const condition: fhir.Condition = resource as fhir.Condition
        if (condition.subject?.reference) value += condition.subject.reference
        if (condition.code?.coding && condition.code.coding.length) value += condition.code.coding[0].code
        if (condition.onsetDateTime) value += condition.onsetDateTime
        break
      case 'Observation':
        break
      default:
        break
    }

    return FHIRUtil.hash(value)

  }

}
