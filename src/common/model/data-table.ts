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
    { name: 'date', label: 'TABLE.DATE_MODIFIED', align: 'left', field: 'date', icon: 'today', sortable: true },
    { name: 'action', label: 'TABLE.ACTIONS', align: 'right' }
  ],
  pagination: { sortBy: 'date', descending: true, page: 1, rowsPerPage: 5 }
} as QTable

export const sourceDataTable: QTable = {
  columns: [
    { name: 'attr', required: true, label: 'TABLE.ATTRIBUTE', align: 'left', field: 'value', icon: 'fas fa-bars', sortable: true },
    { name: 'type', required: true, label: 'TABLE.TYPE', align: 'left', field: 'type', icon: 'fas fa-spell-check' },
    { name: 'target', label: 'TABLE.TARGET', align: 'left', field: 'target' },
    { name: 'conceptMap', label: 'TABLE.CONCEPT_MAP', align: 'right', field: 'conceptMap' }
  ],
  pagination: { page: 1, rowsPerPage: 10 }
} as QTable

export const validatorTable: QTable = {
  columns: [
    { name: 'status', align: 'center', label: 'TABLE.STATUS', field: 'status', icon: 'fas fa-info-circle', classes: 'bg-grey-2', headerClasses: 'bg-primary text-white' },
    { name: 'file', align: 'left', label: 'TABLE.FILE', field: 'file', icon: 'fas fa-file', sortable: true },
    { name: 'sheet', align: 'left', label: 'TABLE.SHEET', field: 'sheet', icon: 'far fa-file-alt', sortable: true },
    { name: 'targets', align: 'center', label: 'TABLE.TARGET_MAPPINGS', field: 'targets', icon: 'fas fa-hashtag', sortable: true }
  ],
  pagination: { page: 1, rowsPerPage: 0 }
} as QTable

export const transformerTable: QTable = {
  columns: [
    { name: 'status', label: 'TABLE.STATUS', field: 'status', align: 'left', icon: 'fas fa-info-circle', classes: 'bg-grey-2' },
    { name: 'resourceType', label: 'TABLE.RESOURCE_TYPE', field: 'resourceType', align: 'left', sortable: true },
    { name: 'count', label: 'TABLE.COUNT', field: 'count', align: 'center', sortable: true },
    { name: 'createdCount', label: 'TABLE.CREATED_COUNT', field: 'createdCount', align: 'center', sortable: true },
    { name: 'action', label: 'TABLE.ACTIONS', align: 'right' }
  ],
  pagination: { page: 1, rowsPerPage: 0 }
} as QTable

export const mappingDetailTable: QTable = {
  columns: [
    { name: 'sourceField', label: 'TABLE.SOURCE_FIELD', field: 'value', align: 'left', sortable: true },
    { name: 'targetField', label: 'TABLE.TARGET_FIELD', field: 'targetField', align: 'left', sortable: true },
    { name: 'targetType', label: 'TABLE.TARGET_TYPE', field: 'targetType', align: 'left', sortable: true },
    { name: 'defaultValue', label: 'TABLE.DEFAULT_VALUE', field: 'defaultValue', align: 'left', sortable: true },
    { name: 'fixedUri', label: 'TABLE.FIXED_URL', field: 'fixedUri', align: 'left', sortable: true },
    { name: 'conceptMap', label: 'TABLE.CONCEPT_MAP', field: 'conceptMap', align: 'left', sortable: true }
  ],
  pagination: { page: 1, rowsPerPage: 5 }
} as QTable

export const outcomeDetailTable: QTable = {
  columns: [
    { name: 'status', label: 'TABLE.STATUS', field: 'status', align: 'center', icon: 'fas fa-info-circle',
      classes: 'bg-grey-2', headerClasses: 'bg-primary text-white col-1 outcome-table-column' },
    { name: 'resourceType', label: 'TABLE.RESOURCE_TYPE', field: 'resourceType', align: 'center', sortable: true,
      classes: 'bg-grey-1', headerClasses: 'bg-grey-4 text-grey-10 col-1 outcome-table-column' },
    { name: 'message', label: 'TABLE.DETAILS', field: 'message', align: 'left', sortable: true }
  ],
  pagination: { page: 1, rowsPerPage: 10 }
} as QTable
