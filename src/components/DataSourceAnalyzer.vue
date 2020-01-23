<template>
  <div>
    <q-toolbar class="bg-grey-4">
      <q-toolbar-title class="text-grey-8">
        Curation - <span class="text-subtitle1">Data Source Analyzer</span>
      </q-toolbar-title>
      <q-space />
      <q-btn v-if="fileSourceList.length"
             unelevated
             label="Mapping"
             color="primary"
             @click="$store.commit('incrementStep')"
             no-caps
      />
    </q-toolbar>
    <div class="q-ma-sm">
      <q-expansion-item
        default-opened
        group="dataSource"
        class="shadow-1 overflow-hidden q-my-md"
        style="border-radius: 30px"
        icon="fas fa-file-medical"
        label="File (Excel or CSV)"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
      >
        <q-card>
          <q-card-section>
            <div v-if="hasSavedMap" class="row q-mb-sm q-gutter-sm">
              <q-btn icon="fas fa-save" flat round size="13px" color="primary" no-caps>
                <q-tooltip>Load from storage</q-tooltip>
                <q-badge color="red-5" floating>1</q-badge>
                <q-menu>
                  <q-list style="min-width: 200px">
                    <q-item clickable class="text-grey-9" @click="loadFromStorage" v-close-popup>
                      <q-item-section avatar><q-icon name="fas fa-file-download" /></q-item-section>
                      <q-item-section>Load</q-item-section>
                    </q-item>
                    <q-item clickable class="text-red-5" @click="clearStorage" v-close-popup>
                      <q-item-section avatar><q-icon name="delete" /></q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
            <q-card id="drag-file" flat bordered v-bind:class="{'flex flex-center': !fileSourceList.length, 'bg-grey-2': isHovering}"
                    style="min-height: 30vh; border-style: dashed">
              <q-card-section>
                <template v-if="!fileSourceList.length">
                  <div class="text-center">
                    <q-icon name="save_alt" color="blue-2" size="72px" />
                    <p class="text-grey-9">Drag your files here</p>
                    <q-btn unelevated label="Browse" color="blue-1" text-color="primary" @click="browseFile" no-caps />
                    <div class="q-my-xs text-weight-bold text-grey-9">OR</div>
                    <q-btn unelevated label="Import saved mapping (json)" color="blue-1" text-color="primary"
                           @click="importSavedMapping" icon="fas fa-file-import" no-caps />
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
                        <q-item-label caption>{{ file.value }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn flat round icon="delete" @click="fileSourceList.splice(Number(index),1)" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div class="row justify-end">
                    <q-item-section side>
                      <q-btn unelevated label="Cancel" color="grey-3" text-color="grey-8" @click="fileSourceList=[]" no-caps />
                    </q-item-section>
<!--                    <q-item-section side>-->
<!--                      <q-btn unelevated label="Next" @click="$store.commit('incrementStep')" icon-right="fas fa-angle-right" color="green-7" no-caps />-->
<!--                    </q-item-section>-->
                  </div>
                </template>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item
        group="dataSource"
        class="shadow-1 overflow-hidden q-my-md"
        style="border-radius: 30px"
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
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { FileSource } from '@/common/model/file-source'

  @Component
  export default class DataSourceAnalyzer extends Vue {
    private isHovering: boolean = false
    private hasSavedMap: boolean = false

    get step (): number { return this.$store.getters.curationStep }

    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }
    set fileSourceList (value) { this.$store.commit('file/updateSourceList', value) }

    get files (): string[] { return this.fileSourceList.map(f => f.value) }

    mounted () {
      this.hasSavedMap = !!localStorage.getItem('f4h-store-fileSourceList')
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

    loadFromStorage () {
      const fileStore = localStorage.getItem('f4h-store-fileSourceList')
      if (fileStore) {
        this.$q.loading.show()
        this.$store.dispatch('file/initializeStore', JSON.parse(fileStore))
          .then(() => this.$q.loading.hide())
          .catch(() => this.$q.loading.hide())
      }
    }

    clearStorage () {
      localStorage.removeItem('f4h-store-fileSourceList')
      this.hasSavedMap = false
    }

    importSavedMapping (): void {
      ipcRenderer.send('browse-mapping')
      ipcRenderer.on('selected-mapping', (event, data) => {
        if (data) {
          this.$store.dispatch('file/initializeStore', data)
            .then(() => {
              this.$log.info('Import Mapping', `Found ${this.fileSourceList.length} mapped file(s)`)
            })
            .catch(() => {
              this.$q.notify({message: 'Data could\'t be imported', color: 'red-6'})
              this.$log.error('Import Mapping', 'Data could\'t be imported')
            })
        } else {
          this.$q.notify({message: 'Data could\'t be imported', color: 'red-6'})
          this.$log.error('Import Mapping', 'Data could\'t be imported')
        }
        ipcRenderer.removeAllListeners('selected-mapping')
      })
    }

    browseFile (): void {
      ipcRenderer.send('browse-file')
      ipcRenderer.on('selected-directory', (event, data) => {
        data.map(file => {
          this.$store.commit('file/addFile', file)
        })
        this.$log.info('Import Data Source',
          `${this.fileSourceList.length ? this.fileSourceList.length : 'No'} source(s) imported`)
        ipcRenderer.removeAllListeners('selected-directory')
      })
    }

  }
</script>
