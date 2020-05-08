<template>
  <div>
    <q-toolbar class="bg-grey-4 top-fix-column">
      <q-toolbar-title class="text-grey-8">
        Curation - <span class="text-subtitle1">Data Source Analyzer</span>
      </q-toolbar-title>
    </q-toolbar>
    <div class="q-ma-sm row q-gutter-sm">
      <q-expansion-item
        default-opened
        class="overflow-hidden q-my-md col-xs-12 col-sm-12 col-md-6"
        icon="fas fa-file-medical"
        label="File (Excel or CSV)"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
      >
        <q-card>
          <q-card-section>
            <q-card id="drag-file" flat bordered v-bind:class="{'flex flex-center': !fileSourceList.length, 'bg-grey-2': isHovering}"
                    class="drag-drop-card">
              <q-card-section>
                <template v-if="!fileSourceList.length">
                  <div class="text-center">
                    <q-icon name="save_alt" color="primary" size="72px" />
                    <p class="text-grey-9">Drag your files here</p>
                    <q-btn unelevated label="Browse" color="grey-2" text-color="primary" @click="browseFile" no-caps />
                  </div>
                </template>
                <template v-else>
                  <q-item>
                    <q-item-section class="text-weight-bold">
                      {{fileSourceList.length === 1 ? '1 file' : `${fileSourceList.length} files`}} selected
                    </q-item-section>
                    <q-item-section side>
                      <q-btn outline label="Add" icon="add" color="primary" @click="browseFile" no-caps />
                    </q-item-section>
                  </q-item>
                  <q-separator inset />
                  <q-list bordered separator class="q-ma-md bg-white">
                    <q-item v-for="(file, index) in fileSourceList" :key="index">
                      <q-item-section avatar>
                        <q-avatar icon="folder_open" color="primary" text-color="white" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ file.label }}</q-item-label>
                        <q-item-label caption>{{ file.path }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn flat round icon="delete" @click="fileSourceList.splice(Number(index),1)" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div class="row justify-end">
                    <q-item-section side>
                      <q-btn unelevated label="Remove" color="grey-3" text-color="grey-8" @click="fileSourceList=[]" no-caps />
                    </q-item-section>
                  </div>
                </template>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item
        class="overflow-hidden q-my-md col"
        icon="fas fa-database"
        label="Database"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
      >
        <q-card>
          <q-card-section>
            <div class="text-grey-7 text-weight-bold q-ma-md">
              Under development..
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
    <q-expansion-item
      default-opened
      class="overflow-hidden q-ma-sm col-12"
      icon="save"
      label="Saved Mappings"
      header-class="bg-primary text-white"
      expand-icon-class="text-white"
      :expand-icon-toggle="true"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="save" color="primary" text-color="white" />
        </q-item-section>

        <q-item-section>
          Saved Mappings
        </q-item-section>

        <q-item-section side>
          <q-btn unelevated label="Import" color="white" text-color="primary"
                 @click="importSavedMapping" icon="fas fa-file-import" no-caps />
        </q-item-section>
      </template>
      <q-card flat>
        <q-card-section class="bg-white text-white text-subtitle1">
          <div v-if="savedMappings.length" class="row q-mb-sm q-gutter-sm">
            <q-table flat bordered binary-state-sort class="full-width" :data="savedMappings" :columns="columns"
                     row-key="index" :pagination.sync="pagination" :rows-per-page-options="[5]"
            >
              <template v-slot:header="props">
                <tr :props="props">
                  <q-th class="bg-grey-2 q-table--col-auto-width" />
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="bg-grey-2"
                  >
                    <span class="vertical-middle text-grey-9">
                      <q-icon v-if="col.icon" :name="col.icon" size="xs" />
                      {{ col.label }}
                    </span>
                  </q-th>
                </tr>
              </template>
              <template v-slot:body="props">
                <tr :props="props">
                  <q-td class="q-table--col-auto-width">
                    <q-icon name="save" color="primary" size="sm" />
                  </q-td>
                  <q-td key="date" :props="props">
                    <div class="text-caption">
                      {{ getISODateString(props.row.date) }}
                    </div>
                    <div class="text-body2 text-grey-10 text-weight-bold">
                      {{ props.row.name }}
                    </div>
                  </q-td>
                  <q-td key="action" :props="props">
                    <div class="row">
                      <q-space />
                      <q-btn icon="more_vert" dense flat round color="grey" no-caps>
                        <q-menu>
                          <q-list padding class="menu-list">
                            <q-item clickable dense class="text-grey-9" @click="loadFromStorage(props.row)" v-close-popup>
                              <q-item-section avatar><q-icon name="fas fa-file-download" size="xs" /></q-item-section>
                              <q-item-section>Load</q-item-section>
                            </q-item>
                            <q-item clickable dense class="text-red-5" @click="deleteSavedMapping(props.row.index)" v-close-popup>
                              <q-item-section avatar><q-icon name="delete" size="xs" /></q-item-section>
                              <q-item-section>Delete</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                  </q-td>
                </tr>
              </template>
            </q-table>
          </div>
          <div v-else class="text-grey-7">
            No content
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <div class="row q-pa-sm">
      <q-btn unelevated label="Back" color="primary" icon="chevron_left" @click="previousStep" no-caps />
      <q-space />
      <q-btn unelevated label="Next" icon-right="chevron_right" color="primary" :disable="!fileSourceList.length"
             @click="nextStep" no-caps />
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { FileSource } from '@/common/model/file-source'
  import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import { savedMappingTable } from '@/common/model/data-table'

  @Component
  export default class DataSourceAnalyzer extends Vue {
    private isHovering: boolean = false
    private mappingStore: store.MappingObject[] = []
    private columns = savedMappingTable.columns
    private pagination = savedMappingTable.pagination

    get step (): number { return this.$store.getters[types.CURATION_STEP] }

    get fileSourceList (): FileSource[] { return this.$store.getters[types.File.SOURCE_LIST] }
    set fileSourceList (value) { this.$store.commit(types.File.UPDATE_SOURCE_LIST, value) }

    get files (): string[] { return this.fileSourceList.map(f => f.path) }
    get savedMappings (): store.MappingObject[] {
      const savedMappings = localStorage.getItem('store-fileSourceList')
      this.mappingStore = savedMappings ? JSON.parse(savedMappings) : []
      let index = 0
      return this.mappingStore.map(_ => ({..._, index: index++}))
    }

    mounted () {
      // Drag and drop handlers
      const holder = document.getElementById('drag-file')
      if (holder) {
        holder.ondragenter = () => { this.isHovering = true; return false }

        holder.ondragover = () => false

        holder.ondragleave = () => false

        holder.ondragend = () => false

        holder.ondrop = (e) => {
          this.isHovering = false
          e.preventDefault()
          if (e && e.dataTransfer) {
            [...e.dataTransfer.files].map(file => {
              if (file.path.split('.')?.pop()?.match('(xl|csv).*'))
                this.$store.commit(types.File.ADD_FILE, file.path)
            })
          }
          return false
        }
      }
    }

    loadFromStorage (mapping: store.MappingObject) {
      if (mapping) {
        this.$q.loading.show()
        this.$store.dispatch(types.File.INITIALIZE_STORE, this.$_.cloneDeep(mapping.data))
          .then(() => this.$q.loading.hide())
          .catch(() => this.$q.loading.hide())
      } else {
        this.$notify.error('Empty mapping sheet')
      }
    }

    deleteSavedMapping (index: number) {
      this.$q.dialog({
        title: '<span class="text-negative"><i class="fas fa-trash q-pr-sm"></i>Delete</span>',
        message: `Are you sure to delete mapping <span class="text-weight-bold">${this.mappingStore[index].name}</span>?`,
        class: 'text-grey-9',
        cancel: true,
        html: true,
        ok: 'Delete'
      }).onOk(() => {
        this.mappingStore.splice(index, 1)
        localStorage.setItem('store-fileSourceList', JSON.stringify(this.mappingStore))
      })
    }

    importSavedMapping (): void {
      this.$q.loading.show({spinner: undefined})
      ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.BROWSE_MAPPING)
      ipcRenderer.on(ipcChannels.File.SELECTED_MAPPING, (event, data) => {
        if (data) {
          this.$store.dispatch(types.File.INITIALIZE_STORE, data)
            .then(() => {
              // this.$log.info('Import Mapping', `Found ${this.fileSourceList.length} mapped file(s)`)
            })
            .catch(() => {
              this.$notify.error('Data could\'t be imported')
              // this.$log.error('Import Mapping', 'Data could\'t be imported')
            })
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners(ipcChannels.File.SELECTED_MAPPING)
      })
    }

    getISODateString (date: string): string {
      return (new Date(date)).toUTCString()
    }

    browseFile (): void {
      this.$q.loading.show({spinner: undefined})
      ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.BROWSE_FILE)
      ipcRenderer.on(ipcChannels.File.SELECTED_FILES, (event, data) => {
        if (data) {
          data.map(file => {
            this.$store.commit(types.File.ADD_FILE, file)
          })
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners(ipcChannels.File.SELECTED_FILES)
      })
    }

    nextStep () {
      this.$store.commit(types.INCREMENT_STEP)
    }

    previousStep () {
      this.$store.commit(types.DECREMENT_STEP)
    }

  }
</script>

<style lang="stylus" scoped>
  .drag-drop-card
    min-height 30vh
    border-style dashed
</style>
