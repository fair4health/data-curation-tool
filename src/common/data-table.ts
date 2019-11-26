/**
 * Data Table cell types and headers
 */
export const cellType = {
  s: 'Text',
  b: 'Boolean',
  d: 'Date',
  n: 'Number'
}
export const sourceDataTableHeaders = [
  {
    name: 'attr',
    required: true,
    label: 'Attribute',
    align: 'left',
    field: 'value',
    sortable: true
  },
  {
    name: 'type',
    required: true,
    label: 'Type',
    align: 'center',
    field: 'type'
  },
  {
    name: 'target',
    label: 'Target',
    align: 'right',
    field: 'target'
  }
]
export const fhirDataTableHeaders = [
  {
    name: 'fhir-attr',
    required: true,
    label: 'Attribute',
    align: 'left',
    field: 'value'
  },
  {
    name: 'fhir-type',
    required: true,
    label: 'Type',
    align: 'center',
    field: 'type'
  }
]
