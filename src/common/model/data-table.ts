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
  { name: 'attr', required: true, label: 'Attribute', align: 'left', field: 'value', icon: 'fas fa-bars', sortable: true },
  { name: 'type', required: true, label: 'Type', align: 'left', field: 'type', icon: 'fas fa-spell-check' },
  { name: 'target', label: 'Target', align: 'center', field: 'target' }
]
export const mappingDataTableHeaders = [
  { name: 'status', align: 'center', label: 'Status', field: 'status', icon: 'fas fa-info-circle', classes: 'bg-grey-2', headerClasses: 'bg-primary text-white' },
  { name: 'file', align: 'left', label: 'File', field: 'file', icon: 'fas fa-file', sortable: true },
  { name: 'sheet', align: 'left', label: 'Sheet', field: 'sheet', icon: 'far fa-file-alt', sortable: true },
  { name: 'targets', align: 'right', label: 'Target Mappings', field: 'targets', icon: 'fas fa-hashtag', sortable: true }
]
