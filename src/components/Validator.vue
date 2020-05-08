<template>
  <div>
    <q-toolbar class="bg-grey-4 top-fix-column">
      <q-toolbar-title class="text-grey-8">
        Curation - <span class="text-subtitle1">Validator</span>
      </q-toolbar-title>
    </q-toolbar>
    <q-card flat bordered class="q-ma-sm">
      <q-card-section>
        <q-table flat binary-state-sort title="Validate" :data="mappingList" :columns="columns" row-key="name"
                 :rows-per-page-options="[0]" :pagination.sync="pagination" :filter="filter" class="sticky-header-table"
                 :loading="loading" color="primary" selection="multiple" :selected.sync="tablesToValidate"
        >
          <template v-slot:top-right>
            <q-input borderless dense v-model="filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th class="q-table--col-auto-width">
                <q-checkbox dense v-model="props.selected" />
              </q-th>
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="bg-primary text-white"
              >
                <q-icon v-if="col.icon" :name="col.icon" />
                <span class="vertical-middle q-ml-xs">{{ col.label }}</span>
              </q-th>
              <q-th class="bg-primary text-white" auto-width>
                Details
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td class="q-table--col-auto-width">
                <q-checkbox dense v-model="props.selected"/>
              </q-td>
              <q-td key="status" class="no-padding" :props="props">
                <template v-if="isInProgress(props.row.validation.status)">
                  <span>
                    <q-spinner color="grey-9" />
                    <q-tooltip content-class="bg-white text-grey-8">Generating resources...</q-tooltip>
                  </span>
                </template>
                <template v-else-if="isValidating(props.row.validation.status)">
                  <span>
                    <q-spinner color="grey-9" />
                    <q-tooltip content-class="bg-white text-grey-8">Validating...</q-tooltip>
                  </span>
                </template>
                <template v-else-if="isSuccess(props.row.validation.status)">
                  <q-icon name="check" color="positive">
                    <q-tooltip content-class="bg-white text-green">Completed</q-tooltip>
                  </q-icon>
                </template>
                <template v-else-if="isWarning(props.row.validation.status)">
                  <q-icon name="warning" color="orange-6">
                    <q-tooltip content-class="bg-white text-orange-6">Warning</q-tooltip>
                  </q-icon>
                </template>
                <template v-else-if="isError(props.row.validation.status)">
                  <q-icon name="error" color="negative">
                  </q-icon>
                </template>
                <template v-else>
                  <q-icon name="access_time" color="grey-9">
                    <q-tooltip content-class="bg-white text-grey-8">Pending</q-tooltip>
                  </q-icon>
                </template>
              </q-td>
              <q-td key="file" :props="props">
                <q-btn dense round flat size="sm" :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'" @click="props.expand = !props.expand" />
                {{ props.row.file }}
              </q-td>
              <q-td key="sheet" :props="props">
                {{ props.row.sheet }}
              </q-td>
              <q-td key="targets" :props="props" class="text-weight-bold">
                {{ computedSavedRecord(props.row.file, props.row.sheet).length }}
              </q-td>
              <q-td>
                <template v-if="isInProgress(props.row.validation.status)">
                  <span class="text-grey-8 q-pl-sm text-size-sm">Creating...</span>
                </template>
                <template v-else-if="isValidating(props.row.validation.status)">
                  <span class="text-grey-8 q-pl-sm text-size-sm">Validating...</span>
                </template>
                <q-btn v-else-if="isSuccess(props.row.validation.status) || isWarning(props.row.validation.status)" flat rounded icon="receipt"
                       color="primary" label="Details" size="sm" class="text-center"
                       @click="openOutcomeDetailCard(props.row.validation.outcomeDetails)" no-caps
                />
                <q-btn v-else-if="isError(props.row.validation.status)" flat rounded icon="error" color="negative"
                       label="Details" size="sm" class="text-center" no-caps
                       @click="openOutcomeDetailCard(props.row.validation.outcomeDetails)"
                />
                <template v-else>
                  <span class="text-grey-8 q-pl-sm text-size-sm">Pending</span>
                </template>
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%" class="bg-grey-2">
                <q-card flat bordered>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar>
                        <q-icon name="far fa-file-alt" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ props.row.sheet }}</q-item-label>
                      <q-item-label caption>{{ props.row.file }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label>Total</q-item-label>
                      <q-item-label caption>{{ (props.row.info && props.row.info.total) || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator />
                  <q-card-section class="text-subtitle1">
                    <q-list v-if="savedRecords.length" class="row">
                      <div v-for="(record, index) in computedSavedRecord(props.row.file, props.row.sheet)" :key="index"
                           class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                        <q-card class="q-ma-xs" bordered flat>
                          <q-card-section class="text-caption bg-grey-3 text-weight-bold q-pa-xs">
                            <div class="row items-center">
                              <q-chip class="text-white text-size-md" color="blue-grey-4">#{{record.recordId}}</q-chip>
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
                                <div class="col-3 ellipsis items-center text-size-sm">{{ column.value }}</div>
                                <div class="row col">
                                  <q-chip dense v-for="(target, targetI) in column.target" :key="targetI"
                                          color="primary" text-color="white" class="cursor-pointer">
                                    <div class="q-mx-xs ellipsis text-size-sm">{{ target.value }}</div>
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
                                      <div class="q-mx-xs ellipsis text-size-sm">-</div>
                                    </q-chip>
                                  </div>
                                </div>
                              </q-item>
                            </q-list>
                          </q-card-section>
                        </q-card>
                      </div>
                    </q-list>
                    <div v-else class="text-grey-7">
                      No content
                    </div>
                  </q-card-section>
                </q-card>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <div class="row content-end q-gutter-sm">
          <q-space />
          <q-btn v-if="isSuccess(validationStatus)" label="Export Resources" color="green" icon="publish"
                 class="q-mt-lg" @click="exportResources" no-caps />
          <q-btn outline label="Validate" icon="verified_user" :color="isInProgress(validationStatus) ? 'grey-7' : 'green-7'"
                 :disable="isInProgress(validationStatus)" @click="validate" class="q-mt-lg" no-caps>
              <span class="q-ml-sm">
                <q-spinner class="q-ml-sm" size="xs" v-show="isInProgress(validationStatus)" />
                <q-icon name="check" size="xs" color="green" v-show="isSuccess(validationStatus)" />
                <q-icon name="error" size="xs" color="red" v-show="isError(validationStatus)" />
                <q-icon name="warning" size="xs" color="orange-6" v-show="isWarning(validationStatus)" />
              </span>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
    <div class="row q-pa-sm">
      <q-btn unelevated label="Back" color="primary" icon="chevron_left" @click="previousStep" no-caps />
      <q-space />
      <div class="q-gutter-sm">
        <q-btn outline label="Continue Anyway" icon-right="error_outline" color="primary" v-if="isError(validationStatus)"
               @click="nextStep" no-caps />
        <q-btn unelevated label="Next" icon-right="chevron_right" color="primary" :disable="!isSuccess(validationStatus)"
               @click="nextStep" no-caps />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Mixins } from 'vue-property-decorator'
  import { FileSource, Record, Sheet, SourceDataElement } from '@/common/model/file-source'
  import { ipcRenderer } from 'electron'
  import { validatorTable } from '@/common/model/data-table'
  import { FHIRUtil } from '@/common/utils/fhir-util'
  import OutcomeCard from '@/components/modals/OutcomeCard.vue'
  import electronStore from '@/common/electron-store'
  import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import Status from '@/common/Status'
  import StatusMixin from '@/common/mixins/statusMixin'

  @Component
  export default class Validator extends Mixins(StatusMixin) {
    // Mapping data grouped by file and sheets
    private mappingObj: Map<string, any> = new Map<string, any>()
    private columns = validatorTable.columns
    private pagination = validatorTable.pagination
    private filter: string = ''
    private loading: boolean = false
    private Status = Status
    private tablesToValidate = []

    get fileSourceList (): FileSource[] { return this.$store.getters[types.File.SOURCE_LIST] }
    get savedRecords (): store.SavedRecord[] { return this.$store.getters[types.File.SAVED_RECORDS] }

    get mappingList (): any[] { return this.$store.getters[types.MAPPING_LIST] }
    set mappingList (value) { this.$store.commit(types.SET_MAPPING_LIST, value) }

    get validationStatus (): status { return this.$store.getters[types.VALIDATION_STATUS] }
    set validationStatus (value) { this.$store.commit(types.SET_VALIDATION_STATUS, value) }

    get resources (): Map<string, fhir.Resource[]> { return this.$store.getters[types.RESOURCES] }
    set resources (value) { this.$store.commit(types.SET_RESOURCES, value) }

    get transformList (): TransformListItem[] { return this.$store.getters[types.TRANSFORM_LIST] }
    set transformList (value) { this.$store.commit(types.SET_TRANSFORM_LIST, value) }

    mounted () {
      this.loading = true
      this.getMappings()
        .then(_ => this.loading = false)
        .catch(_ => this.loading = false)
      this.tablesToValidate = this.mappingList.slice()
    }

    computedSavedRecord (fileName: string, sheetName: string): store.Record[] {
      const files: store.SavedRecord[] = this.savedRecords.filter(_ => _.fileName === fileName)
      if (files.length) {
        const sheets: store.Sheet[] = files[0].sheets.filter(_ => _.sheetName === sheetName)
        if (sheets.length) {
          return sheets[0].records
        } else return []
      } else return []
    }

    validate () {
      // Init status
      this.validationStatus = Status.IN_PROGRESS
      // If there are resources created, clear them
      electronStore.set('resources', null)
      const filePathList = Object.keys(FHIRUtil.groupBy(this.tablesToValidate, 'file'))

      if (!filePathList.length) {
        this.$notify.error('No mapping available')
        this.validationStatus = Status.PENDING
        return
      }

      // Submit each file to create resources and validate them
      Promise.all(filePathList.map((filePath: string) => {
        return new Promise((resolveFile, rejectFile) => {
          this.$q.loading.show({
            message: `Loading ${filePath.split('\\').pop()}...`
          })
          this.mappingList = this.mappingList.map(_ => {
            if (_.file === filePath) {
              _.validation = {status: Status.IN_PROGRESS}
            }
            return _
          })
          // const sheets = this.mappingObj[filePath]
          const sheets = this.savedRecords.find((files: store.SavedRecord) => files.fileName === filePath)!.sheets

          ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.Fhir.VALIDATE, {filePath, sheets})

          ipcRenderer.on(`validate-read-file-${filePath}`, (event, result) => {
            this.$q.loading.hide()
            ipcRenderer.removeAllListeners(`validate-read-file-${filePath}`)
          })

          // In case of file reading failure
          // Delete all other sheets listeners in that file
          ipcRenderer.on(`validate-error-${filePath}`, (event, result) => {
            this.$q.loading.hide()
            ipcRenderer.removeAllListeners(`validate-error-${filePath}`)
            // Remove all listeners for sheets in the file
            Object.keys(this.mappingObj[filePath]).map(sheet => {
              this.mappingList = this.mappingList.map(_ => {
                if (_.file === filePath && _.sheet === sheet) {
                  _.validation = result
                }
                return _
              })
              ipcRenderer.removeAllListeners(`validate-${filePath}-${sheet}`)
            })
            rejectFile(false)
          })

          Promise.all(Object.keys(this.mappingObj[filePath]).map(sheet => {
            return new Promise((resolveSheet, rejectSheet) => {
              ipcRenderer.on(`info-${filePath}-${sheet}`, (event, result) => {
                this.mappingList = this.mappingList.map(item => {
                  if ((item.file === filePath) && (item.sheet === sheet)) {
                    if (!item.info) item.info = {}
                    Object.assign(item.info, result)
                  }
                  return item
                })
                // TODO:
                ipcRenderer.removeAllListeners(`info-${filePath}-${sheet}`)
              })
              ipcRenderer.on(`generated-resources-${filePath}-${sheet}`, (event, result) => {
                ipcRenderer.removeAllListeners(`generated-resources-${filePath}-${sheet}`)

                // Update status of mapping entries
                this.mappingList = this.mappingList.map(_ => {
                  if (_.file === filePath && _.sheet === sheet) {
                    _.validation = result
                  }
                  return _
                })
              })
              ipcRenderer.on(`validate-${filePath}-${sheet}`, (event, result) => {
                ipcRenderer.removeAllListeners(`validate-${filePath}-${sheet}`)

                // Update status of mapping entries
                this.mappingList = this.mappingList.map(_ => {
                  if (_.file === filePath && _.sheet === sheet) {
                    _.validation = result
                  }
                  return _
                })
                if (result && this.isSuccess(result.status)) {
                  // this.$log.success('Validation', `Validation is completed ${sheet} in ${filePath}`)
                  resolveSheet()
                } else {
                  // this.$log.error('Validation', `${result.description}. Validation error for ${sheet} in ${filePath}. For more details see logs`)
                  // Reject even if a resource has error
                  rejectSheet()
                }
              })
            })
          }))
            .then(() => resolveFile(true))
            .catch(() => rejectFile(false))
        }).catch(_ => _)
      }))
        .then(_ => this.validationStatus = this.validationStatus = _.includes(false) ? Status.ERROR : Status.SUCCESS)
        .catch(_ => this.validationStatus = Status.ERROR)
    }

    getMappings (): Promise<any> {
      return Promise.all(this.fileSourceList.map((file: FileSource) => {
        this.mappingObj[file.path] = {}
        const currFile = this.mappingObj[file.path]
        return Promise.all(file.sheets?.map((sheet: Sheet) => {

          const columns = (sheet.headers?.filter(h => h.record?.length) || []) as SourceDataElement[]
          currFile[sheet.label] = []

          return Promise.all(columns.map((column: SourceDataElement) => {

            // const groupIds = column.group ? Object.keys(column.group) : []
            column.record!.map((record: Record) => {
              if (record.target && record.target.length) {
                currFile[sheet.label].push({recordId: record.recordId, value: column.value, type: column.type, target: record.target})
              }
            })
          })).then(_ => {
            if (!currFile[sheet.label].length) Vue.delete(currFile, sheet.label)
          })
        }) || [])
      }))
    }

    previousStep () {
      this.$q.dialog({
        title: '<span class="text-primary"><i class="fas fa-info-circle q-pr-sm"></i>Previous Step</span>',
        message: 'If you go back and make any change, the changes you have made in this section will be lost.',
        class: 'text-grey-9',
        cancel: true,
        html: true
      }).onOk(() => {
        this.$store.commit(types.DECREMENT_STEP)
      })
    }

    openOutcomeDetailCard (outcomeDetails: OutcomeDetail[]) {
      this.$store.commit(types.Fhir.SET_OUTCOME_DETAILS, outcomeDetails)
      this.$q.dialog({
        component: OutcomeCard,
        parent: this
      })
    }

    exportResources () {
      const resources: any = electronStore.get('resources')
      this.$q.loading.show({spinner: undefined})

      ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.EXPORT_FILE, JSON.stringify(resources))
      ipcRenderer.on(ipcChannels.File.EXPORT_DONE, (event, result) => {
        if (result) {
          this.$notify.success('File is successfully exported')
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners(ipcChannels.File.EXPORT_DONE)
      })
    }

    nextStep () {
      try {
        this.resources = new Map(Object.entries(electronStore.get('resources') || {}))
        this.transformList = Array.from(this.resources.entries()).map(resource => ({resourceType: resource[0], count: resource[1].length, status: Status.PENDING}))
        this.$store.commit(types.SET_TRANSFORM_STATUS, Status.PENDING)
        this.$store.commit(types.INCREMENT_STEP)
      } catch (e) {
        this.$notify.error('Cannot load created resources. Try again')
      }
    }

  }
</script>

<style lang="stylus">
  .error-tooltip
    width 250px
</style>
