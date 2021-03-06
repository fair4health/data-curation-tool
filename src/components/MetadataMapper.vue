<template>
  <div>
    <q-toolbar class="bg-grey-4 top-fix-column">
      <q-btn flat :label="$t('BUTTONS.BACK')" color="primary" icon="chevron_left" @click="previousStep" no-caps />
      <q-toolbar-title class="text-grey-8" align="center">
        <q-icon name="fas fa-list-ul" color="primary" class="q-px-md" />
        {{ $t('TITLES.METADATA_MAPPER') }}
      </q-toolbar-title>
      <q-btn v-if="fileSourceList.length" unelevated :label="$t('BUTTONS.NEXT')" icon-right="chevron_right" :disable="!savedRecords.length"
             color="primary" @click="nextStep" no-caps />
    </q-toolbar>
    <div class="q-ma-sm">
      <q-expansion-item
        default-opened
        class="q-mt-md col-12"
        icon="add"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
        :expand-icon-toggle="true"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="add" />
          </q-item-section>

          <q-item-section>
            {{ $t('LABELS.NEW_MAPPING') }}
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
            <q-btn :disable="tickedFHIRAttr.length !== 1" unelevated :label="$t('BUTTONS.ASSIGN_DEFAULT_VALUE')"
                   color="primary" @click="openDefaultValueAssigner" no-caps />
            <q-space />
            <div class="q-gutter-sm">
              <q-btn :disable="!(tickedFHIRAttr.length && selectedAttr.length)" unelevated :label="$t('BUTTONS.MATCH_ATTRIBUTE')"
                     color="primary" @click="matchFields" no-caps />
              <q-btn unelevated v-show="!editRecordId" color="positive" :label="$t('BUTTONS.ADD_MAPPING')" icon="check" @click="addRecord" no-caps :disable="isBufferMappingEmpty()" />
              <q-btn unelevated v-show="editRecordId" color="primary" :label="$t('BUTTONS.UPDATE')" icon="edit" @click="addRecord" no-caps />
              <q-btn unelevated v-show="editRecordId" color="negative" :label="$t('BUTTONS.DISCARD_CHANGES')" @click="closeEditMode" no-caps />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item
        default-opened
        class="q-mt-md col-12"
        icon="list"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
        :expand-icon-toggle="true"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="list" text-color="white" />
          </q-item-section>

          <q-item-section>
            {{ $t('LABELS.MAPPINGS') }}
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-sm">
              <q-btn unelevated :label="$t('BUTTONS.EXPORT')" color="negative" text-color="white" @click="exportState" icon="publish" :disable="!savedRecords.length" no-caps />
              <q-btn unelevated :label="$t('BUTTONS.SAVE')" color="secondary" text-color="white" @click="saveState" icon="save" :disable="!savedRecords.length" no-caps />
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
                              <q-btn unelevated rounded size="sm" icon="fas fa-check-circle" color="primary"
                                     text-color="white" :label="$t('BUTTONS.VALIDATE_MAPPING')"
                                     @click="validateMapping(file.fileName, sheet.sheetName, record)" no-caps />
                              <q-btn unelevated rounded size="sm" icon="visibility" color="white" text-color="primary"
                                     :label="$t('BUTTONS.SEE_DETAILS')"
                                     @click="openMappingDetail(file.fileName, sheet.sheetName, record)" no-caps />
                              <q-btn unelevated rounded size="sm" icon="edit" color="white" text-color="primary"
                                     :label="$t('BUTTONS.EDIT')"
                                     @click="editRecord(file.fileName, sheet.sheetName, record)" no-caps />
                              <q-btn unelevated round dense size="sm" icon="delete" color="white" text-color="negative"
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
                                <q-chip v-if="column.defaultValue" dense square
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
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
  import { BufferElement, FileSource, Record, Sheet, SourceDataElement, TargetResource, DataSourceType, DBConnectionOptions } from '@/common/model/data-source'
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
  import StatusMixin from '@/common/mixins/statusMixin'
  import OutcomeCard from '@/components/modals/OutcomeCard.vue'

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
  export default class MetadataMapper extends Mixins(StatusMixin) {
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
    set currentFHIRRes (value) { this.$store.commit(types.Fhir.SET_CURRENT_RESOURCE, value) }

    get currentFHIRProf (): string { return this.$store.getters[types.Fhir.CURRENT_PROFILE] }
    set currentFHIRProf (value) { this.$store.commit(types.Fhir.SET_CURRENT_PROFILE, value) }

    get selectedAttr (): any { return this.$store.getters[types.File.SELECTED_HEADERS] }
    set selectedAttr (value) { this.$store.commit(types.File.SET_SELECTED_HEADERS, value) }

    get tickedFHIRAttr (): any { return this.$store.getters[types.Fhir.SELECTED_FHIR_ELEMENTS] }
    set tickedFHIRAttr (value) { this.$store.commit(types.Fhir.SET_SELECTED_FHIR_ELEMENTS, value) }

    get bufferSheetHeaders (): BufferElement[] { return this.$store.getters[types.File.BUFFER_SHEET_HEADERS] }
    set bufferSheetHeaders (value) { this.$store.commit(types.File.SET_BUFFER_SHEET_HEADERS, value) }

    get mappingList (): any[] { return this.$store.getters[types.MAPPING_LIST] }
    set mappingList (value) { this.$store.commit(types.SET_MAPPING_LIST, value) }

    get fhirElementList (): fhir.ElementTree[] { return this.$store.getters[types.Fhir.ELEMENT_LIST] }

    get dataSourceType (): DataSourceType { return this.$store.getters[types.DATA_SOURCE_TYPE] }
    get dbConnectionOptions (): DBConnectionOptions { return this.$store.getters[types.DB_CONNECTION_OPTIONS] }

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
        .catch(err => this.$notify.error(String(this.$t('ERROR.CANNOT_GET_SAVED_MAPPINGS'))))
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

      const state = {
        fileSourceList: mappingState.map(_ =>
          ({
            extension: _.extension,
            label: _.label,
            path: _.path,
            sheets: _.sheets,
            currentSheet: null
          })
        )
      }
      if (this.dataSourceType === DataSourceType.DB) {
        state['dbConnectionOptions'] = this.dbConnectionOptions
      }
      ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.EXPORT_FILE, JSON.stringify(state)
      )
      ipcRenderer.on(ipcChannels.File.EXPORT_DONE, (event, result) => {
        if (result) {
          this.$notify.success(String(this.$t('SUCCESS.FILE_IS_EXPORTED')))
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners(ipcChannels.File.EXPORT_DONE)
      })
    }

    saveState () {
      this.$q.dialog({
        title: `${this.$t('TITLES.SAVE_MAPPING')}`,
        prompt: {
          model: '',
          isValid: val => val.length > 0,
          type: 'text'
        },
        ok: this.$t('BUTTONS.OK'),
        cancel: this.$t('BUTTONS.CANCEL'),
        persistent: true
      }).onOk(mappingName => {
        let fileStore: any = localStorage.getItem('store-fileSourceList')
        const state = {date: new Date(), name: mappingName, data: this.$store.state.file}
        if (this.dataSourceType === DataSourceType.DB) {
          state['dbConnectionOptions'] = this.dbConnectionOptions
        }
        if (fileStore) {
          fileStore = JSON.parse(fileStore) as any[]
          fileStore.push(state)
        } else {
          fileStore = [state]
        }
        localStorage.setItem('store-fileSourceList', JSON.stringify(fileStore))
        this.$notify.success(String(this.$t('SUCCESS.MAPPINGS_HAVE_BEEN_SAVED')))
      })
    }

    previousStep () {
      this.$q.dialog({
        title: `<span class="text-primary"><i class="fas fa-info-circle q-pr-sm"></i>${this.$t('TITLES.PREVIOUS_STEP')}</span>`,
        message: `${this.$t('WARNING.IF_YOU_GO_BACK')}`,
        class: 'text-grey-9',
        ok: this.$t('BUTTONS.OK'),
        cancel: this.$t('BUTTONS.CANCEL'),
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
          const fixedUri = node.fixedUri || node.selectedUri
          if (FHIRUtil.isMultiDataTypeForm(node.value) && node.type?.length === 1) {
            type = node.type[0].value
          }
          if (node.selectedType) {
            type = node.selectedType
            node.selectedType = undefined
          }
          if (node.selectedReference) node.selectedReference = undefined
          if (node.selectedUri) node.selectedUri = undefined
          return {
            value: node.value,
            resource: this.currentFHIRRes,
            profile: this.currentFHIRProf,
            type,
            fixedUri
          } as store.Target
        })
        for (const column of this.selectedAttr) {
          if (!column['target']) column['target'] = [...this.tickedFHIRAttr]
          else column['target'].push(...this.tickedFHIRAttr)
        }

        ([this.selectedAttr, this.tickedFHIRAttr] = [[], []])
        this.$notify.success(String(this.$t('SUCCESS.TARGET_VALUE_MATCHED')))
      } else {
        this.$notify.error(String(this.$t('ERROR.CHOOSE_A_TYPE')))
      }
    }

    addRecord () {
      const bufferItems: BufferElement[] = this.bufferSheetHeaders.filter(_ => _.target && _.target.length && (_.value || _.defaultValue))

      if (!bufferItems.length) {
        this.$notify.error(String(this.$t('WARNING.MATCH_THE_FIELDS_FIRST')))
        return
      }

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
            header.defaultValue = buffer.defaultValue
            if (!filteredHeaders.length) {
              sheet.headers.push(header)
            }

          })).then(_ => {
            this.editRecordId = ''
            this.$store.commit(types.File.SETUP_BUFFER_SHEET_HEADERS)
            this.$notify.success(String(this.$t('SUCCESS.MAPPING_IS_ADDED')))
            this.loadSavedRecords()
          })
        }
      } else {
        this.$notify.error(String(this.$t('ERROR.ST_WRONG_SAVING_RECORD')))
      }
    }

    editRecord (fileName: string, sheetName: string, mappingRecord: store.Record) {
      new Promise(resolve => {
        if (this.currentSource.path !== fileName) {
          this.currentSource = this.fileSourceList.filter(_ => _.path === fileName)[0]
        }
        if (this.currentSheet?.value !== sheetName) {
          this.currentSource.currentSheet = this.currentSource.sheets!.filter(_ => _.value === sheetName)[0]
        }
        if (this.currentFHIRRes !== mappingRecord.resource) {
          this.currentFHIRRes = mappingRecord.resource
        }
        if (mappingRecord.profile && this.currentFHIRProf !== mappingRecord.profile) {
          setTimeout(() => { this.currentFHIRProf = mappingRecord.profile }, 0)
        }
        resolve()
      }).then(() => {
        this.editRecordId = mappingRecord.recordId
        this.$q.loading.show()
        this.$store.commit(types.File.SETUP_BUFFER_SHEET_HEADERS)
        const file = this.savedRecords.filter(_ => _.fileName === fileName) || []
        if (file.length === 1) {
          const sheet = file[0].sheets?.filter(_ => _.sheetName === sheetName) || []
          if (sheet.length === 1) {
            const record = sheet[0].records?.filter(_ => _.recordId === this.editRecordId)
            const sourceAttrs: store.SourceTargetGroup[] = record[0].data || []
            sourceAttrs.map(_ => {
              const tmp: BufferElement[] = this.bufferSheetHeaders.filter(field => _.value && field.value === _.value) || []
              if (tmp.length) {
                tmp[0].defaultValue = _.defaultValue
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
          this.$notify.error(String(this.$t('ERROR.SOMETHING_WENT_WRONG')))
        }
        this.$q.loading.hide()

        // Scroll to the top of this component
        this.$el.scrollIntoView()
      })
    }

    removeRecordPopup (fileName: string, sheetName: string, recordId: string) {
      this.$q.dialog({
        title: `<span class="text-negative"><i class="fas fa-trash q-pr-sm"></i>${this.$t('TITLES.DELETE_RECORD')}</span>`,
        message: `${this.$t('WARNING.DELETE_RECORD_WITH_ID', {id: recordId})}`,
        class: 'text-grey-9',
        cancel: this.$t('BUTTONS.CANCEL'),
        html: true,
        ok: this.$t('BUTTONS.DELETE')
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
              this.$notify.error(String(this.$t('ERROR.SOMETHING_WENT_WRONG')))
            })
        } else this.$q.loading.hide()
      } else {
        this.$q.loading.hide()
        this.$notify.error(String(this.$t('ERROR.SOMETHING_WENT_WRONG')))
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
        this.$notify.error(String(this.$t('ERROR.SOMETHING_WENT_WRONG')))
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

        // If there is an attribute selected from the data source, choose its defaultValue.
        const tickedNode = tickedNodes[0]
        // Otherwise, the defaultValue of the column containing the currently selected fhir element in its target will be selected.
        let currentElementType = tickedNode.type[0].value
        if (tickedNode.type[0]?.children?.length) {
          let selectedComplexType
          tickedNode.type[0].children.forEach(_ => {
            if (_.value === tickedNode.selectedType) {
              selectedComplexType = _.type[0].value
            }
          })
          if (selectedComplexType) {
            currentElementType = selectedComplexType
          }
        } else if (tickedNode.selectedType) {
          currentElementType = tickedNode.selectedType.split('.').pop()
        }
        const selectedDataSourceAttr = this.selectedAttr?.length && this.selectedAttr[0].target?.length ? this.selectedAttr[0] : undefined
        const defaultValuePropReq: DefaultValueAssignerItem = {
          defaultValue: selectedDataSourceAttr ? selectedDataSourceAttr.defaultValue : abstractColumn?.defaultValue,
          defaultSystem: (selectedDataSourceAttr ? selectedDataSourceAttr.target[0].fixedUri : abstractColumn?.target && abstractColumn.target[0].fixedUri) || tickedNode.fixedUri || tickedNode.selectedUri,
          isCodeable: this.isCodeableElement(currentElementType),
          isFixedUri: this.isCodeableElement(currentElementType) && !!tickedNode.fixedUri
        }
        this.$q.dialog({
          component: DefaultValueAssigner,
          parent: this,
          defaultValueProp: defaultValuePropReq
        })
          .onOk((defaultValueProp: DefaultValueAssignerItem) => {
            if (this.selectedAttr?.length && this.selectedAttr[0].target?.length) {
              this.selectedAttr[0].defaultValue = defaultValueProp.defaultValue
              if (defaultValuePropReq.isCodeable) {
                tickedNode.selectedUri = defaultValueProp.defaultSystem
                this.selectedAttr[0].target.forEach(_ => _.fixedUri = defaultValueProp.defaultSystem)
              }
            } else {
              if (!abstractColumn) {
                abstractColumn = {}
                this.bufferSheetHeaders.push(abstractColumn)
              }
              this.tickedFHIRAttr = tickedNodes.map((node: fhir.ElementTree) => {
                if (node.error) delete node.error
                let type: string
                const fixedUri = defaultValuePropReq.isCodeable ? defaultValueProp.defaultSystem || (node.fixedUri || node.selectedUri) : undefined
                if (FHIRUtil.isMultiDataTypeForm(node.value) && node.type?.length === 1) {
                  type = node.type[0].value
                }
                if (node.selectedType) {
                  type = node.selectedType
                  node.selectedType = undefined
                }
                if (node.selectedReference) node.selectedReference = undefined
                if (defaultValuePropReq.isCodeable) {
                  node.selectedUri = defaultValueProp.defaultSystem
                }
                return {
                  value: node.value,
                  resource: this.currentFHIRRes,
                  profile: this.currentFHIRProf,
                  type,
                  fixedUri
                } as store.Target
              })
              abstractColumn.defaultValue = defaultValueProp.defaultValue
              abstractColumn.target = [...this.tickedFHIRAttr]
            }
            // While removing the default value
            if (!defaultValueProp) {
              this.bufferSheetHeaders = this.bufferSheetHeaders.filter(_ => _.value || _.defaultValue)
            }
            this.tickedFHIRAttr = []
            this.selectedAttr = []
            this.$notify.success(String(this.$t('SUCCESS.DEFAULT_VALUE_HAS_BEEN_ASSIGNED')))
          })
      } else {
        if (this.bufferSheetHeaders?.length) {
          this.$notify.error(String(this.$t('ERROR.CHOOSE_A_TYPE')))
        } else {
          this.$notify.error(String(this.$t('ERROR.SELECT_A_TABLE')))
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
          this.editRecord(fileName, sheetName, mappingRecord)
        })
    }

    validateMapping (fileName: string, sheetName: string, mappingRecord: store.Record) {
      this.$q.dialog({
        title: `<span class="text-primary"><i class="fas fa-check-circle q-pr-sm"></i>${this.$t('TITLES.VALIDATE_CURRENT_MAPPING')}</span>`,
        message: `${this.$t('INFO.VALIDATING_ONLY_10_ROWS')}`,
        class: 'text-grey-9',
        ok: this.$t('BUTTONS.CONTINUE'),
        cancel: this.$t('BUTTONS.CANCEL'),
        html: true
      }).onOk(() => {
        this.$q.loading.show()
        new Promise(resolve => {
          let sheets = this.savedRecords.find((files: store.SavedRecord) => files.fileName === fileName)!.sheets
          sheets = sheets.filter((sheet: store.Sheet) => sheet.sheetName === sheetName)

          const validationReqBody: ValidationReqBody = {
            chunkSize: environment.FHIRBatchOperationSize,
            data: {filePath: fileName, sheets},
            rowNumber: 11 // Validate the first 10-row. The top row is header.
          }
          ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.Fhir.VALIDATE, validationReqBody)

          // In case of file reading failure
          ipcRenderer.on(ipcChannels.Fhir.VALIDATE_ERROR_X(fileName), (event, result) => {
            this.$q.loading.hide()
            // Because an error occurred, remove the sheets listeners for the current file
            ipcRenderer.removeAllListeners(ipcChannels.Fhir.VALIDATE_ERROR_X(fileName))
            ipcRenderer.removeAllListeners(ipcChannels.Fhir.VALIDATE_X(fileName, sheetName))
            resolve(result)
          })
          ipcRenderer.on(ipcChannels.Fhir.VALIDATE_X(fileName, sheetName), (event, result) => {
            this.$q.loading.hide()
            ipcRenderer.removeAllListeners(ipcChannels.Fhir.VALIDATE_X(fileName, sheetName))
            resolve(result)
          })
        })
          .then((validationOutcome: OutcomeDetail) => {
            this.$store.commit(types.Fhir.SET_OUTCOME_DETAILS, validationOutcome.outcomeDetails)
            this.$q.dialog({
              component: OutcomeCard,
              parent: this
            })
          })
          .catch(() => {
            this.$q.loading.hide()
          })
      })
    }

    isCodeableElement (type: string): boolean {
      return type === 'CodeableConcept' || type === 'Coding'
    }

    isBufferMappingEmpty () {
      const bufferItems: BufferElement[] = this.bufferSheetHeaders.filter(_ => _.target && _.target.length && (_.value || _.defaultValue))
      return !bufferItems?.length
    }

  }
</script>

<style lang="stylus">
  .separator-style
    width 12px !important
</style>
