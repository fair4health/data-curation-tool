<template>
  <div>
    <q-card flat class="bg-white">
      <q-card-section class="row q-col-gutter-sm">
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-item-label class="text-weight-bold">
            <span><q-icon name="fas fa-file" size="xs" color="primary" class="q-mr-xs" /> Source File</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense v-model="currentSource" class="ellipsis" :options="fileSourceList" option-value="path" label="Source File">
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
          <q-select outlined dense v-model="currentSheet" class="ellipsis" :options="sheets" label="Sheets" :disable="!sheets.length">
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
      <div class="q-px-sm bg-grey-2">
        <q-toggle v-model="showMappedFields" checked-icon="star" size="xs" color="green" label="Show mapped fields only" class="text-grey-8" unchecked-icon="clear" />
      </div>
      <q-card-section>
        <q-table flat class="sticky-header-table q-mb-lg" title="Data Source" :data="filteredBufferSheetHeaders" binary-state-sort
                 :columns="dataSourceColumns" row-key="value" selection="multiple" :selected.sync="selectedAttr"
                 :loading="loadingAttr" :grid="$q.screen.lt.sm" :rows-per-page-options="[10, 20, 0]" :pagination.sync="pagination"
                 color="primary" table-style="max-height: 46vh" :filter="filter" :filter-method="filterTable" style="margin-top: -10px"
        >
          <template v-slot:top="props">
            <q-card flat class="full-width">
              <div class="row items-center q-gutter-xs">
                <q-item-label class="text-h5 text-grey-10">Data Source</q-item-label>
                <q-space />
                <q-btn v-if="currentSheet" unelevated rounded label="Reload File" icon="sync" color="grey-1" text-color="grey-8" @click="fetchHeaders(true)" no-caps />
                <q-input dense rounded standout="bg-grey-3" v-model.lazy.trim="filter" class="cursor-pointer"
                         input-class="text-grey-8" placeholder="Search..." @keydown.esc="filter = ''"
                >
                  <template v-slot:append>
                    <q-icon v-if="!filter" name="search" color="grey-8" />
                    <q-icon v-else name="clear" color="grey-8" class="cursor-pointer" @click="filter=''" />
                  </template>
                </q-input>
              </div>
            </q-card>
          </template>
          <template v-slot:header-cell="props">
            <q-th :props="props" class="text-grey-7">
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
              <div style="cursor: pointer">
                <q-badge color="green" :label="props.row.type" />
                <q-popup-edit v-model="props.row.type" buttons @save="onSaveFieldType">
                  <q-item-label class="text-weight-bold">Type</q-item-label>
                  <q-separator spaced />
                  <q-select filled dense v-model="props.row.type" :options="fieldTypes" style="min-width: 200px" />
                </q-popup-edit>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-target="props">
            <q-td :props="props">
              <div v-for="(target, index) in props.row.target" :key="index">
                <q-chip dense removable @remove="removeTarget(props.row.value, index)" color="orange" text-color="white">
                  <span class="q-mx-xs" style="font-size: 12px">{{ target.value }}</span>
                </q-chip>
                <q-chip v-if="!!target.type" dense color="grey-2" text-color="grey-8" style="font-size: 11px">
                  {{ target.type }}
                </q-chip>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-conceptMap="props">
            <q-td :props="props">
              <q-select v-if="props.row.target"
                        dense
                        clearable
                        :outlined="!!props.row.conceptMap"
                        :standout="!props.row.conceptMap ? 'bg-primary text-white' : ''"
                        :label="!props.row.conceptMap ? 'No mapping' : 'Concept Map'"
                        :ref="props.row.value"
                        v-model="props.row.conceptMap"
                        :options="conceptMapList"
                        option-label="name"
                        option-value="id"
                        menu-self="bottom left"
                        style="font-size: 13px"
                        @clear="removeConceptMap(props.row); $refs[props.row.value].blur()"
                        @input="bufferSheetHeaders = [...bufferSheetHeaders]"
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
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { SourceDataElement, FileSource, Sheet, BufferElement } from '@/common/model/file-source'
  import { sourceDataTableHeaders, cellType } from '@/common/model/data-table'

  @Component
  export default class DataSourceTable extends Vue {
    private loadingAttr: boolean = false
    private sheetHeaders: SourceDataElement[] = []
    private pagination = { page: 1, rowsPerPage: 10 }
    private filter: string = ''
    private showMappedFields: boolean = false

    get dataSourceColumns (): object[] { return sourceDataTableHeaders }
    get fieldTypes (): string[] { return Object.values(cellType) }

    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }
    set fileSourceList (value) { this.$store.commit('file/updateSourceList', value) }

    get currentSource (): FileSource { return this.$store.getters['file/currentFile'] }
    set currentSource (value) { this.$store.commit('file/setCurrentFile', value) }

    get sheets (): Sheet[] { return this.$store.getters['file/sheets'] }
    set sheets (value) { this.$store.commit('file/setSheets', value) }

    get currentSheet (): Sheet | null { return this.$store.getters['file/currentSheet'] }
    set currentSheet (value) { this.$store.commit('file/setCurrentSheet', value) }

    get selectedAttr (): any { return this.$store.getters['file/selectedElements'] }
    set selectedAttr (value) { this.$store.commit('file/setSelectedElements', value) }

    get bufferSheetHeaders (): BufferElement[] { return this.$store.getters['file/bufferSheetHeaders'] }
    set bufferSheetHeaders (value) { this.$store.commit('file/setBufferSheetHeaders', value) }

    get conceptMapList (): Array<Array<{id: string, name: string}>> {
      return this.$store.getters['fhir/conceptMapList'].map((_: fhir.ConceptMap) => ({id: _.id, name: _.name}))
    }
    set conceptMapList (value) { this.$store.commit('fhir/setConceptMapList', value) }

    get filteredBufferSheetHeaders (): BufferElement[] {
      return this.bufferSheetHeaders.filter(_ => !this.showMappedFields || _.target)
    }

    created () {
      this.$q.loading.show({message: 'Fetching Concept Maps...', spinner: undefined})
      setTimeout(() => {
        this.bufferSheetHeaders = []
        if (!this.currentSource) this.currentSource = this.fileSourceList[0]
        if (this.currentSheet) this.onSheetChanged()
        this.$store.dispatch('fhir/getConceptMaps', true)
          .then(() => this.$q.loading.hide())
          .catch(() => {
            this.$q.loading.hide()
            this.$q.notify({
              message: 'Something went wrong while fetching Concept Maps',
              color: 'red'
            })
          })
      }, 10)
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
      ipcRenderer.send('read-file', this.currentSource.path)
      ipcRenderer.on('worksheets-ready', (event, worksheets) => {
        this.sheets = worksheets || []
        // this.currentSheet = null
        this.loadingAttr = false
        this.$q.loadingBar.stop()
        ipcRenderer.removeAllListeners('worksheets-ready')
      })
    }

    fetchHeaders (noCache?: boolean): void {
      this.loadingAttr = true
      ipcRenderer.send('get-sheet-headers', {path: this.currentSource?.path, sheet: this.currentSheet?.value, noCache})
      ipcRenderer.on('ready-sheet-headers', (event, headers) => {
        if (!headers.length) {
          this.$q.notify({message: 'Headers couldn\'t be detected'})
        }
        // this.bufferSheetHeaders = headers.map(_ => ({type: _.type, value: _.value}))
        this.$store.commit('file/setSheetHeaders', headers)
        this.$store.commit('file/setupBufferSheetHeaders')
        this.loadingAttr = false
        ipcRenderer.removeAllListeners('ready-sheet-headers')
      })
    }

    onSaveFieldType (): void {
      this.$store.commit('file/setBufferSheetHeaders', this.bufferSheetHeaders)
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

  }
</script>
