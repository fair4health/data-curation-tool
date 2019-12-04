<template>
  <div>
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
          <q-item>
            <q-item-section>
              <q-input dense outlined label="File location" v-model="files" hint=".xls, .xlsx or .csv" disable />
            </q-item-section>
            <q-item-section side top>
              <q-btn unelevated label="Browse" color="blue-1" text-color="primary" @click="browseFile" no-caps />
            </q-item-section>
          </q-item>
          <q-card v-if="fileSourceList.length" flat class="bg-grey-3">
            <q-card-section>
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
                  <q-btn flat label="Cancel" @click="fileSourceList=[]" no-caps />
                </q-item-section>
                <q-item-section side>
                  <q-btn unelevated label="Next" @click="$store.commit('incrementStep')" icon-right="fas fa-angle-right" color="green-7" no-caps />
                </q-item-section>
              </div>
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
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { FileSource } from '@/common/file-source'

  @Component
  export default class DataSourceAnalyzer extends Vue {

    get step (): number { return this.$store.getters.curationStep }

    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }
    set fileSourceList (value) { this.$store.commit('file/updateSourceList', value) }

    get files (): string[] { return this.fileSourceList.map(f => f.value) }

    browseFile (): void {
      ipcRenderer.send('browse-file')
      ipcRenderer.on('selected-directory', (event, data) => {
        data.map(file => {
          this.$store.commit('file/addFile', file)
        })
        ipcRenderer.removeAllListeners('selected-directory')
      })
    }

  }
</script>
