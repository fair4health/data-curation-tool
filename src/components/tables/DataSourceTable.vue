<template>
  <div class="splitter-slot" v-bind:class="{disabledArea: match}">
    <q-card flat class="bg-white">
      <q-card-section class="splitter-slot">
        <q-table flat class="sticky-header-table q-mb-lg" title="Data Source" :data="sheetHeaders" binary-state-sort
                 :columns="dataSourceColumns" row-key="value" selection="multiple" :selected.sync="selectedAttr"
                 :loading="loadingAttr" :grid="$q.screen.lt.sm" :rows-per-page-options="[0]" :pagination.sync="pagination"
                 no-data-label="Please select a sheet" color="primary" table-style="max-height: 46vh"
        >
          <template v-slot:top="props">
            <q-card flat class="full-width">
              <div class="row items-center">
                <q-item-label class="text-h5 text-grey-10">Data Source</q-item-label>
                <q-space />
                <q-btn flat dense round color="primary" icon="get_app" @click="exportState">
                  <q-tooltip>Export</q-tooltip>
                </q-btn>
                <q-btn flat dense round color="primary" icon="save" @click="saveState">
                  <q-tooltip>Save</q-tooltip>
                </q-btn>
                <q-btn flat dense round color="primary" icon="autorenew" @click="fetchSheets">
                  <q-tooltip>Reload File</q-tooltip>
                </q-btn>
              </div>
            </q-card>
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
              <div style="cursor: pointer" v-for="(target, index) in props.row.target" :key="index">
                <q-badge :color="'orange-'+(index%3*2+6)" :label="target.value" />
              </div>
            </q-td>
          </template>
          <template v-slot:no-data="{ icon, message, filter }">
            {{message}}
          </template>
        </q-table>
        <div class="row absolute-bottom q-ma-xs">
          <q-btn flat label="Prev. Step" color="primary" icon="fas fa-angle-left" @click="previousStep" no-caps />
          <q-space />
          <q-btn unelevated label="Continue" color="blue-1" text-color="primary" icon-right="fas fa-angle-right"
                 @click="match=true" v-if="selectedAttr.length" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { SourceDataElement, FileSource, Sheet } from '@/common/file-source'
  import { sourceDataTableHeaders, cellType } from '@/common/data-table'

  @Component
  export default class DataSourceTable extends Vue {
    private loadingAttr: boolean = false
    private sheetHeaders: SourceDataElement[] = []
    private pagination = { page: 1, rowsPerPage: 0 }

    get dataSourceColumns (): object[] { return sourceDataTableHeaders }
    get fieldTypes (): string[] { return Object.values(cellType) }

    get match (): boolean { return this.$store.getters.match }
    set match (value) { this.$store.commit('setMatch', value) }

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

    created () {
      this.match = false
      if (!this.currentSource) this.currentSource = this.fileSourceList[0]
      if (this.currentSheet) this.onSheetChanged()
    }

    @Watch('currentSource')
    onSourceChanged (): void {
      if (!this.currentSource.sheets || !this.currentSource.sheets.length) {
        this.fetchSheets()
      }
    }
    @Watch('currentSheet')
    onSheetChanged (): void {
      ([this.sheetHeaders, this.selectedAttr] = [[], []])
      if (this.currentSheet) {
        // If headers have been already fetched, load from cache; else fetch headers from file
        if (this.currentSheet.headers && this.currentSheet.headers.length)
          this.sheetHeaders = this.currentSheet.headers
        else
          this.fetchHeaders()
      }
    }

    fetchSheets (): void {
      this.$q.loading.show({
        message: `Loading sheets in ${this.currentSource.label}...`
      })
      this.$q.loadingBar.start()
      this.sheetHeaders = []
      ipcRenderer.send('read-file', this.currentSource.value)
      ipcRenderer.on('worksheets-ready', (event, worksheets) => {
        this.sheets = worksheets || []
        // this.currentSheet = null
        this.$q.loading.hide()
        this.$q.loadingBar.stop()
        ipcRenderer.removeAllListeners('worksheets-ready')
      })
    }
    fetchHeaders (): void {
      this.loadingAttr = true
      ipcRenderer.send('get-sheet-headers', {path: this.currentSource?.value, sheet: this.currentSheet?.value})
      ipcRenderer.on('ready-sheet-headers', (event, headers) => {
        this.sheetHeaders = headers
        this.$store.commit('file/setSheetHeaders', headers)
        this.loadingAttr = false
        ipcRenderer.removeAllListeners('ready-sheet-headers')
      })
    }
    onSaveFieldType (): void {
      this.$store.commit('file/setSheetHeaders', this.sheetHeaders)
    }
    previousStep (): void {
      this.$q.dialog({
        title: 'Previous Step',
        message: 'If you go back and make any change, the changes you have made in this section will be lost.',
        class: 'text-weight-bold text-grey-9',
        cancel: true
      }).onOk(() => {
        this.$store.commit('decrementStep')
      })
    }
    saveState () {
      localStorage.setItem('f4h-store-fileSourceList', JSON.stringify(this.$store.state.file))
      this.$q.notify({
        message: 'Saved',
        icon: 'check',
        color: 'green-6'
      })
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

  }
</script>
