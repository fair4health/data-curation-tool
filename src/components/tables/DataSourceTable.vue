<template>
  <div>
    <q-card flat class="bg-white">
      <q-card-section class="row q-col-gutter-sm">
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-item-label class="text-weight-bold">
            <span><q-icon name="fas fa-file" size="xs" color="primary" class="q-mr-xs" /> {{ $t('LABELS.SOURCE_FILE') }}</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense options-dense v-model="currentSource" class="ellipsis" :options="fileSourceList" option-value="path"
                    :label="$t('LABELS.SOURCE_FILE')">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section avatar>
                  <q-icon name="fas fa-file" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt.label" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-item-label class="text-weight-bold">
            <span><q-icon name="far fa-file-alt" size="xs" color="primary" class="q-mr-xs" /> {{ $t('LABELS.SHEETS') }}</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense options-dense v-model="currentSheet" class="ellipsis" :options="sheets" :label="$t('LABELS.SHEETS')" :disable="!sheets.length">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section avatar>
                  <q-icon name="far fa-file-alt" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt.label" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </q-card-section>
      <div class="row q-px-md bg-grey-1">
        <div class="col q-gutter-xs">
          <q-toggle v-model="showMappedFields"
                    checked-icon="check"
                    size="xs"
                    color="primary"
                    :label="$t('BUTTONS.SHOW_MAPPED_FIELDS_ONLY')"
                    class="text-grey-8 text-size-lg"
                    unchecked-icon="clear"
          />
          <q-btn v-if="currentSheet"
                 flat
                 rounded
                 :label="$t('BUTTONS.RELOAD_FILE')"
                 icon="sync"
                 color="grey-1"
                 text-color="grey-8"
                 class="text-size-lg"
                 @click="fetchHeaders(true)"
                 no-caps
          />
          <q-btn v-if="currentSheet"
                 flat
                 rounded
                 :label="$t('BUTTONS.SNAPSHOT_OF_DATA')"
                 icon="visibility"
                 color="grey-1"
                 text-color="grey-8"
                 class="text-size-lg"
                 @click="viewSnapshotData"
                 no-caps
          />
        </div>
<!--        <q-btn unelevated stretch :label="$t('BUTTONS.OPTIONS')" color="grey-3" text-color="grey-8" class="text-size-lg" no-caps>-->
<!--          <q-badge v-if="filterCount" color="primary" class="text-size-xs" floating>-->
<!--            {{ filterCount }}-->
<!--          </q-badge>-->
<!--          <q-menu>-->
<!--            <q-list padding class="menu-list">-->
<!--              <q-item clickable dense>-->
<!--                <q-item-section>-->
<!--                  <q-toggle v-model="showMappedFields"-->
<!--                            checked-icon="check"-->
<!--                            size="xs"-->
<!--                            color="primary"-->
<!--                            :label="$t('BUTTONS.SHOW_MAPPED_FIELDS_ONLY')"-->
<!--                            class="text-grey-8 text-size-lg"-->
<!--                            unchecked-icon="clear"-->
<!--                  />-->
<!--                </q-item-section>-->
<!--              </q-item>-->
<!--            </q-list>-->
<!--          </q-menu>-->
<!--        </q-btn>-->
        <q-space />
        <q-input standout="bg-primary" rounded dense v-model.lazy.trim="filterText" :placeholder="$t('BUTTONS.SEARCH')" @keydown.esc="filterText = ''">
          <template v-slot:append>
            <q-icon v-if="!filterText" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="filterText = ''" />
          </template>
        </q-input>
      </div>
      <q-card-section>
        <q-table flat class="sticky-header-table q-mb-lg table-card-section" :data="filteredBufferSheetHeaders" binary-state-sort
                 :columns="dataSourceColumns" row-key="value" selection="multiple" :selected.sync="selectedAttr"
                 :loading="loadingAttr" :grid="$q.screen.lt.sm" :rows-per-page-options="[10, 20, 0]" :pagination.sync="pagination"
                 color="primary" table-class="data-source-table" :filter="filterText" :filter-method="filterTable"
                 :rows-per-page-label="$t('TABLE.RECORDS_PER_PAGE')"
        >
          <template v-slot:header-cell="props">
            <q-th :props="props" class="text-grey-7">
              <template v-if="props.col.name === 'conceptMap' && !isSuccess(tBaseVerificationStatus)">
                <q-icon name="help" color="warning" class="cursor-pointer" size="xs">
                  <q-tooltip>
                    No terminology service is connected.
                  </q-tooltip>
                </q-icon>
              </template>
              <q-icon v-if="props.col.icon" :name="props.col.icon" />
              <span class="vertical-middle q-ml-xs">{{ $t(props.col.label) }}</span>
              <q-tooltip v-if="props.col.description" max-width="200px" anchor="center right" self="center left"
                         :offset="[0, 5]" transition-show="scale" transition-hide="scale"
              >
                <span class="text-subtitle2 text-weight-light text-italic">{{ props.col.description }}</span>
              </q-tooltip>
            </q-th>
          </template>
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <div class="cursor-pointer">
                <q-badge color="green" :label="props.row.type" />
                <q-popup-edit v-model="props.row.type" buttons @save="onSaveFieldType">
                  <q-item-label class="text-weight-bold">Type</q-item-label>
                  <q-separator spaced />
                  <q-select filled dense v-model="props.row.type" :options="fieldTypes" class="select-input" />
                </q-popup-edit>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-target="props">
            <q-td :props="props">
              <div v-for="(target, index) in props.row.target" :key="index">
                <q-chip dense removable @remove="removeTarget(props.row.value, index)" color="orange" text-color="white">
                  <span class="q-mx-xs text-size-sm">{{ target.value }}</span>
                </q-chip>
                <q-chip v-if="!!target.type" dense class="text-size-sm" color="grey-2" text-color="grey-8">
                  {{ target.type }}
                </q-chip>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-conceptMap="props">
            <q-td :props="props">
              <q-btn v-if="props.row.target"
                     :disable="!isSuccess(tBaseVerificationStatus)"
                     dense
                     unelevated
                     :icon="props.row.conceptMap && props.row.conceptMap.source ? 'edit' : 'add'"
                     :label="props.row.conceptMap && props.row.conceptMap.source ? 'Edit' : ''"
                     color="grey-2"
                     text-color="grey-9"
                     class="q-px-sm q-mr-sm text-size-md"
                     @click="editConceptMap(props.row)"
                     no-caps
              >
                <q-badge v-if="props.row.conceptMap && props.row.conceptMap.source" color="primary" class="text-size-xs" label="1" floating />
              </q-btn>
            </q-td>
          </template>
          <template v-slot:no-data="{ icon, message, filter }">
            {{message === 'Loading...' ? message : (currentSheet ? $t('LABELS.NO_DATA_AVAILABLE') : $t('LABELS.PLEASE_SELECT_A_SHEET'))}}
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { SourceDataElement, FileSource, Sheet, BufferElement } from '@/common/model/data-source'
  import { sourceDataTable, cellType } from '@/common/model/data-table'
  import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import StatusMixin from '@/common/mixins/statusMixin'
  import ConceptMapCard from '@/components/modals/ConceptMapCard.vue'
  import SnapshotDataCard from '@/components/modals/SnapshotDataCard.vue'

  @Component
  export default class DataSourceTable extends Mixins(StatusMixin) {
    private loadingAttr: boolean = false
    private sheetHeaders: SourceDataElement[] = []
    private dataSourceColumns = sourceDataTable.columns
    private pagination = sourceDataTable.pagination
    private filterText: string = ''
    private showMappedFields: boolean = false

    get fieldTypes (): string[] { return Object.values(cellType) }

    get fileSourceList (): FileSource[] { return this.$store.getters[types.File.SOURCE_LIST] }
    set fileSourceList (value) { this.$store.commit(types.File.UPDATE_SOURCE_LIST, value) }

    get currentSource (): FileSource { return this.$store.getters[types.File.CURRENT_FILE] }
    set currentSource (value) { this.$store.commit(types.File.SET_CURRENT_FILE, value) }

    get sheets (): Sheet[] { return this.$store.getters[types.File.SHEETS] }
    set sheets (value) { this.$store.commit(types.File.SET_SHEETS, value) }

    get currentSheet (): Sheet | null { return this.$store.getters[types.File.CURRENT_SHEET] }
    set currentSheet (value) { this.$store.commit(types.File.SET_CURRENT_SHEET, value) }

    get selectedAttr (): any { return this.$store.getters[types.File.SELECTED_HEADERS] }
    set selectedAttr (value) { this.$store.commit(types.File.SET_SELECTED_HEADERS, value) }

    get bufferSheetHeaders (): BufferElement[] { return this.$store.getters[types.File.BUFFER_SHEET_HEADERS] }
    set bufferSheetHeaders (value) { this.$store.commit(types.File.SET_BUFFER_SHEET_HEADERS, value) }

    get filteredBufferSheetHeaders (): BufferElement[] {
      return this.bufferSheetHeaders.filter(_ => _.value && (!this.showMappedFields || _.target))
    }
    get tBaseVerificationStatus (): status { return this.$store.getters[types.Terminology.T_BASE_VERIFICATION_STATUS] }
    get filterCount (): number {
      let count: number = 0
      if (this.showMappedFields) count++
      return count
    }

    created () {
      this.bufferSheetHeaders = []
      if (!this.currentSource) this.currentSource = this.fileSourceList[0]
      if (this.currentSheet) this.onSheetChanged()
      if (this.isSuccess(this.tBaseVerificationStatus)) {
        this.$q.loading.show({message: 'Fetching Concept Maps...', spinner: undefined})
        this.$store.dispatch(types.Terminology.GET_CODE_SYSTEMS, true)
          .then(() => this.$q.loading.hide())
          .catch(() => {
            this.$q.loading.hide()
            this.$notify.error(String(this.$t('ERROR.ST_WRONG_FETCHING_X', {name: 'Code Systems'})))
          })
      }
    }

    @Watch('currentSource')
    onSourceChanged (): void {
      if (!this.currentSource.sheets?.length) {
        this.fetchSheets()
      } else if (this.currentSource.sheets.length === 1) {
        // If there is only one sheet, select it as default
        this.currentSheet = this.currentSource.sheets[0]
      }
    }

    @Watch('currentSheet')
    onSheetChanged (): void {
      ([this.sheetHeaders, this.selectedAttr, this.bufferSheetHeaders] = [[], [], []])
      if (this.currentSheet) {
        // If headers have been already fetched, load from cache; else fetch headers from file
        if (this.currentSheet?.headers?.length)
          this.bufferSheetHeaders = this.currentSheet.headers.map(_ => ({type: _.type, value: _.value}))
        else
          this.fetchHeaders()
      }
    }

    filterTable (rows, terms) {
      terms = terms.toLowerCase()
      return rows.filter(row => (
        row.value?.toLowerCase().includes(terms) ||
        row.type?.toLowerCase().includes(terms) ||
        row.target?.filter(t => t.value?.toLowerCase().includes(terms)).length
      ))
    }

    fetchSheets (): void {
      this.loadingAttr = true
      this.$q.loadingBar.start()
      this.sheetHeaders = []
      ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.READ_FILE, this.currentSource.path)
      ipcRenderer.on(ipcChannels.File.READ_DONE, (event, worksheets) => {
        this.sheets = worksheets || []
        this.currentSheet = this.sheets?.length && this.sheets[0]
        this.loadingAttr = false
        this.$q.loadingBar.stop()
        ipcRenderer.removeAllListeners(ipcChannels.File.READ_DONE)
      })
    }

    fetchHeaders (noCache?: boolean): void {
      this.loadingAttr = true
      ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.GET_TABLE_HEADERS, {path: this.currentSource?.path, sheet: this.currentSheet?.value, noCache})
      ipcRenderer.on(ipcChannels.File.READY_TABLE_HEADERS, (event, headers) => {
        if (!headers.length) {
          this.$notify.error(String(this.$t('ERROR.HEADERS_COULDNT_BE_DETECTED')))
        }
        // this.bufferSheetHeaders = headers.map(_ => ({type: _.type, value: _.value}))
        this.$store.commit(types.File.SET_SHEET_HEADERS, headers)
        this.$store.commit(types.File.SETUP_BUFFER_SHEET_HEADERS)
        this.loadingAttr = false
        ipcRenderer.removeAllListeners(ipcChannels.File.READY_TABLE_HEADERS)
      })
    }

    viewSnapshotData (): void {
      this.$q.loading.show()
      ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.PREPARE_SNAPSHOT_DATA, {path: this.currentSource?.path, sheet: this.currentSheet?.value, noCache: false})
      ipcRenderer.on(ipcChannels.File.READY_SNAPSHOT_DATA, (event, entries) => {
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners(ipcChannels.File.READY_SNAPSHOT_DATA)
        if (!entries?.length) {
          this.$notify.error(String(this.$t('ERROR.NO_DATA_AVAILABLE')))
        }
        this.$q.dialog({
          component: SnapshotDataCard,
          parent: this,
          columns: this.bufferSheetHeaders.filter(_ => _.value).map(_ => ({name: _.value, label: _.value, field: _.value, align: 'left', sortable: true})),
          entries
        })
      })
    }

    onSaveFieldType (): void {
      this.$store.commit(types.File.SET_BUFFER_SHEET_HEADERS, this.bufferSheetHeaders)
    }

    removeTarget (columnName: string, index: number) {
      const filtered = this.bufferSheetHeaders.filter(_ => _.value === columnName)
      if (filtered.length) {
        filtered[0].target!.splice(Number(index), 1)
        if (!filtered[0].target?.length) Vue.delete(filtered[0], 'target')
        this.bufferSheetHeaders = this.bufferSheetHeaders.slice()
      }
    }

    editConceptMap (element: BufferElement) {
      this.$q.dialog({
        component: ConceptMapCard,
        parent: this,
        element
      }).onOk(() => {
        this.bufferSheetHeaders = this.bufferSheetHeaders.slice()
      })
    }

  }
</script>

<style lang="stylus">
  .data-source-table
    max-height 46vh
  .table-card-section
    margin-top -10px
</style>
