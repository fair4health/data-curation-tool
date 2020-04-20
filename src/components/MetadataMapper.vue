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
                    <div v-for="(record, index) in sheet.records" :key="index" class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                      <q-card class="q-ma-xs" bordered flat>
                        <q-card-section class="text-caption bg-grey-3 text-weight-bold q-pa-xs">
                          <div class="row items-center">
                            <q-chip class="text-white text-size-md" color="blue-grey-4">#{{ record.recordId }}</q-chip>
                            <q-space />
                            <div class="q-gutter-xs">
                              <q-btn flat round dense size="sm" icon="edit" color="grey-9"
                                     @click="editRecord(file.fileName, sheet.sheetName, record.recordId)" />
                              <q-btn unelevated round dense size="sm" icon="close" color="white" text-color="grey-9"
                                     @click="removeRecordPopup(file.fileName, sheet.sheetName, record.recordId)" />
                            </div>
                          </div>
                          <div class="row ellipsis no-wrap">
                            <div class="text-grey-8 ellipsis no-wrap text-weight-regular">
                              <div class="row no-wrap">
                                <q-chip class="text-grey-8 cursor-pointer text-size-sm" color="white">
                                  <span class="text-weight-bold ellipsis"> {{ record.resource }}</span>
                                  <q-tooltip content-class="bg-grey-2 text-primary">{{record.resource}}</q-tooltip>
                                </q-chip>
                                <q-chip class="text-grey-8 ellipsis cursor-pointer text-size-sm" color="white">
                                  <span class="ellipsis">{{ record.profile || '-' }}</span>
                                  <q-tooltip content-class="bg-grey-2 text-primary">{{record.profile}}</q-tooltip>
                                </q-chip>
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                        <q-card-section>
                          <q-list separator>
                            <q-item v-for="(column, index) in record.data" :key="index">
                              <div class="col-3 ellipsis items-center text-size-md">{{ column.value }}</div>
                              <div class="row col">
                                <q-chip dense removable v-for="(target, targetI) in column.target" :key="targetI"
                                        color="orange" text-color="white" class="cursor-pointer"
                                        @remove="removeMatching(file.fileName, sheet.sheetName, record.recordId, column.value, target.value, target.type)">
                                  <div class="q-mx-xs ellipsis text-size-md">{{ target.value }}</div>
                                  <q-tooltip>{{ target.value }}</q-tooltip>
                                </q-chip>
                              </div>
                              <div class="row col q-pl-xs">
                                <div v-for="(target, targetI) in column.target" :key="targetI" class="full-width">
                                  <q-chip dense v-if="!!target.type"
                                          color="grey-2" text-color="grey-8" class="cursor-pointer">
                                    <div class="q-mx-xs ellipsis text-size-sm">{{ target.type }}</div>
                                    <q-tooltip>{{ target.type }}</q-tooltip>
                                  </q-chip>
                                  <q-chip v-else dense color="white" text-color="grey-8">
                                    <div class="q-mx-xs ellipsis text-size-md">-</div>
                                  </q-chip>
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
  import { BufferElement, FileSource, Record, Sheet, SourceDataElement } from '@/common/model/file-source'
  import { ipcRenderer } from 'electron'
  import { QTree } from 'quasar'
  import Loading from '@/components/Loading.vue'
  import { v4 as uuid } from 'uuid'
  import { FHIRUtil } from '@/common/utils/fhir-util'
  import { environment } from '@/common/environment'

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

    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }
    set fileSourceList (value) { this.$store.commit('file/updateSourceList', value) }

    get currentSource (): FileSource { return this.$store.getters['file/currentFile'] }
    set currentSource (value) { this.$store.commit('file/setCurrentFile', value) }

    get sheets (): Sheet[] { return this.$store.getters['file/sheets'] }
    set sheets (value) { this.$store.commit('file/setSheets', value) }

    get currentSheet (): Sheet | null { return this.$store.getters['file/currentSheet'] }
    set currentSheet (value) { this.$store.commit('file/setCurrentSheet', value) }

    get currentFHIRRes (): string { return this.$store.getters['fhir/currentResource'] }

    get currentFHIRProf (): string { return this.$store.getters['fhir/currentProfile'] }

    get selectedAttr (): any { return this.$store.getters['file/selectedElements'] }
    set selectedAttr (value) { this.$store.commit('file/setSelectedElements', value) }

    get tickedFHIRAttr (): any { return this.$store.getters['fhir/selectedElements'] }
    set tickedFHIRAttr (value) { this.$store.commit('fhir/setSelectedElements', value) }

    get bufferSheetHeaders (): BufferElement[] { return this.$store.getters['file/bufferSheetHeaders'] }
    set bufferSheetHeaders (value) { this.$store.commit('file/setBufferSheetHeaders', value) }

    get mappingList (): any[] { return this.$store.getters['mappingList'] }
    set mappingList (value) { this.$store.commit('setMappingList', value) }

    get fhirElementList (): fhir.ElementTree[] { return this.$store.getters['fhir/elementList'] }

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
      this.$q.loading.show()
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
          this.$q.loading.hide()
          this.$store.commit('file/setSavedRecords', this.savedRecords)
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
                  FHIRUtil.cleanJSON({value: column.value, type: column.type, target: record.target, conceptMap: column.conceptMap})
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
      const mappingState: FileSource[] = this.$store.getters['file/sourceList']
      this.$q.loading.show({spinner: undefined})

      ipcRenderer.send('to-background', 'export-file', JSON.stringify(
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
      ipcRenderer.on('export-done', (event, result) => {
        if (result) {
          this.$notify.success('File is exported successfully')
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners('export-done')
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
        this.$store.dispatch('file/destroyStore')
        this.$store.commit('decrementStep')
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
        this.$store.commit('fhir/setElementList', this.fhirElementList)
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
          return {
            value: node.value,
            resource: this.currentFHIRRes,
            profile: this.currentFHIRProf,
            type: node.selectedType
          }
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
        const sheet = file[0].sheets?.filter(_ => _.value === this.currentSheet?.value) || []
        if (sheet.length === 1) {
          Promise.all(bufferItems.map(buffer => {
            const filteredHeaders = sheet[0].headers?.filter(_ => _.value === buffer.value) || []
            if (filteredHeaders.length) {
              const header = filteredHeaders[0]
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
            }
          })).then(_ => {
            this.editRecordId = ''
            this.$store.commit('file/setupBufferSheetHeaders')
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
        this.$store.commit('file/setupBufferSheetHeaders')
        const file = this.savedRecords.filter(_ => _.fileName === fileName) || []
        if (file.length === 1) {
          const sheet = file[0].sheets?.filter(_ => _.sheetName === sheetName) || []
          if (sheet.length === 1) {
            const record = sheet[0].records?.filter(_ => _.recordId === recordId)
            const sourceAttrs: store.SourceTargetGroup[] = record[0].data || []
            sourceAttrs.map(_ => {
              const tmp: BufferElement[] = this.bufferSheetHeaders.filter(field => field.value === _.value) || []
              if (tmp.length) {
                tmp[0].type = _.type
                tmp[0].target = [..._.target]
                if (_.conceptMap && !FHIRUtil.isEmpty(_.conceptMap)) {
                  tmp[0].conceptMap = JSON.parse(JSON.stringify(_.conceptMap))
                }
              }
            })
            this.bufferSheetHeaders = [...this.bufferSheetHeaders]
          }
        } else {
          this.$q.loading.hide()
          this.$notify.error('Something went wrong.')
        }
        this.$q.loading.hide()
      })
    }

    removeRecordPopup (fileName: string, sheetName: string, recordId: string) {
      this.$q.dialog({
        title: '<span class="text-primary"><i class="fas fa-info-circle q-pr-sm"></i>Delete Record</span>',
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
            if (column.record && column.record.length) {
              for (let i = 0; i < column.record.length; i++) {
                if (column.record[i].recordId === recordId) column.record.splice(i, 1)
              }
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

    removeMatching (fileName: string, sheetName: string, recordId: string, sourceValue: string, targetValue: string, targetType: string) {
      this.$q.loading.show()
      const file = this.fileSourceList.filter(_ => _.path === fileName) || []
      if (file.length === 1) {
        const sheet = file[0].sheets?.filter(_ => _.value === sheetName) || []
        if (sheet.length === 1) {
          const columns = sheet[0].headers?.filter(_ => _.value === sourceValue) || []
          Promise.all(columns.map((column: SourceDataElement) => {
            if (column.record && column.record.length) {
              column.record.map((record: Record) => {
                if (record.recordId === recordId) {
                  for (let i = 0; i < (record.target?.length || 0); i++) {
                    if (record.target![i].value === targetValue && record.target![i].type === targetType)
                      record.target?.splice(i, 1)
                  }
                }
              })
            }
          }) || []).then(() => {
            this.$q.loading.hide()
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
      this.$store.commit('file/setupBufferSheetHeaders')
    }

    nextStep () {
      this.getMappings().then(() => {
        let index = 0
        this.mappingList = Object.keys(this.mappingObj).flatMap(f =>
          Object.keys(this.mappingObj[f]).map(s =>
            ({name: index++, file: f, sheet: s, validation: 0})))

        this.$store.commit('setValidationStatus', '')
        // Next step - Validation
        this.$store.commit('incrementStep')
      })
    }

  }
</script>

<style lang="stylus">
  .separator-style
    width 12px !important
</style>
