<template>
  <div>
    <q-card flat class="q-mb-xs">
      <q-card-section>
        <div class="row q-col-gutter-lg">
          <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12 q-col-gutter-y-md">
            <div class="row justify-start q-col-gutter-md">
              <div class="col-xl-6 col-lg-6 col-md-6 col-12">
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
              <div class="col-xl-6 col-lg-6 col-md-6 col-12">
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
            </div>
          </div>
          <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12 q-col-gutter-y-md">
            <div class="row justify-start q-col-gutter-md">
              <div class="col-xl-6 col-lg-6 col-md-6 col-12">
                <q-item-label class="text-weight-bold">
                  <span><q-icon name="fas fa-fire" size="xs" color="primary" class="q-mr-xs" /> FHIR Resource</span>
                </q-item-label>
                <q-separator spaced />
                <q-select outlined dense v-model="currentFHIRRes" :options="fhirResourceList" label="FHIR Resource">
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section avatar>
                        <q-icon name="fas fa-fire" size="xs" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-html="scope.opt" />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-12">
                <q-item-label class="text-weight-bold">
                  <span><q-icon name="far fa-file-alt" size="xs" color="primary" class="q-mr-xs" /> Profiles</span>
                </q-item-label>
                <q-separator spaced />
                <q-select outlined dense v-model="currentFHIRProf" :options="fhirProfileList" label="Profiles" :disable="!fhirProfileList.length">
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section avatar>
                        <q-icon name="fas fa-file-alt" size="xs" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-html="scope.opt" />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-card flat>
      <q-card-section>
        <q-splitter v-model="splitPercentage" :limits="[20, 80]" separator-class="bg-grey-3"
                    separator-style="width: 12px" :horizontal="$q.screen.lt.sm">

          <!--Data Source Part-->
          <template v-slot:before>
            <div class="splitter-slot q-mx-xs" v-bind:class="{disabledArea: match}">
              <q-table flat class="sticky-header-table q-mb-lg" title="Data Source" :data="sheetHeaders" binary-state-sort
                       :columns="dataSourceColumns" row-key="value" selection="multiple" :selected.sync="selectedAttr"
                       :loading="loadingAttr" :grid="$q.screen.lt.sm" :rows-per-page-options="[0]" :pagination.sync="pagination"
                       no-data-label="Please select a sheet" color="primary" table-style="max-height: 420px"
              >
                <template v-slot:top="props">
                  <q-card flat class="full-width">
                    <div class="row">
                      <q-item-section>
                        <q-item-label class="text-h5 text-grey-10">Data Source</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn flat dense color="primary" icon="autorenew" @click="fetchSheets" no-caps>
                          <q-tooltip>Reload File</q-tooltip>
                        </q-btn>
                      </q-item-section>
                    </div>
                  </q-card>
                </template>
                <template v-slot:body-cell-type="props">
                  <q-td :props="props">
                    <div style="cursor: pointer">
                      <q-badge color="green" :label="props.row.type" />
                      <q-popup-edit v-model="props.row.type" buttons>
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
                      <q-badge :color="'orange-'+(index%3*2+6)" :label="(target.profile || target.resource) + '.' + target.value" />
                    </div>
                  </q-td>
                </template>
                <template v-slot:no-data="{ icon, message, filter }">
                  {{message}}
                </template>
              </q-table>
              <div class="row absolute-bottom q-mr-xs">
                <q-btn flat label="Prev. Step" color="primary" icon="fas fa-angle-left" @click="previousStep" no-caps />
                <q-space />
                <q-btn unelevated label="Continue" color="blue-1" text-color="primary" icon-right="fas fa-angle-right"
                       @click="match=true" v-if="selectedAttr.length" no-caps />
              </div>
            </div>
          </template>

          <!--Splitter Separator-->
          <template v-slot:separator>
            <q-icon color="grey-7" size="xs" name="drag_indicator" />
          </template>

          <!--FHIR Resource Part-->
          <template v-slot:after>
            <div class="splitter-slot q-mx-xs" v-bind:class="{disabledArea: !match}">
              <q-table flat class="sticky-header-table q-mb-lg" title="FHIR Resource" :data="fhirElementList"
                       :columns="fhirColumns" row-key="value" selection="multiple" :selected.sync="selectedFHIRAttr"
                       binary-state-sort :grid="$q.screen.lt.sm" :rows-per-page-options="[0]" :pagination.sync="pagination"
                       :loading="loadingFhir" no-data-label="Please select a resource" color="primary" table-style="max-height: 420px"
              >
                <template v-slot:top="props">
                  <q-card flat class="full-width">
                    <div class="row">
                      <q-item-section>
                        <q-item-label class="text-h5 text-grey-10">FHIR Resources</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn flat dense color="primary" icon="autorenew" no-caps disable>
                          <q-tooltip>Reload</q-tooltip>
                        </q-btn>
                      </q-item-section>
                    </div>
                  </q-card>
                </template>
                <template v-slot:body-cell-fhir-type="props">
                  <q-td :props="props">
                    <div style="cursor: pointer">
                      <q-badge color="red-6" :label="props.row.type" />
                    </div>
                  </q-td>
                </template>
                <template v-slot:no-data="{ icon, message, filter }">
                  {{message}}
                </template>
              </q-table>
              <div class="row absolute-bottom q-ml-xs">
                <q-btn flat label="Back" color="primary" icon="fas fa-angle-left" @click="match=false" no-caps />
                <q-space />
                <q-btn :disable="!selectedFHIRAttr.length" unelevated label="Match" color="primary" @click="matchFields" no-caps />
              </div>
            </div>
          </template>
        </q-splitter>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { SourceDataElement, FileSource, Sheet } from '@/common/file-source'
  import { sourceDataTableHeaders, fhirDataTableHeaders, cellType } from '@/common/data-table'

  @Component
  export default class MetadataMapper extends Vue {
    private splitPercentage: number = 50
    private loadingAttr: boolean = false
    private loadingFhir: boolean = false
    // TODO: Handle sheetHeaders using store too
    private sheetHeaders: SourceDataElement[] = []
    private pagination = { page: 1, rowsPerPage: 0 }
    private currentFHIRRes: string = ''
    private currentFHIRProf: string = ''

    get match (): boolean { return this.$store.getters.match }
    set match (value) { this.$store.commit('setMatch', value) }

    get dataSourceColumns (): object[] { return sourceDataTableHeaders }
    get fhirColumns (): object[] { return fhirDataTableHeaders }
    get fieldTypes (): string[] { return Object.values(cellType) }
    get fhirResourceList (): string[] { return this.$store.getters['fhir/resourceList'] }
    get fhirProfileList (): string[] { return this.$store.getters['fhir/profileList'].map(r => r.id) }
    set fhirProfileList (value) { this.$store.commit('fhir/setProfileList', value) }

    get fhirElementList (): object[] { return this.$store.getters['fhir/elementList'] }
    set fhirElementList (value) { this.$store.commit('fhir/setElementList') }

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

    get selectedFHIRAttr (): any { return this.$store.getters['fhir/selectedElements'] }
    set selectedFHIRAttr (value) { this.$store.commit('fhir/setSelectedElements', value) }

    created () {
      this.match = false
      if (!this.currentSource) this.currentSource = this.fileSourceList[0]
      if (this.currentSheet) this.onSheetChanged()
      this.$store.dispatch('fhir/getResources')
        .then(res => { if (res) this.fhirElementList = [] })
        .catch(err => { throw err })
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
    @Watch('currentFHIRRes')
    onFHIRResourceChanged (): void {
      ([this.currentFHIRProf, this.fhirProfileList, this.selectedFHIRAttr, this.fhirElementList] = ['', [], [], []])
      this.loadingFhir = true
      this.$store.dispatch('fhir/getProfilesByRes', this.currentFHIRRes)
        .then(result => {
          if (result) {
            this.loadingFhir = false
            this.currentFHIRProf = this.fhirProfileList.length ? this.fhirProfileList[0] : ''
            // Fetch elements of base resources
            if (!this.currentFHIRProf) {
              this.$store.dispatch('fhir/getElements', this.currentFHIRRes)
                .then(() => this.loadingFhir = false )
                .catch(err => {
                  this.loadingFhir = false
                  throw err
                })
            }
          }
        })
        .catch(err => {
          this.loadingFhir = false
          throw err
        })
    }
    @Watch('currentFHIRProf')
    onFHIRProfileChanged (): void {
      this.selectedFHIRAttr = []
      this.loadingFhir = true
      this.$store.dispatch('fhir/getElements', this.currentFHIRProf)
        .then(() => {
          this.loadingFhir = false
        })
        .catch(err => {
          this.loadingFhir = false
          throw err
        })
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
        if (this.currentSheet) this.currentSheet.headers = headers
        this.loadingAttr = false
        ipcRenderer.removeAllListeners('ready-sheet-headers')
      })
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
    matchFields (): void {
      this.selectedFHIRAttr = this.selectedFHIRAttr.map(obj => ({...obj, resource: this.currentFHIRRes, profile: this.currentFHIRProf}))
      for (const attr of this.selectedAttr) {
        for (const column of this.sheetHeaders) {
          if (column?.value === attr.value)
            column['target'] = this.selectedFHIRAttr
        }
      }
      ([this.selectedAttr, this.selectedFHIRAttr, this.match] = [[], [], false])
      this.$q.notify({ message: 'Target value entered successfully', icon: 'check', color: 'green-6'})
    }

  }
</script>

<style lang="stylus">
  .disabledArea
    pointer-events none
    opacity 0.4

  .splitter-slot
    min-height 550px

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
