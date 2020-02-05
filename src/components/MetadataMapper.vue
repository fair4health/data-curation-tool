<template>
  <div>
    <q-toolbar class="bg-grey-4">
      <q-toolbar-title class="text-grey-8">
        Curation - <span class="text-subtitle1">Metadata Mapper</span>
      </q-toolbar-title>
      <q-space />
      <div class="q-gutter-sm q-mx-sm">
        <q-btn unelevated label="Export" color="grey" icon="publish" @click="exportState" no-caps />
        <q-btn unelevated label="Save" color="green" icon="save" @click="saveState" no-caps />
      </div>
    </q-toolbar>
    <div class="q-ma-sm">
      <q-card flat class="bg-white">
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
            <q-btn unelevated label="Add Record" color="green" icon="check" @click="group" no-caps />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="row q-ma-md">
      <q-btn unelevated label="Back" color="primary" icon="chevron_left" @click="previousStep" no-caps />
      <q-space />
      <q-btn v-if="fileSourceList.length" unelevated label="Next" icon-right="chevron_right"
             color="primary" @click="$store.commit('incrementStep')" no-caps />
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { FileSource, Sheet } from '@/common/model/file-source'
  import { ipcRenderer } from 'electron'
  import { QTree } from 'quasar'
  import Loading from '@/components/Loading.vue'
  import { v4 as uuid } from 'uuid'

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

    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }
    set fileSourceList (value) { this.$store.commit('file/updateSourceList', value) }

    get currentSource (): FileSource { return this.$store.getters['file/currentFile'] }
    set currentSource (value) { this.$store.commit('file/setCurrentFile', value) }

    get sheets (): Sheet[] { return this.$store.getters['file/sheets'] }
    set sheets (value) { this.$store.commit('file/setSheets', value) }

    get currentSheet (): Sheet | null { return this.$store.getters['file/currentSheet'] }
    set currentSheet (value) { this.$store.commit('file/setCurrentSheet', value) }

    get fhirProfileList (): string[] { return this.$store.getters['fhir/profileList'].map(r => r.id) }

    get currentFHIRRes (): string { return this.$store.getters['fhir/currentResource'] }
    set currentFHIRRes (value) { this.$store.commit('fhir/setCurrentResource', value) }

    get currentFHIRProf (): string { return this.$store.getters['fhir/currentProfile'] }
    set currentFHIRProf (value) { this.$store.commit('fhir/setCurrentProfile', value) }

    get selectedAttr (): any { return this.$store.getters['file/selectedElements'] }
    set selectedAttr (value) { this.$store.commit('file/setSelectedElements', value) }

    get tickedFHIRAttr (): any { return this.$store.getters['fhir/selectedElements'] }
    set tickedFHIRAttr (value) { this.$store.commit('fhir/setSelectedElements', value) }

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
        for (const column of this.currentSheet?.headers || []) {
          if (column?.value === attr.value) {
            if (!column['target']) column['target'] = this.tickedFHIRAttr
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

    group () {
      const isGroupedBefore = this.selectedAttr.filter(_ => Object.keys(Object.assign({}, _.group)).length)
      if (isGroupedBefore.length) {
        const groupId = Object.keys(isGroupedBefore[0].group)[0]
        this.selectedAttr.map(attr => {
          if (!attr.group) attr.group = {}
          attr.group[groupId] = true
        })
        this.selectedAttr = []
      } else {
        const groupId = uuid().slice(0, 8)
        this.selectedAttr.map(attr => {
          attr.group = {}
          attr.group[groupId] = true
        })
        this.selectedAttr = []
      }
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
