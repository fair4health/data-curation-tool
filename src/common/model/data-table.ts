/**
 * Data Table cell types and column contents
 */

import { QTable } from 'quasar'

export const cellType = {
  s: 'Text',
  b: 'Boolean',
  d: 'Date',
  n: 'Number'
}
export const savedMappingTable: QTable = {
  columns: [
    { name: 'date', label: 'Date modified', align: 'left', field: 'date', icon: 'today', sortable: true },
    { name: 'action', label: 'Actions', align: 'right' }
  ],
  pagination: { sortBy: 'date', descending: true, page: 1, rowsPerPage: 5 }
} as QTable

export const sourceDataTable: QTable = {
  columns: [
    { name: 'attr', required: true, label: 'Attribute', align: 'left', field: 'value', icon: 'fas fa-bars', sortable: true },
    { name: 'type', required: true, label: 'Type', align: 'left', field: 'type', icon: 'fas fa-spell-check' },
    { name: 'target', label: 'Target', align: 'left', field: 'target' },
    { name: 'conceptMap', label: 'Concept Map', align: 'right', field: 'conceptMap' }
  ],
  pagination: { page: 1, rowsPerPage: 10 }
} as QTable

export const validatorTable: QTable = {
  columns: [
    { name: 'status', align: 'center', label: 'Status', field: 'status', icon: 'fas fa-info-circle', classes: 'bg-grey-2', headerClasses: 'bg-primary text-white' },
    { name: 'file', align: 'left', label: 'File', field: 'file', icon: 'fas fa-file', sortable: true },
    { name: 'sheet', align: 'left', label: 'Sheet', field: 'sheet', icon: 'far fa-file-alt', sortable: true },
    { name: 'targets', align: 'center', label: 'Target Mappings', field: 'targets', icon: 'fas fa-hashtag', sortable: true }
  ],
  pagination: { page: 1, rowsPerPage: 0 }
} as QTable

export const transformerTable: QTable = {
  columns: [
    { name: 'status', label: 'Status', field: 'status', align: 'center', icon: 'fas fa-info-circle', classes: 'bg-grey-2' },
    { name: 'resourceType', label: 'Resource Type', field: 'resourceType', align: 'left', sortable: true },
    { name: 'count', label: 'Count', field: 'count', align: 'center', sortable: true },
    { name: 'createdCount', label: 'Created Count', field: 'createdCount', align: 'center', sortable: true },
    { name: 'action', label: 'Actions', align: 'right' }
  ],
  pagination: { page: 1, rowsPerPage: 0 }
} as QTable

export const mappingDetailTable: QTable = {
  columns: [
    { name: 'sourceField', label: 'Source Field', field: 'value', align: 'left', sortable: true },
    { name: 'targetField', label: 'Target Field', field: 'targetField', align: 'left', sortable: true },
    { name: 'targetType', label: 'Target Type', field: 'targetType', align: 'left', sortable: true },
    { name: 'defaultValue', label: 'Default Value', field: 'defaultValue', align: 'left', sortable: true },
    { name: 'fixedUri', label: 'Fixed Url', field: 'fixedUri', align: 'left', sortable: true },
    { name: 'conceptMap', label: 'Concept Map', field: 'conceptMap', align: 'left', sortable: true }
  ],
  pagination: { page: 1, rowsPerPage: 5 }
} as QTable
