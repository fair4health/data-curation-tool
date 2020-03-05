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
                 table-style="max-height: 60vh" :loading="loading" color="primary"
        >
          <template v-slot:top-right>
            <q-input borderless dense v-model="filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:header-cell="props">
            <q-th :props="props" class="bg-primary text-white" style="font-size: 13px">
              <q-icon v-if="props.col.icon" :name="props.col.icon" />
              <span class="vertical-middle q-ml-xs">{{ props.col.label }}</span>
            </q-th>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="status" class="no-padding" :props="props">
                <template v-if="props.row.validation.status === 'in-progress'">
                  <span>
                    <q-spinner color="grey-9" />
                    <q-tooltip content-class="bg-white text-grey-8">Validating...</q-tooltip>
                  </span>
                </template>
                <template v-else-if="props.row.validation.status === 'done'">
                  <div class="row items-center">
                    <div class="col-6">
                      <q-icon name="check" color="green">
                        <q-tooltip content-class="bg-white text-green">Completed</q-tooltip>
                      </q-icon>
                    </div>
                    <div class="col-6 bg-grey-3">
                      <q-btn flat dense icon="feedback" color="grey-8" label="Details" size="sm"
                             @click="openOutcomeDetailCard(props.row.validation.outcomeDetails)" no-caps />
                    </div>
                  </div>
                </template>
                <template v-else-if="props.row.validation.status === 'warning'">
                  <q-icon name="warning" color="orange-6" @click="openOutcomeDetailCard(props.row.validation.outcomeDetails)">
                    <q-tooltip content-class="bg-white text-orange-6">{{ props.row.validation.description }}</q-tooltip>
                  </q-icon>
                </template>
                <template v-else-if="props.row.validation.status === 'error'">
                  <q-icon name="error_outline" color="red" class="cursor-pointer"
                          @click="openOutcomeDetailCard([{status: 'error', message: props.row.validation.description, resourceType: 'OperationOutcome'}])">
                    <q-tooltip content-class="error-tooltip bg-white text-red-7" class="ellipsis-3-lines">{{ props.row.validation.description }}</q-tooltip>
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
                              <q-chip class="text-grey-8" color="white" style="font-size: 12px">#{{record.recordId}}</q-chip>
                            </div>
                            <div class="row">
                              <div class="text-grey-8 text-weight-regular">
                                <q-chip dense class="text-grey-8" color="white" style="font-size: 11px">
                                  <span class="text-weight-bold"> {{ record.resource }} </span> - {{record.profile}}
                                </q-chip>
                              </div>
                            </div>
                          </q-card-section>
                          <q-card-section>
                            <q-list separator>
                              <q-item v-for="(column, index) in record.data" :key="index">
                                <div class="col-3 ellipsis items-center" style="font-size: 12px">{{ column.value }}</div>
                                <div class="row col">
                                  <q-chip dense v-for="(target, targetI) in column.target" :key="targetI"
                                          color="primary" text-color="white" class="cursor-pointer">
                                    <div class="q-mx-xs row ellipsis-2-lines" style="font-size: 12px">{{ target.value }}</div>
                                    <q-tooltip>{{ target.value }}</q-tooltip>
                                  </q-chip>
                                </div>
                                <div class="row col q-pl-xs">
                                  <div v-for="(target, targetI) in column.target" :key="targetI" class="full-width">
                                    <q-chip dense v-if="!!target.type"
                                            color="grey-2" text-color="grey-8" class="cursor-pointer">
                                      <div class="q-mx-xs ellipsis" style="font-size: 11px">{{ target.type }}</div>
                                      <q-tooltip>{{ target.type }}</q-tooltip>
                                    </q-chip>
                                    <q-chip v-else dense color="white" text-color="grey-8">
                                      <div class="q-mx-xs ellipsis" style="font-size: 12px">-</div>
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
          <q-btn v-if="validationStatus==='success'" label="Export Resources" color="green" icon="publish"
                 class="q-mt-lg" @click="exportResources" no-caps />
          <q-btn outline label="Validate" icon="verified_user" :color="validationStatus==='in-progress' ? 'grey-7' : 'green-7'"
                 :disable="validationStatus === 'in-progress'" @click="validate" class="q-mt-lg" no-caps>
              <span class="q-ml-sm">
                <q-spinner class="q-ml-sm" size="xs" v-show="validationStatus==='in-progress'" />
                <q-icon name="check" size="xs" color="green" v-show="validationStatus==='success'" />
                <q-icon name="error_outline" size="xs" color="red" v-show="validationStatus==='error'" />
              </span>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
    <div class="row q-ma-md">
      <q-btn unelevated label="Back" color="primary" icon="chevron_left" @click="previousStep" no-caps />
      <q-space />
      <q-btn unelevated label="Next" icon-right="chevron_right" color="primary" :disable="validationStatus !== 'success'"
             @click="$store.commit('incrementStep')" no-caps />
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { FileSource, Record, Sheet, SourceDataElement } from '@/common/model/file-source'
  import { ipcRenderer } from 'electron'
  import { mappingDataTableHeaders } from '@/common/model/data-table'
  import { FHIRUtil } from '@/common/utils/fhir-util'
  import OutcomeCard from '@/components/OutcomeCard.vue'
  import electronStore from '@/common/electron-store'

  @Component
  export default class Validator extends Vue {
    // Mapping data grouped by file and sheets
    private mappingObj: Map<string, any> = new Map<string, any>()
    private pagination = { page: 1, rowsPerPage: 0 }
    private filter: string = ''
    private loading: boolean = false

    get columns (): object[] { return mappingDataTableHeaders }
    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }
    get savedRecords (): store.SavedRecord[] { return this.$store.getters['file/savedRecords'] }
    get fhirBase (): string { return this.$store.getters['fhir/fhirBase'] }

    get mappingList (): any[] { return this.$store.getters['mappingList'] }
    set mappingList (value) { this.$store.commit('setMappingList', value) }

    get validationStatus (): status { return this.$store.getters['validationStatus'] }
    set validationStatus (value) { this.$store.commit('setValidationStatus', value) }

    mounted () {
      this.loading = true
      this.getMappings()
        .then(_ => this.loading = false)
        .catch(_ => this.loading = false)
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
      this.validationStatus = 'in-progress'
      // If there are resource-generators created, clear them
      electronStore.set('resources', null)
      const filePathList = Object.keys(FHIRUtil.groupBy(this.mappingList, 'file'))

      if (!filePathList.length) {
        this.$q.notify({message: 'No mapping available', color: 'red-8'})
        this.validationStatus = 'pending'
        return
      }

      // Submit each file to create resource-generators and validate them
      filePathList.reduce((promise: Promise<any>, filePath: string) =>
        promise.finally(() => new Promise((resolveFile, rejectFile) => {
          this.$q.loading.show({
            message: `Loading ${filePath.split('\\').pop()}...`
          })
          this.mappingList = this.mappingList.map(_ => {
            if (_.file === filePath) {
              _.validation = {status: 'in-progress'}
            }
            return _
          })
          // const sheets = this.mappingObj[filePath]
          const sheets = this.savedRecords.find((files: store.SavedRecord) => files.fileName === filePath)!.sheets

          ipcRenderer.send('validate', this.fhirBase, {filePath, sheets})

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
            rejectFile()
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
              ipcRenderer.on(`validate-${filePath}-${sheet}`, (event, result) => {
                ipcRenderer.removeAllListeners(`validate-${filePath}-${sheet}`)

                // Update status of mapping entries
                this.mappingList = this.mappingList.map(_ => {
                  if (_.file === filePath && _.sheet === sheet) {
                    _.validation = result
                  }
                  return _
                })
                if (result && result.status === 'done') {
                  this.$log.success('Validation', `Validation is completed ${sheet} in ${filePath}`)
                  resolveSheet()
                } else {
                  this.$log.error('Validation', `${result.description}. Validation error for ${sheet} in ${filePath}. For more details see logs`)
                  rejectSheet()
                }
              })
            })
          }))
            .then(() => resolveFile())
            .catch(() => rejectFile())
        }))
        , Promise.resolve())
        .then(_ => this.validationStatus = 'success')
        .catch(_ => this.validationStatus = 'error')
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
        title: '<i class="fas fa-info text-primary"> Previous Step </i>',
        message: 'If you go back and make any change, the changes you have made in this section will be lost.',
        class: 'text-grey-9',
        cancel: true,
        html: true
      }).onOk(() => {
        this.$store.commit('decrementStep')
      })
    }

    openOutcomeDetailCard (outcomeDetails: OutcomeDetail[]) {
      this.$store.commit('fhir/setOutcomeDetails', outcomeDetails)
      this.$q.dialog({
        component: OutcomeCard,
        parent: this
      })
    }

    exportResources () {
      const resources: any = electronStore.get('resources')
      ipcRenderer.send('export-file', JSON.stringify(resources))
      ipcRenderer.on('export-done', (event, result) => {
        if (result) {
          this.$q.notify({message: 'File is successfully exported', color: 'green-6'})
        } else {
          this.$q.notify({message: 'Something went wrong, try again', color: 'red-6'})
        }
        ipcRenderer.removeAllListeners('export-done')
      })
    }

  }
</script>

<style lang="stylus">
  .error-tooltip
    width 250px
</style>