<template>
  <div>
    <q-card flat class="bg-white">
      <q-card-section class="row q-col-gutter-sm">
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-item-label class="text-weight-bold">
            <span><q-icon name="fas fa-file" size="xs" color="primary" class="q-mr-xs" /> Source File</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense v-model="currentSource" :options="fileSourceList" label="Source File">
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
          <q-select outlined dense v-model="currentSheet" :options="sheets" label="Sheets" :disable="!sheets.length">
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
      <q-card-section>
        <q-table flat class="sticky-header-table q-mb-lg" title="Data Source" :data="sheetHeaders" binary-state-sort
                 :columns="dataSourceColumns" row-key="value" selection="multiple" :selected.sync="selectedAttr"
                 :loading="loadingAttr" :grid="$q.screen.lt.sm" :rows-per-page-options="[10, 20, 0]" :pagination.sync="pagination"
                 color="primary" table-style="max-height: 46vh" :filter="filter" :filter-method="filterTable"
        >
          <template v-slot:top="props">
            <q-card flat class="full-width">
              <div class="row items-center q-gutter-xs">
                <q-item-label class="text-h5 text-grey-10">Data Source</q-item-label>
                <q-space />
                <q-input dense rounded standout="bg-grey-3" v-model.lazy.trim="filter" class="cursor-pointer"
                         input-class="text-grey-8" placeholder="Search..." @keydown.esc="filter = ''"
                >
                  <template v-slot:append>
                    <q-icon v-if="!filter" name="search" color="grey-8" />
                    <q-icon v-else name="clear" color="grey-8" class="cursor-pointer" @click="filter=''" />
                  </template>
                </q-input>
                <q-btn flat dense round color="grey-8" icon="autorenew" @click="fetchSheets">
                  <q-tooltip>Reload File</q-tooltip>
                </q-btn>
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
                <q-chip dense removable @remove="removeTarget(props.row.target, index);selectedAttr=selectedAttr" :color="'orange-'+(index%3*2+6)" text-color="white">
                  <span class="q-mx-xs" style="font-size: 12px">{{ target.value }}</span>
                </q-chip>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-group="props">
            <q-td :props="props">
              <div v-for="(value, name) in props.row.group" v-bind:key="name">
                <q-chip dense removable @remove="removeGroup(props.row.group, name);selectedAttr=selectedAttr" color="grey-2" text-color="grey-6">
                  <span class="text-italic q-mx-xs" style="font-size: 12px">{{ name ? '#' + name : '' }}</span>
                </q-chip>
              </div>
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
  import { SourceDataElement, FileSource, Sheet } from '@/common/model/file-source'
  import { sourceDataTableHeaders, cellType } from '@/common/model/data-table'

  @Component
  export default class DataSourceTable extends Vue {
    private loadingAttr: boolean = false
    private sheetHeaders: SourceDataElement[] = []
    private pagination = { page: 1, rowsPerPage: 10 }
    private filter: string = ''

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

    created () {
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
    filterTable (rows, terms) {
      terms = terms.toLowerCase()
      return rows.filter(row => (
        row.value?.toLowerCase().includes(terms) ||
        row.type?.toLowerCase().includes(terms) ||
        Object.keys(Object.assign({}, row.group)).filter(key => key.toLowerCase().includes(terms)).length ||
        row.target?.filter(t => t.value?.toLowerCase().includes(terms)).length
      ))
    }

    fetchSheets (): void {
      this.loadingAttr = true
      this.$q.loadingBar.start()
      this.sheetHeaders = []
      ipcRenderer.send('read-file', this.currentSource.value)
      ipcRenderer.on('worksheets-ready', (event, worksheets) => {
        this.sheets = worksheets || []
        // this.currentSheet = null
        this.loadingAttr = false
        this.$q.loadingBar.stop()
        ipcRenderer.removeAllListeners('worksheets-ready')
      })
    }

    fetchHeaders (): void {
      this.loadingAttr = true
      ipcRenderer.send('get-sheet-headers', {path: this.currentSource?.value, sheet: this.currentSheet?.value})
      ipcRenderer.on('ready-sheet-headers', (event, headers) => {
        if (!headers.length) {
          this.$log.warning('No Sheet Headers', 'Headers couldn\'t be detected')
        }
        this.sheetHeaders = headers
        this.$store.commit('file/setSheetHeaders', headers)
        this.loadingAttr = false
        ipcRenderer.removeAllListeners('ready-sheet-headers')
      })
    }

    onSaveFieldType (): void {
      this.$store.commit('file/setSheetHeaders', this.sheetHeaders)
    }

    removeTarget (list: any[], index) {
      this.$q.loading.show()
      setTimeout(() => {
        list.splice(index, 1)
        this.currentSheet!.headers = this.sheetHeaders
        this.fileSourceList = this.fileSourceList
        this.$q.loading.hide()
      }, 0)
    }

    removeGroup (obj: any, key: string) {
      delete obj[key]
      this.currentSheet!.headers = this.sheetHeaders
      this.fileSourceList = this.fileSourceList
    }

  }
</script>
