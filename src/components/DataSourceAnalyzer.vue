<template>
  <div>
    <q-card flat>
      <q-card-section>
        <q-expansion-item default-opened group="dataSource" class="text-grey-8 text-weight-regular">
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon color="blue" name="fas fa-file-medical" />
            </q-item-section>
            <q-item-section>
              <span><strong>File</strong> (Excel or CSV)</span>
            </q-item-section>
          </template>
          <q-separator spaced class="bg-grey-5" />
          <div>
            <q-item>
              <q-item-section>
                <q-input dense outlined label="File location" v-model="files" hint=".xls, .xlsx or .csv" disable />
              </q-item-section>
              <q-item-section side top>
                <q-btn flat label="Browse" color="primary" @click="browseFile" no-caps />
              </q-item-section>
            </q-item>
            <q-card v-if="fileSourceList.length" flat class="bg-grey-3">
              <q-card-section>
                <q-item>
                  <q-item-section class="text-weight-bold">
                    There {{fileSourceList.length === 1 ? 'is 1 file' : `are ${fileSourceList.length} files`}} selected
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
          </div>
        </q-expansion-item>
      </q-card-section>
    </q-card>
    <q-card flat class="q-my-md">
      <q-card-section>
        <q-expansion-item group="dataSource" class="text-grey-8 text-weight-regular">
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon color="blue" name="fas fa-database" />
            </q-item-section>
            <q-item-section>
              <span><strong>Database</strong></span>
            </q-item-section>
          </template>
          <q-separator spaced class="bg-grey-5" />
          <div class="text-grey-6 text-weight-bold q-ma-md">
            Under development..
          </div>
        </q-expansion-item>
      </q-card-section>
    </q-card>
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
