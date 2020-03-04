import { DataTypeFactory } from './../factory/data-type-factory'
import { environment } from './../../environment'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'

export class Medication implements Generator {

  Medication () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string): Promise<fhir.Medication> {
    const medication: fhir.Medication = { resourceType: 'Medication' } as fhir.Medication
    medication.meta = { profile: [environment.profiles[profile]] }

    const ingredient: fhir.MedicationProductIngredient = {}

    return new Promise<fhir.Medication>((resolve, reject) => {

      if (resource.has('Medication.code')) {
        const value = String(resource.get('Medication.code')!.value)
        medication.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.SNOMED, value, value))
      }
      if (resource.has('Medication.code.coding')) {
        const value = String(resource.get('Medication.code.coding')!.value)
        medication.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(environment.codesystems.SNOMED, value, value))
      }
      if (resource.has('Medication.ingredient.item[x]')) {
        ingredient.itemCodeableConcept = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(
          environment.codesystems.SNOMED, String(resource.get('Medication.ingredient.item[x]')!.value)))
      }
      if (resource.has('Medication.ingredient.item[x].CodeableConcept.coding')) {
        ingredient.itemCodeableConcept = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding(
          environment.codesystems.SNOMED, String(resource.get('Medication.ingredient.item[x].CodeableConcept.coding')!.value)))
      }

      if (!FHIRUtil.isEmpty(ingredient)) medication.ingredient = [ingredient]

      medication.id = this.generateID(medication)

      resolve(medication)
    })
  }

  public generateID (resource: fhir.Medication): string {
    let value: string = ''

    if (resource.code?.coding && resource.code.coding.length) value += resource.code?.coding![0].code

    return FHIRUtil.hash(value)
  }

}
