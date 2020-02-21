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
        label="New Record"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
      >
        <q-card bordered class="bg-white">
          <q-splitter v-model="splitPercentage" :limits="[20, 80]" separator-class="bg-grey-4"
                      separator-style="width: 12px" :horizontal="$q.screen.lt.sm" class="row">

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
              <q-btn :disable="!(tickedFHIRAttr.length && selectedAttr.length)" icon="sync_alt" unelevated label="Match"
                     color="blue-1" text-color="primary" @click="matchFields" no-caps />
              <q-btn unelevated v-show="!editRecordId" color="green" label="Add Record" icon="check" @click="addRecord" no-caps />
              <q-btn unelevated v-show="editRecordId" color="primary" label="Update" icon="edit" @click="addRecord" no-caps />
              <q-btn unelevated v-show="editRecordId" color="red" label="Exit Edit Mode" @click="exitEditMode" no-caps />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item
        default-opened
        class="q-mt-md col-12"
        icon="save"
        label="Saved Records"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
      >
        <q-card bordered>
          <div v-if="savedRecords.length" class="row q-pa-xs">
            <q-space />
            <div class="q-gutter-sm q-mx-sm">
              <q-btn unelevated label="Export" color="grey" icon="publish" @click="exportState" no-caps />
              <q-btn unelevated label="Save" color="green" icon="save" @click="saveState" no-caps />
            </div>
          </div>
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
                  <div class="row text-grey-6 text-weight-bold">{{sheet.sheetName}}</div>
                  <q-separator spaced />
                  <div class="row">
                    <div v-for="(record, index) in sheet.records" :key="index" class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                      <q-card class="q-ma-xs" bordered flat>
                        <q-card-section class="text-caption bg-grey-3 text-weight-bold text-italic fa-border">
                          <div class="row items-center">
                            <q-chip class="text-grey-8" color="white" style="font-size: 12px">#{{record.recordId}}</q-chip>
                            <q-space />
                            <div class="q-gutter-xs">
                              <q-btn flat round dense size="sm" icon="edit" color="grey-9"
                                     @click="editRecord(file.fileName, sheet.sheetName, record.recordId)" />
                              <q-btn unelevated round dense size="sm" icon="close" color="white" text-color="grey-9"
                                     @click="removeRecordPopup(file.fileName, sheet.sheetName, record.recordId)" />
                            </div>
                          </div>
                        </q-card-section>
                        <q-card-section>
                          <q-list separator>
                            <q-item v-for="(column, index) in record.data" :key="index">
                              <q-item-section style="font-size: 12px">{{column.value}}</q-item-section>
                              <div class="row col">
                                <q-chip dense removable v-for="(target, targetI) in column.target" :key="targetI"
                                        color="orange" text-color="white" class="cursor-pointer"
                                        @remove="removeMatching(file.fileName, sheet.sheetName, record.recordId, column.value, target.value)">
                                  <span class="q-mx-xs ellipsis" style="font-size: 12px">{{target.value}}</span>
                                  <q-tooltip>{{target.value}}</q-tooltip>
                                </q-chip>
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
    <div class="row q-ma-md">
      <q-btn unelevated label="Back" color="primary" icon="chevron_left" @click="previousStep" no-caps />
      <q-space />
      <q-btn v-if="fileSourceList.length" unelevated label="Next" icon-right="chevron_right"
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
  import SourceTargetGroup = store.SourceTargetGroup

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
              records.push(
                {
                  recordId,
                  data: sheet[recordId]
                }
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
        .catch(err => this.$q.notify({message: 'Cannot get saved records'}))
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
              if (record.target && record.target.length)
                currFile[sheet.label][record.recordId] = [
                  ...(currFile[sheet.label][record.recordId] || []),
                  {value: column.value, type: column.type, target: record.target}
                ]
            })
          })).then(_ => {
            if (!Object.keys(currFile[sheet.label]).length) Vue.delete(currFile, sheet.label)
          })
        }) || [])
      }))
    }

    exportState () {
      ipcRenderer.send('export-file', JSON.stringify(this.$store.state.file))
      ipcRenderer.on('export-done', (event, result) => {
        if (result) {
          this.$q.notify({message: 'File is successfully exported', color: 'green-6'})
        } else {
          this.$q.notify({message: 'Something went wrong, try again', color: 'red-6'})
        }
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
        let fileStore: any = localStorage.getItem('f4h-store-fileSourceList')
        if (fileStore) {
          fileStore = JSON.parse(fileStore) as any[]
          fileStore.push({date: new Date(), name: mappingName, data: this.$store.state.file})
        } else {
          fileStore = [{date: new Date(), name: mappingName, data: this.$store.state.file}]
        }
        localStorage.setItem('f4h-store-fileSourceList', JSON.stringify(fileStore))
        this.$q.notify({ message: 'Saved', icon: 'check', color: 'green-6' })
      })
    }

    previousStep () {
      this.$q.dialog({
        title: '<i class="fas fa-info text-primary"> Previous Step </i>',
        message: 'If you go back and make any change, the changes you have made in this section will be lost.',
        class: 'text-grey-9',
        cancel: true,
        html: true
      }).onOk(() => {
        this.$store.dispatch('file/destroyStore')
        this.$store.commit('decrementStep')
      })
    }

    matchFields () {
      const fhirTree: QTree = (this.$refs.fhirResourceComp as any)?.$refs.fhirTree as QTree
      this.tickedFHIRAttr = fhirTree.getTickedNodes().map((obj: fhir.ElementTree) => {
        return {
          value: obj.value,
          resource: this.currentFHIRRes,
          profile: this.currentFHIRProf,
          type: obj.selectedType
        }
      })
      for (const attr of this.selectedAttr) {
        for (const column of this.bufferSheetHeaders || []) {
          if (column?.value === attr.value) {
            if (!column['target']) column['target'] = [...this.tickedFHIRAttr]
            else column['target'].push(...this.tickedFHIRAttr)
            this.$log.success('Mapping',
              this.currentSource?.label + '.' + this.currentSheet?.label + '.' + column.value +
              ' - (' + this.tickedFHIRAttr.map(e => e.value).join(', ') + ')')
          }
        }
      }
      ([this.selectedAttr, this.tickedFHIRAttr] = [[], []])
      this.$q.notify({ message: 'Target value entered successfully', icon: 'check', color: 'green-6'})
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
            this.$q.notify({message: 'Saved'})
            this.loadSavedRecords()
          })
        }
      } else {
        this.$q.notify({message: 'Something went wrong during saving record.'})
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
            const sourceAttrs: SourceTargetGroup[] = record[0].data || []
            sourceAttrs.map(_ => {
              const tmp = this.bufferSheetHeaders.filter(field => field.value === _.value) || []
              if (tmp.length) {
                tmp[0].type = _.type
                tmp[0].target = [..._.target]
              }
            })
            this.bufferSheetHeaders = [...this.bufferSheetHeaders]
          }
        } else {
          this.$q.loading.hide()
          this.$q.notify({message: 'Something went wrong.'})
        }
        this.$q.loading.hide()
      })
    }

    removeRecordPopup (fileName: string, sheetName: string, recordId: string) {
      this.$q.dialog({
        title: '<i class="fas fa-info text-primary"> Delete Record </i>',
        message: `Delete record with id <span class="text-weight-bolder">#${recordId}</span>.`,
        class: 'text-grey-9',
        cancel: true,
        html: true
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
              this.$q.notify({message: 'Something went wrong.'})
            })
        } else this.$q.loading.hide()
      } else {
        this.$q.loading.hide()
        this.$q.notify({message: 'Something went wrong.'})
      }
    }

    removeMatching (fileName: string, sheetName: string, recordId: string, sourceValue: string, targetValue: string) {
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
                    if (record.target![i].value === targetValue)
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
        this.$q.notify({message: 'Something went wrong during deletion.'})
      }
    }

    exitEditMode () {
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
  .disabledArea
    pointer-events none
    opacity 0.4
  .sticky-header-table
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th
      background-color #fff
    thead th
      position sticky
      top 0
      opacity 1
      z-index 1
</style>
