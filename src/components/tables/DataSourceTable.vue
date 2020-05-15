<template>
  <div>
    <q-card flat class="bg-white">
      <q-card-section class="row q-col-gutter-sm">
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-item-label class="text-weight-bold">
            <span><q-icon name="fas fa-file" size="xs" color="primary" class="q-mr-xs" /> Source File</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense options-dense v-model="currentSource" class="ellipsis" :options="fileSourceList" option-value="path" label="Source File">
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
            <span><q-icon name="far fa-file-alt" size="xs" color="primary" class="q-mr-xs" /> Sheets</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense options-dense v-model="currentSheet" class="ellipsis" :options="sheets" label="Sheets" :disable="!sheets.length">
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
        <q-btn unelevated stretch label="Options" color="grey-3" text-color="grey-8" class="text-size-lg" no-caps>
          <q-badge v-if="filterCount" color="primary" class="text-size-xs" floating>
            {{ filterCount }}
          </q-badge>
          <q-menu>
            <q-list padding class="menu-list">
              <q-item clickable dense>
                <q-item-section>
                  <q-toggle v-model="showMappedFields"
                            checked-icon="check"
                            size="xs"
                            color="primary"
                            label="Show mapped fields only"
                            class="text-grey-8 text-size-lg"
                            unchecked-icon="clear"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn v-if="currentSheet"
               flat
               stretch
               label="Reload File"
               icon="sync"
               color="grey-1"
               text-color="grey-8"
               class="text-size-lg"
               @click="fetchHeaders(true)"
               no-caps
        />
        <q-space />
        <q-input borderless dense v-model.lazy.trim="filterText" placeholder="Search" @keydown.esc="filterText = ''">
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
              <span class="vertical-middle q-ml-xs">{{ props.col.label }}</span>
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
              <q-select v-if="props.row.target"
                        dense
                        options-dense
                        use-input
                        hide-selected
                        fill-input
                        clearable
                        input-debounce="0"
                        :outlined="!!props.row.conceptMap"
                        :standout="!props.row.conceptMap ? 'bg-primary text-white' : ''"
                        class="text-size-lg select-input"
                        :label="!props.row.conceptMap ? 'No mapping' : 'Concept Map'"
                        :ref="props.row.value"
                        v-model="props.row.conceptMap"
                        :options="filteredConceptMapList"
                        option-label="name"
                        option-value="id"
                        :disable="!conceptMapList.length"
                        @clear="removeConceptMap(props.row); $refs[props.row.value].blur()"
                        @input="bufferSheetHeaders = [...bufferSheetHeaders]"
                        @filter="filterConceptMaps"
              />

            </q-td>
          </template>
          <template v-slot:no-data="{ icon, message, filter }">
            {{message === 'Loading...' ? message : (currentSheet ? 'No data available' : 'Please select a sheet')}}
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { SourceDataElement, FileSource, Sheet, BufferElement } from '@/common/model/file-source'
  import { sourceDataTable, cellType } from '@/common/model/data-table'
  import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import StatusMixin from '@/common/mixins/statusMixin'

  @Component
  export default class DataSourceTable extends Mixins(StatusMixin) {
    private loadingAttr: boolean = false
    private sheetHeaders: SourceDataElement[] = []
    private dataSourceColumns = sourceDataTable.columns
    private pagination = sourceDataTable.pagination
    private filterText: string = ''
    private showMappedFields: boolean = false
    private filteredConceptMapList: Array<{id: string, name: string}> = []

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

    get conceptMapList (): Array<{id: string, name: string}> {
      return this.$store.getters[types.Terminology.CONCEPT_MAP_LIST].map((_: fhir.ConceptMap) => ({id: _.id, name: _.name}))
    }
    set conceptMapList (value) { this.$store.commit(types.Terminology.SET_CONCEPT_MAP_LIST, value) }

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
      setTimeout(() => {
        this.bufferSheetHeaders = []
        if (!this.currentSource) this.currentSource = this.fileSourceList[0]
        if (this.currentSheet) this.onSheetChanged()
        if (this.isSuccess(this.tBaseVerificationStatus)) {
          this.$q.loading.show({message: 'Fetching Concept Maps...', spinner: undefined})
          this.$store.dispatch(types.Terminology.GET_CONCEPT_MAPS, true)
            .then(() => this.$q.loading.hide())
            .catch(() => {
              this.$q.loading.hide()
              this.$notify.error('Something went wrong while fetching Concept Maps')
            })
          this.$store.dispatch(types.Terminology.GET_CODE_SYSTEMS, true)
            .then(() => this.$q.loading.hide())
            .catch(() => {
              this.$q.loading.hide()
              this.$notify.error('Something went wrong while fetching Code Systems')
            })
        }
      }, 10)
      this.filteredConceptMapList = this.conceptMapList
    }

    @Watch('currentSource')
    onSourceChanged (): void {
      if (!this.currentSource.sheets || !this.currentSource.sheets.length) {
        this.fetchSheets()
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
        // this.currentSheet = null
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
          this.$notify.error('Headers couldn\'t be detected')
        }
        // this.bufferSheetHeaders = headers.map(_ => ({type: _.type, value: _.value}))
        this.$store.commit(types.File.SET_SHEET_HEADERS, headers)
        this.$store.commit(types.File.SETUP_BUFFER_SHEET_HEADERS)
        this.loadingAttr = false
        ipcRenderer.removeAllListeners(ipcChannels.File.READY_TABLE_HEADERS)
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

    removeConceptMap (row: BufferElement) {
      row.conceptMap = undefined
      delete row.conceptMap
      this.bufferSheetHeaders = this.bufferSheetHeaders.slice()
    }

    filterConceptMaps (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.filteredConceptMapList = this.conceptMapList.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
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
