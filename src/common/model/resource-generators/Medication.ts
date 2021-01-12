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

      const _meta = keys.filter(_ => _.startsWith('Medication.meta'))
      if (_meta.length) {
        const meta: fhir.Meta = {}
        if (resource.has('Medication.meta.Meta.versionId')) {
          meta.versionId = String(resource.get('Medication.meta.Meta.versionId')?.value || '')
        }
        if (resource.has('Medication.meta.Meta.source')) {
          meta.source = String(resource.get('Medication.meta.Meta.source')?.value || '')
        }
        if (resource.has('Medication.meta.Meta.profile')) {
          meta.profile = [String(resource.get('Medication.meta.Meta.profile')?.value || '')]
        }
        if (resource.has('Medication.meta.Meta.security')) {
          const item = resource.get('Medication.meta.Meta.security')
          meta.security = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        if (resource.has('Medication.meta.Meta.tag')) {
          const item = resource.get('Medication.meta.Meta.tag')
          meta.tag = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        medication.meta = {...medication.meta, ...meta}
      }

      const medicationIdentifier = keys.filter(_ => _.startsWith('Medication.identifier'))
      if (medicationIdentifier.length) {
        const identifier: fhir.Identifier = {}
        if (resource.has('Medication.identifier.Identifier.system')) {
          identifier.system = String(resource.get('Medication.identifier.Identifier.system')?.value || '')
        }
        if (resource.has('Medication.identifier.Identifier.value')) {
          identifier.value = String(resource.get('Medication.identifier.Identifier.value')?.value || '')
        }

        medication.identifier = [identifier]
      }

      if (resource.has('Medication.status')) {
        medication.status = String(resource.get('Medication.status').value)
      }
      const manufacturer = FHIRUtil.searchForReference(keys, resource, 'Medication.manufacturer.Reference.')
      if (manufacturer) medication.manufacturer = manufacturer

      if (resource.has('Medication.code')) {
        const item = resource.get('Medication.code')
        medication.code = DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )
      }

      const medicationIngredient = keys.filter(_ => _.startsWith('Medication.ingredient'))
      if (medicationIngredient.length) {
        const ingredient: fhir.MedicationProductIngredient = {}
        if (resource.has('Medication.ingredient.item[x]') || resource.has('Medication.ingredient.item[x].CodeableConcept')) {
          const item = resource.get('Medication.ingredient.item[x]') || resource.get('Medication.ingredient.item[x].CodeableConcept')
          ingredient.itemCodeableConcept = DataTypeFactory.createCodeableConcept(
            DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
          )
        }
        if (resource.has('Medication.ingredient.isActive')) {
          const item = resource.get('Medication.ingredient.isActive')
          ingredient.isActive = String(item.value).toLowerCase() === 'true'
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
