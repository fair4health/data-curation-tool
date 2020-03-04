
export interface Generator {

  /**
   * Resource generator
   * Generates FHIR Resource from crude data
   * @param resource
   * @param profile
   */
  generateResource (resource: Map<string, BufferResource>, profile: string): Promise<any>

  /**
   * Generates an id considering different criteria for each resource type
   * @param resource
   */
  generateID (resource: fhir.Resource): string

}
