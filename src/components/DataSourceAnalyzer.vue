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
            <q-list separator class="full-width">
              <q-item v-for="(mapping, index) in savedMappings" :key="index" class="text-grey-9">
                <q-item-section avatar>
                  <q-icon name="save" color="primary" />
                </q-item-section>
                <q-item-section>
                  <div class="text-caption text-weight-bold">
                    {{getISODateString(mapping.date)}}
                  </div>
                  <div class="text-body2">
                    {{mapping.name}}
                  </div>
                </q-item-section>
                <q-item-section side>
                  <q-btn icon="more_vert" flat round color="grey" no-caps>
                    <q-menu>
                      <q-list separator class="menu-list">
                        <q-item clickable class="text-grey-9" @click="loadFromStorage(mapping)" v-close-popup>
                          <q-item-section avatar><q-icon name="fas fa-file-download" /></q-item-section>
                          <q-item-section>Load</q-item-section>
                        </q-item>
                        <q-item clickable class="text-red-5" @click="deleteSavedMapping(index)" v-close-popup>
                          <q-item-section avatar><q-icon name="delete" /></q-item-section>
                          <q-item-section>Delete</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div v-else class="text-grey-7">
            No content
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <div class="row q-pa-sm">
      <q-btn unelevated label="Back" color="primary" icon="chevron_left" @click="$store.commit('decrementStep')" no-caps />
      <q-space />
      <q-btn unelevated label="Next" icon-right="chevron_right" color="primary" :disable="!fileSourceList.length"
             @click="$store.commit('incrementStep')" no-caps />
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { FileSource } from '@/common/model/file-source'

  @Component
  export default class DataSourceAnalyzer extends Vue {
    private isHovering: boolean = false
    private mappingStore: store.MappingObject[] = []

    get step (): number { return this.$store.getters.curationStep }

    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }
    set fileSourceList (value) { this.$store.commit('file/updateSourceList', value) }

    get files (): string[] { return this.fileSourceList.map(f => f.path) }
    get savedMappings (): store.MappingObject[] {
      const savedMappings = localStorage.getItem('store-fileSourceList')
      this.mappingStore = savedMappings ? JSON.parse(savedMappings) : []
      return this.mappingStore
    }

    mounted () {
      // Drag and drop handlers
      const holder = document.getElementById('drag-file');
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
                this.$store.commit('file/addFile', file.path)
            })
          }
          return false
        }
      }
    }

    loadFromStorage (mapping: store.MappingObject) {
      if (mapping) {
        this.$q.loading.show()
        this.$store.dispatch('file/initializeStore', mapping.data)
          .then(() => this.$q.loading.hide())
          .catch(() => this.$q.loading.hide())
      } else {
        this.$notify.error('Empty mapping sheet')
      }
    }

    deleteSavedMapping (index: number) {
      this.$q.dialog({
        title: '<span class="text-primary"><i class="fas fa-info-circle q-pr-sm"></i>Delete</span>',
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
      ipcRenderer.send('to-background', 'browse-mapping')
      ipcRenderer.on('selected-mapping', (event, data) => {
        if (data) {
          this.$store.dispatch('file/initializeStore', data)
            .then(() => {
              // this.$log.info('Import Mapping', `Found ${this.fileSourceList.length} mapped file(s)`)
            })
            .catch(() => {
              this.$notify.error('Data could\'t be imported')
              // this.$log.error('Import Mapping', 'Data could\'t be imported')
            })
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners('selected-mapping')
      })
    }

    getISODateString (date: string): string {
      return (new Date(date)).toUTCString()
    }

    browseFile (): void {
      this.$q.loading.show({spinner: undefined})
      ipcRenderer.send('to-background', 'browse-file')
      ipcRenderer.on('selected-files', (event, data) => {
        if (data) {
          data.map(file => {
            this.$store.commit('file/addFile', file)
          })
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners('selected-files')
      })
    }

  }
</script>

<style lang="stylus" scoped>
  .drag-drop-card
    min-height 30vh
    border-style dashed
</style>
