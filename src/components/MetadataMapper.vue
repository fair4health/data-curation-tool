<template>
  <div>
    <q-toolbar class="bg-grey-4 top-fix-column">
      <q-toolbar-title class="text-grey-8">
        Curation - <span class="text-subtitle1">Metadata Mapper</span>
      </q-toolbar-title>
    </q-toolbar>
    <div class="q-ma-sm">
      <q-expansion-item
        default-opened
        class="q-mt-md col-12"
        icon="add"
        label="New Mapping"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
        :expand-icon-toggle="true"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="add" />
          </q-item-section>

          <q-item-section>
            New Mapping
          </q-item-section>
        </template>
        <q-card bordered class="bg-white">
          <q-splitter v-model="splitPercentage" :limits="[20, 80]" separator-class="bg-grey-4 separator-style"
                      :horizontal="$q.screen.lt.sm" class="row">

            <!--Data Source Part-->
            <template v-slot:before>
              <FhirResourceTable ref="fhirResourceComp" />
            </template>

            <!--Splitter Separator-->
            <template v-slot:separator>
              <q-icon color="grey-7" size="xs" name="drag_indicator" />
            </template>

            <!--FHIR Resource Part-->
            <template v-slot:after>
              <DataSourceTable />
            </template>
          </q-splitter>
          <q-separator />
          <q-card-section class="row">
            <q-btn :disable="tickedFHIRAttr.length !== 1" outline label="Assign Default Value"
                   color="grey-8" @click="openDefaultValueAssigner" no-caps />
            <q-space />
            <div class="q-gutter-sm">
              <q-btn :disable="!(tickedFHIRAttr.length && selectedAttr.length)" unelevated label="Match"
                     color="grey-2" text-color="primary" @click="matchFields" no-caps />
              <q-btn unelevated v-show="!editRecordId" color="positive" label="Add Mapping" icon="check" @click="addRecord" no-caps />
              <q-btn unelevated v-show="editRecordId" color="primary" label="Update" icon="edit" @click="addRecord" no-caps />
              <q-btn unelevated v-show="editRecordId" color="negative" label="Close Edit Mode" @click="closeEditMode" no-caps />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item
        default-opened
        class="q-mt-md col-12"
        icon="list"
        label="Mappings"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
        :expand-icon-toggle="true"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="list" text-color="white" />
          </q-item-section>

          <q-item-section>
            Mappings
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-sm">
              <q-btn unelevated label="Export" color="negative" text-color="white" @click="exportState" icon="publish" no-caps />
              <q-btn unelevated label="Save" color="secondary" text-color="white" @click="saveState" icon="save" no-caps />
            </div>
          </q-item-section>
        </template>
        <q-card bordered>
          <q-card-section class="text-subtitle1">
            <q-list v-if="savedRecords.length" class="row">
              <q-expansion-item popup v-for="file in savedRecords" :key="file.fileName"
                                default-opened
                                group="savedRecords"
                                class="col-12"
                                icon="fas fa-file"
                                :label="file.fileName"
                                header-class="bg-secondary text-grey-1 text-subtitle2"
                                expand-icon-class="text-white"
              >
                <div v-for="sheet in file.sheets" :key="sheet.sheetName" class="q-pa-md">
                  <div class="row text-grey-6 text-weight-bold">{{ sheet.sheetName }}</div>
                  <q-separator spaced />
                  <div class="row">
                    <div v-for="(record, index) in sheet.records" :key="index" class="col-xs-12 col-sm-6 col-md-4">
                      <q-card class="q-ma-xs" bordered flat>
                        <q-card-section class="text-caption bg-grey-3 text-weight-bold q-pa-xs">
                          <div class="row items-center">
                            <q-chip square class="text-grey-7 text-size-md" color="grey-4">#{{ record.recordId }}</q-chip>
                            <q-space />
                            <div class="q-gutter-xs">
                              <q-btn flat round dense size="sm" icon="visibility" color="grey-9"
                                     @click="openMappingDetail(file.fileName, sheet.sheetName, record)" />
                              <q-btn flat round dense size="sm" icon="edit" color="grey-9"
                                     @click="editRecord(file.fileName, sheet.sheetName, record.recordId)" />
                              <q-btn unelevated round dense size="sm" icon="close" color="white" text-color="grey-9"
                                     @click="removeRecordPopup(file.fileName, sheet.sheetName, record.recordId)" />
                            </div>
                          </div>
                          <div class="row ellipsis no-wrap">
                            <div class="text-grey-8 ellipsis no-wrap text-weight-regular">
                              <div class="row no-wrap">
                                <q-chip square class="text-grey-8 text-size-sm" color="white">
                                  <span class="text-weight-bold ellipsis"> {{ record.resource }}</span>
                                  <q-tooltip content-class="bg-grey-2 text-primary">{{record.resource}}</q-tooltip>
                                </q-chip>
                                <q-chip square class="text-grey-8 ellipsis text-size-sm" color="white">
                                  <span class="ellipsis">{{ record.profile || '-' }}</span>
                                  <q-tooltip content-class="bg-grey-2 text-primary">{{ record.profile }}</q-tooltip>
                                </q-chip>
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                        <q-card-section>
                          <q-list separator>
                            <q-item v-for="(column, index) in record.data" :key="index">
                              <div class="col-3 ellipsis text-size-md">
                                <span v-if="column.value">
                                  {{ column.value }}
                                </span>
                                <q-chip v-else-if="column.defaultValue" dense square
                                        color="grey-4" text-color="grey-8" class="q-pa-sm no-margin">
                                  <div class="ellipsis text-size-md">
                                    <q-icon name="fas fa-thumbtack" class="q-mr-xs" />
                                    {{ column.defaultValue }}
                                  </div>
                                  <q-tooltip>{{ column.defaultValue }}</q-tooltip>
                                </q-chip>
                              </div>
                              <div class="row col">
                                <q-chip dense removable v-for="(target, targetI) in column.target" :key="targetI"
                                        color="orange" text-color="white"
                                        @remove="removeMatching(file.fileName, sheet.sheetName, record.recordId, column, target)">
                                  <div class="q-mx-xs ellipsis text-size-md">{{ target.value }}</div>
                                  <q-tooltip>{{ target.value }}</q-tooltip>
                                </q-chip>
                              </div>
                              <div class="row col q-pl-xs">
                                <div v-for="(target, targetI) in column.target" :key="targetI" class="full-width">
                                  <q-chip dense v-if="!!target.type"
                                          color="grey-2" text-color="grey-8">
                                    <div class="q-mx-xs ellipsis text-size-sm">{{ target.type }}</div>
                                    <q-tooltip>{{ target.type }}</q-tooltip>
                                  </q-chip>
                                  <q-chip v-else dense color="white" text-color="grey-8">
                                    <div class="q-mx-xs ellipsis text-size-md">-</div>
                                  </q-chip>
                                  <div class="text-size-xs text-grey-7 q-ml-xs ellipsis">
                                    <u>{{ target.fixedUri }}</u>
                                    <q-tooltip>{{ target.fixedUri }}</q-tooltip>
                                  </div>
                                </div>
                              </div>
                            </q-item>
                          </q-list>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
              </q-expansion-item>
            </q-list>
            <div v-else class="text-grey-7">
              No content
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
    <div class="row q-pa-sm">
      <q-btn unelevated label="Back" color="primary" icon="chevron_left" @click="previousStep" no-caps />
      <q-space />
      <q-btn v-if="fileSourceList.length" unelevated label="Next" icon-right="chevron_right" :disable="!savedRecords.length"
             color="primary" @click="nextStep" no-caps />
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { BufferElement, FileSource, Record, Sheet, SourceDataElement, TargetResource } from '@/common/model/file-source'
  import { ipcRenderer } from 'electron'
  import { QTree } from 'quasar'
  import Loading from '@/components/Loading.vue'
  import { v4 as uuid } from 'uuid'
  import { FHIRUtil } from '@/common/utils/fhir-util'
  import { environment } from '@/common/environment'
  import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import DefaultValueAssigner from '@/components/modals/DefaultValueAssigner.vue'
  import MappingDetailCard from '@/components/modals/MappingDetailCard.vue'

  @Component({
    components: {
      DataSourceTable: () => ({
        component: import('@/components/tables/DataSourceTable.vue'),
        loading: Loading,
        delay: 0
      }),
      FhirResourceTable: () => ({
        component: import('@/components/tables/FhirResourceTable.vue'),
        loading: Loading,
        delay: 0
      })
    } as any
  })
  export default class MetadataMapper extends Vue {
    private splitPercentage: number = 50
    private mappingObj: Map<string, any> = new Map<string, any>()
    private savedRecords: store.SavedRecord[] = []
    private editRecordId: string = ''

    get fileSourceList (): FileSource[] { return this.$store.getters[types.File.SOURCE_LIST] }
    set fileSourceList (value) { this.$store.commit(types.File.UPDATE_SOURCE_LIST, value) }

    get currentSource (): FileSource { return this.$store.getters[types.File.CURRENT_FILE] }
    set currentSource (value) { this.$store.commit(types.File.SET_CURRENT_FILE, value) }

    get sheets (): Sheet[] { return this.$store.getters[types.File.SHEETS] }
    set sheets (value) { this.$store.commit(types.File.SET_SHEETS, value) }

    get currentSheet (): Sheet | null { return this.$store.getters[types.File.CURRENT_SHEET] }
    set currentSheet (value) { this.$store.commit(types.File.SET_CURRENT_SHEET, value) }

    get currentFHIRRes (): string { return this.$store.getters[types.Fhir.CURRENT_RESOURCE] }

    get currentFHIRProf (): string { return this.$store.getters[types.Fhir.CURRENT_PROFILE] }

    get selectedAttr (): any { return this.$store.getters[types.File.SELECTED_HEADERS] }
    set selectedAttr (value) { this.$store.commit(types.File.SET_SELECTED_HEADERS, value) }

    get tickedFHIRAttr (): any { return this.$store.getters[types.Fhir.SELECTED_FHIR_ELEMENTS] }
    set tickedFHIRAttr (value) { this.$store.commit(types.Fhir.SET_SELECTED_FHIR_ELEMENTS, value) }

    get bufferSheetHeaders (): BufferElement[] { return this.$store.getters[types.File.BUFFER_SHEET_HEADERS] }
    set bufferSheetHeaders (value) { this.$store.commit(types.File.SET_BUFFER_SHEET_HEADERS, value) }

    get mappingList (): any[] { return this.$store.getters[types.MAPPING_LIST] }
    set mappingList (value) { this.$store.commit(types.SET_MAPPING_LIST, value) }

    get fhirElementList (): fhir.ElementTree[] { return this.$store.getters[types.Fhir.ELEMENT_LIST] }

    @Watch('currentSource')
    @Watch('currentSheet')
    onSourceChanged () {
      this.editRecordId = ''
    }

    mounted () {
      this.editRecordId = ''
      this.loadSavedRecords()
    }

    loadSavedRecords () {
      this.savedRecords = []
      this.getMappings().then(() => {
        return Promise.all(Object.keys(this.mappingObj).map((fileName: string) => {
          const file = this.mappingObj[fileName]
          const sheets: store.Sheet[] = []
          return Promise.all(Object.keys(file).map((sheetName: string) => {
            // Obj (key, value) (record, header)
            const sheet = file[sheetName]
            const records: store.Record[] = []
            return Promise.all(Object.keys(sheet).map((recordId: string) => {
              const record = sheet[recordId]
              records.push(
                {
                  recordId,
                  resource: record[0].target[0].resource,
                  profile: record[0].target[0].profile,
                  data: record
                } as store.Record
              )
            })). then(_ => {
              if (records.length) sheets.push({sheetName, records})
            })
          })).then(_ => {
            if (sheets.length) this.savedRecords.push({fileName, sheets})
          })
        })).then(_ => {
          this.$store.commit(types.File.SET_SAVED_RECORDS, this.savedRecords)
        })
      })
        .catch(err => this.$notify.error('Cannot get saved mappings'))
    }

    getMappings (): Promise<any> {
      return Promise.all(this.fileSourceList.map((file: FileSource) => {
        this.mappingObj[file.path] = {}
        const currFile = this.mappingObj[file.path]
        return Promise.all(file.sheets?.map((sheet: Sheet) => {

          const columns = (sheet.headers?.filter(h => h.record?.length) || []) as SourceDataElement[]
          currFile[sheet.label] = {}

          return Promise.all(columns.map((column: SourceDataElement) => {

            // const groupIds = column.group ? Object.keys(column.group) : []
            column.record!.map((record: Record) => {
              if (record.target && record.target.length) {
                currFile[sheet.label][record.recordId] = [
                  ...(currFile[sheet.label][record.recordId] || []),
                  FHIRUtil.cleanJSON({
                    value: column.value,
                    type: column.type,
                    target: record.target,
                    conceptMap: column.conceptMap,
                    defaultValue: column.defaultValue
                  })
                ]
              }
            })
          })).then(_ => {
            if (!Object.keys(currFile[sheet.label]).length) Vue.delete(currFile, sheet.label)
          })
        }) || [])
      }))
    }

    exportState () {
      const mappingState: FileSource[] = this.$store.getters[types.File.SOURCE_LIST]
      this.$q.loading.show({spinner: undefined})

      ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.EXPORT_FILE, JSON.stringify(
        {
          fileSourceList: mappingState.map(_ =>
            ({
              extension: _.extension,
              label: _.label,
              path: _.path,
              sheets: _.sheets,
              currentSheet: null
            })
          )
        })
      )
      ipcRenderer.on(ipcChannels.File.EXPORT_DONE, (event, result) => {
        if (result) {
          this.$notify.success('File is exported successfully')
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners(ipcChannels.File.EXPORT_DONE)
      })
    }

    saveState () {
      this.$q.dialog({
        title: 'Save Mapping',
        prompt: {
          model: '',
          isValid: val => val.length > 0,
          type: 'text'
        },
        cancel: true,
        persistent: true
      }).onOk(mappingName => {
        let fileStore: any = localStorage.getItem('store-fileSourceList')
        if (fileStore) {
          fileStore = JSON.parse(fileStore) as any[]
          fileStore.push({date: new Date(), name: mappingName, data: this.$store.state.file})
        } else {
          fileStore = [{date: new Date(), name: mappingName, data: this.$store.state.file}]
        }
        localStorage.setItem('store-fileSourceList', JSON.stringify(fileStore))
        this.$notify.success('Saved')
      })
    }

    previousStep () {
      this.$q.dialog({
        title: '<span class="text-primary"><i class="fas fa-info-circle q-pr-sm"></i>Previous Step</span>',
        message: 'If you go back and make any change, the changes you have made in this section will be lost.',
        class: 'text-grey-9',
        cancel: true,
        html: true
      }).onOk(() => {
        this.$store.dispatch(types.File.DESTROY_STORE)
        this.$store.commit(types.DECREMENT_STEP)
      })
    }

    checkMatchingStatus (nodes: fhir.ElementTree[]): boolean {
      let hasError: boolean = false
      for (const node of nodes) {
        if (node.type?.length) {
          const dataType: fhir.ElementTree = node.type[0]
          if (node.type.length > 1 || (environment.datatypes[dataType.value] && dataType.value !== 'CodeableConcept' && dataType.value !== 'Coding' && dataType.value !== 'Extension')) {
            if (!node.selectedType) {
              node.error = true
              hasError = true
            }
          }
        }
      }

      if (hasError) {
        this.$store.commit(types.Fhir.SET_ELEMENT_LIST, this.fhirElementList)
        return false
      }
      return true
    }

    matchFields () {
      const fhirTree: QTree = (this.$refs.fhirResourceComp as any)?.$refs.fhirTree as QTree
      const tickedNodes: fhir.ElementTree[] = fhirTree.getTickedNodes()

      if (this.checkMatchingStatus(tickedNodes)) {
        this.tickedFHIRAttr = tickedNodes.map((node: fhir.ElementTree) => {
          if (node.error) delete node.error
          let type: string
          if (FHIRUtil.isMultiDataTypeForm(node.value) && node.type?.length === 1) {
            type = node.type[0].value
          }
          return {
            value: node.value,
            resource: this.currentFHIRRes,
            profile: this.currentFHIRProf,
            type: node.selectedType || type,
            fixedUri: node.fixedUri || node.selectedUri
          } as store.Target
        })
        for (const column of this.selectedAttr) {
          if (!column['target']) column['target'] = [...this.tickedFHIRAttr]
          else column['target'].push(...this.tickedFHIRAttr)
        }

        ([this.selectedAttr, this.tickedFHIRAttr] = [[], []])
        this.$notify.success('Target value is matched successfully')
      } else {
        this.$notify.error('Choose a type for selected items')
      }
    }

    addRecord () {
      const bufferItems: BufferElement[] = this.bufferSheetHeaders.filter(_ => _.target && _.target.length)

      if (!bufferItems.length)
        return;

      if (this.editRecordId) this.removeRecord(this.currentSource.path, this.currentSheet?.value!, this.editRecordId)
      const recordId = this.editRecordId || uuid().slice(0, 8)

      const file = this.fileSourceList.filter(_ => _.path === this.currentSource.path) || []
      if (file.length === 1) {
        const filteredSheet = file[0].sheets?.filter(_ => _.value === this.currentSheet?.value) || []
        if (filteredSheet.length === 1) {
          const sheet = filteredSheet[0]

          // Remove any default valued fields due to replacements
          this.$_.remove(sheet.headers, _ => {
            return _.defaultValue && _.record?.length && _.record[0].recordId === recordId
          })

          Promise.all(bufferItems.map(buffer => {
            const filteredHeaders = sheet.headers?.filter(_ => buffer.value && _.value === buffer.value) || []
            const header: SourceDataElement = (filteredHeaders.length && filteredHeaders[0]) || {}

            if (!header.record || !header.record.length) {
              header.record = []
            }
            header.conceptMap = {...buffer.conceptMap}
            header.type = buffer.type
            header.record.push(
              {
                recordId,
                target: buffer.target?.map(_ => ({..._}))
              } as Record
            )

            if (!filteredHeaders.length) {
              header.defaultValue = buffer.defaultValue
              sheet.headers.push(header)
            }

          })).then(_ => {
            this.editRecordId = ''
            this.$store.commit(types.File.SETUP_BUFFER_SHEET_HEADERS)
            this.$notify.success('Mapping is added successfully')
            this.loadSavedRecords()
          })
        }
      } else {
        this.$notify.error('Something went wrong during saving the record')
      }
    }

    editRecord (fileName: string, sheetName: string, recordId: string) {
      new Promise(resolve => {
        if (this.currentSource.path !== fileName) {
          this.currentSource = this.fileSourceList.filter(_ => _.path === fileName)[0]
        }
        if (this.currentSheet?.value !== sheetName) {
          this.currentSource.currentSheet = this.currentSource.sheets!.filter(_ => _.value === sheetName)[0]
        }
        resolve()
      }).then(() => {
        this.editRecordId = recordId
        this.$q.loading.show()
        this.$store.commit(types.File.SETUP_BUFFER_SHEET_HEADERS)
        const file = this.savedRecords.filter(_ => _.fileName === fileName) || []
        if (file.length === 1) {
          const sheet = file[0].sheets?.filter(_ => _.sheetName === sheetName) || []
          if (sheet.length === 1) {
            const record = sheet[0].records?.filter(_ => _.recordId === recordId)
            const sourceAttrs: store.SourceTargetGroup[] = record[0].data || []
            sourceAttrs.map(_ => {
              const tmp: BufferElement[] = this.bufferSheetHeaders.filter(field => _.value && field.value === _.value) || []
              if (tmp.length) {
                tmp[0].type = _.type
                tmp[0].target = [..._.target]
                if (_.conceptMap && !FHIRUtil.isEmpty(_.conceptMap)) {
                  tmp[0].conceptMap = JSON.parse(JSON.stringify(_.conceptMap))
                }
              } else {
                this.bufferSheetHeaders.push(this.$_.cloneDeep(_))
              }
            })
            this.bufferSheetHeaders = [...this.bufferSheetHeaders]
          }
        } else {
          this.$q.loading.hide()
          this.$notify.error('Something went wrong.')
        }
        this.$q.loading.hide()

        // Scroll to the top of this component
        this.$el.scrollIntoView()
      })
    }

    removeRecordPopup (fileName: string, sheetName: string, recordId: string) {
      this.$q.dialog({
        title: '<span class="text-negative"><i class="fas fa-trash q-pr-sm"></i>Delete Record</span>',
        message: `Delete record with id <span class="text-weight-bolder">#${recordId}</span>.`,
        class: 'text-grey-9',
        cancel: true,
        html: true,
        ok: 'Delete'
      }).onOk(() => {
        this.removeRecord(fileName, sheetName, recordId)
        this.loadSavedRecords()
      })
    }

    removeRecord (fileName: string, sheetName: string, recordId: string) {
      this.$q.loading.show()
      const file = this.fileSourceList.filter(_ => _.path === fileName) || []
      if (file.length === 1) {
        const sheet = file[0].sheets?.filter(_ => _.value === sheetName) || []
        if (sheet.length === 1) {
          Promise.all(sheet[0].headers?.map((column: SourceDataElement) => {
            if (column.value && column.record && column.record.length) {
              this.$_.remove(column.record, _ => _.recordId === recordId)
            } else if (column.defaultValue) {
              this.$_.remove(sheet[0].headers, column => {
                return !column.value && column.defaultValue && column.record.filter(record => record.recordId === recordId).length
              })
            }
          }) || [])
            .then(() => this.$q.loading.hide())
            .catch(() => {
              this.$q.loading.hide()
              this.$notify.error('Something went wrong.')
            })
        } else this.$q.loading.hide()
      } else {
        this.$q.loading.hide()
        this.$notify.error('Something went wrong.')
      }
    }

    removeMatching (fileName: string, sheetName: string, recordId: string, source: store.SourceTargetGroup, target: store.Target) {
      this.$q.loading.show()
      const file = this.fileSourceList.filter(_ => _.path === fileName) || []
      if (file.length === 1) {
        const sheet = file[0].sheets?.filter(_ => _.value === sheetName) || []
        if (sheet.length === 1) {
          const columns = sheet[0].headers?.filter(_ => (_.value && _.value === source.value) || (_.defaultValue && _.defaultValue === source.defaultValue)) || []
          Promise.all(columns.map((column: SourceDataElement) => {
            if (column.record && column.record.length) {
              column.record.map((record: Record) => {
                if (record.recordId === recordId) {
                  this.$_.remove(record.target, _ => _.value === target.value && _.type === target.type)
                }
              })
            }
          }) || []).then(() => {
            this.$q.loading.hide()
            if (source.defaultValue) {
              this.$_.remove(sheet[0].headers, column => {
                return !column.value && column.defaultValue && column.record.filter(record => !record.target.length).length
              })
            }
            this.loadSavedRecords()
          })
        }
      } else {
        this.$q.loading.hide()
        this.$notify.error('Something went wrong during deletion.')
      }
    }

    closeEditMode () {
      this.editRecordId = ''
      this.$store.commit(types.File.SETUP_BUFFER_SHEET_HEADERS)
    }

    nextStep () {
      this.getMappings().then(() => {
        let index = 0
        this.mappingList = Object.keys(this.mappingObj).flatMap(f =>
          Object.keys(this.mappingObj[f]).map(s =>
            ({name: index++, file: f, sheet: s, validation: 0})))

        this.$store.commit(types.SET_VALIDATION_STATUS, '')
        // Next step - Validation
        this.$store.commit(types.INCREMENT_STEP)
      })
    }

    openDefaultValueAssigner () {
      const fhirTree: QTree = (this.$refs.fhirResourceComp as any)?.$refs.fhirTree as QTree
      const tickedNodes: fhir.ElementTree[] = fhirTree.getTickedNodes()

      if (this.checkMatchingStatus(tickedNodes) && this.bufferSheetHeaders?.length) {
        let abstractColumn: BufferElement | undefined = this.bufferSheetHeaders.find((element: BufferElement) => {
          return element.target?.find((target: TargetResource) => {
            return target.resource === this.currentFHIRRes
                  && target.profile === this.currentFHIRProf
                  && target.type === tickedNodes[0].selectedType
                  && target.value === tickedNodes[0].value
          })
        })

        this.$q.dialog({
          component: DefaultValueAssigner,
          parent: this,
          defaultValueProp: abstractColumn?.defaultValue
        })
          .onOk(value => {
            if (!abstractColumn) {
              abstractColumn = {}
              this.bufferSheetHeaders.push(abstractColumn)
            }
            this.tickedFHIRAttr = tickedNodes.map((node: fhir.ElementTree) => {
              if (node.error) delete node.error
              let type: string
              if (FHIRUtil.isMultiDataTypeForm(node.value) && node.type?.length === 1) {
                type = node.type[0].value
              }
              return {
                value: node.value,
                resource: this.currentFHIRRes,
                profile: this.currentFHIRProf,
                type: node.selectedType || type,
                fixedUri: node.fixedUri || node.selectedUri
              } as store.Target
            })
            abstractColumn.defaultValue = value
            abstractColumn.target = [...this.tickedFHIRAttr]

            this.tickedFHIRAttr = []
            this.$notify.success('Default value has been assigned successfully')
          })
      } else {
        if (this.bufferSheetHeaders?.length) {
          this.$notify.error('Choose a type for selected items')
        } else {
          this.$notify.error('Select a table')
        }
      }
    }

    openMappingDetail (fileName: string, sheetName: string, mappingRecord: store.Record) {
      this.$q.dialog({
        component: MappingDetailCard,
        parent: this,
        mapping: mappingRecord
      })
        .onOk(() => {
          this.editRecord(fileName, sheetName, mappingRecord.recordId)
        })
    }

  }
</script>

<style lang="stylus">
  .separator-style
    width 12px !important
</style>
