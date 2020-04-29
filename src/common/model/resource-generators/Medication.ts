import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'

export class Medication implements Generator {

  Medication () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Medication> {
    const medication: fhir.Medication = { resourceType: 'Medication' } as fhir.Medication
    if (profile) medication.meta = { profile: [profile] }

    return new Promise<fhir.Medication>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Medication.id')) {
        medication.id = String(resource.get('Medication.id')?.value || '')
      }
      if (resource.has('Medication.status')) {
        const item = resource.get('Medication.status')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) medication.status = targetValue
        } else {
          medication.status = String(item.value)
        }
      }
      const manufacturer = FHIRUtil.searchForReference(keys, resource, 'Medication.manufacturer.Reference.')
      if (manufacturer) medication.manufacturer = manufacturer

      if (resource.has('Medication.code')) {
        const item = resource.get('Medication.code')
        if (item.conceptMap) {
          const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
          if (targetValue) medication.code = targetValue
        } else {
          medication.code = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
      }

      const medicationIngredient = keys.filter(_ => _.startsWith('Medication.ingredient'))
      if (medicationIngredient.length) {
        const ingredient: fhir.MedicationProductIngredient = {}
        if (resource.has('Medication.ingredient.item[x]') || resource.has('Medication.ingredient.item[x].CodeableConcept')) {
          const item = resource.get('Medication.ingredient.item[x]') || resource.get('Medication.ingredient.item[x].CodeableConcept')
          if (item.conceptMap) {
            const targetValue: fhir.CodeableConcept = FHIRUtil.getConceptMapTargetAsCodeable(item.conceptMap, String(item.value))
            if (targetValue) ingredient.itemCodeableConcept = targetValue
          } else {
            ingredient.itemCodeableConcept = DataTypeFactory.createCodeableConcept(
              DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
            )
          }
        }
        if (resource.has('Medication.ingredient.isActive')) {
          const item = resource.get('Medication.ingredient.isActive')
          if (item.conceptMap) {
            const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
            if (targetValue) ingredient.isActive = String(item.value).toLowerCase() === 'true'
          } else {
            ingredient.isActive = String(item.value).toLowerCase() === 'true'
          }
        }
        if (!FHIRUtil.isEmpty(ingredient)) {
          medication.ingredient = [ingredient]
        }
      }

      medication.id = this.generateID(medication)

      if (medication.id) resolve(medication)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Medication): string {
    let value: string = ''

    if (resource.id) {
      value += resource.id
    } else {
      if (resource.code?.coding && resource.code.coding.length) value += resource.code?.coding![0].code
    }

    return FHIRUtil.hash(value)
  }

}
