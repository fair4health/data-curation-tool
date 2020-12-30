<template>
  <div>
    <q-toolbar class="bg-grey-4 top-fix-column">
      <q-btn flat :label="$t('BUTTONS.BACK')" color="primary" icon="chevron_left" @click="previousStep" no-caps />
      <q-toolbar-title class="text-grey-8" align="center">
        <q-icon name="fas fa-database" color="primary" class="q-px-md" />
        {{ $t('TITLES.DATA_SOURCE_ANALYZER') }}
      </q-toolbar-title>
      <q-btn unelevated :label="$t('BUTTONS.NEXT')" icon-right="chevron_right" color="primary" :disable="!fileSourceList.length"
             @click="nextStep" no-caps />
    </q-toolbar>
    <div class="q-ma-sm row q-gutter-sm">
      <q-expansion-item
        default-opened
        class="overflow-hidden q-my-md col-xs-12 col-sm-12 col-md-6"
        icon="fas fa-file-medical"
        :label="$t('LABELS.FILE')"
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
                    <p class="text-grey-9">{{ $t('LABELS.DRAG_YOUR_FILES_HERE') }}</p>
                    <q-btn unelevated :label="$t('BUTTONS.BROWSE')" color="grey-2" text-color="primary" @click="browseFile" no-caps />
                  </div>
                </template>
                <template v-else>
                  <q-item>
                    <q-item-section class="text-weight-bold">
                      {{ $tc('LABELS.X_FILES_SELECTED', fileSourceList.length) }}
                    </q-item-section>
                    <q-item-section side>
                      <q-btn outline :label="$t('BUTTONS.ADD')" icon="add" color="primary" @click="browseFile" no-caps />
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
                      <q-btn unelevated :label="$t('BUTTONS.REMOVE')" color="grey-3" text-color="grey-8" @click="fileSourceList=[]" no-caps />
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
        :label="$t('LABELS.DATABASE')"
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
          {{ $t('LABELS.SAVED_MAPPINGS') }}
        </q-item-section>

        <q-item-section side>
          <q-btn unelevated :label="$t('BUTTONS.IMPORT')" color="white" text-color="primary"
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
                      {{ $t(col.label) }}
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
                              <q-item-section>{{ $t('BUTTONS.LOAD') }}</q-item-section>
                            </q-item>
                            <q-item clickable dense class="text-grey-9" @click="exportSavedMapping(props.row.name)" v-close-popup>
                              <q-item-section avatar><q-icon name="publish" size="xs" /></q-item-section>
                              <q-item-section>{{ $t('BUTTONS.EXPORT') }}</q-item-section>
                            </q-item>
                            <q-item clickable dense class="text-red-5" @click="deleteSavedMapping(props.row.index)" v-close-popup>
                              <q-item-section avatar><q-icon name="delete" size="xs" /></q-item-section>
                              <q-item-section>{{ $t('BUTTONS.DELETE') }}</q-item-section>
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
        this.$notify.error(String(this.$t('ERROR.EMPTY_MAPPING_SHEET')))
      }
    }

    deleteSavedMapping (index: number) {
      this.$q.dialog({
        title: `<span class="text-negative"><i class="fas fa-trash q-pr-sm"></i>${this.$t('TITLES.DELETE')}</span>`,
        message: `${this.$t('WARNING.ARE_YOU_SURE_TO_DELETE_MAPPING', {mapping: this.mappingStore[index].name})}`,
        class: 'text-grey-9',
        cancel: this.$t('BUTTONS.CANCEL'),
        html: true,
        ok: this.$t('BUTTONS.DELETE')
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
            .catch(() => {
              this.$notify.error(String(this.$t('ERROR.DATA_COULDNT_BE_IMPORTED')))
            })
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners(ipcChannels.File.SELECTED_MAPPING)
      })
    }

    exportSavedMapping (name: string): void {
      const listOfSavedMappings: any[] = JSON.parse(localStorage.getItem('store-fileSourceList') || '[]')
      if (listOfSavedMappings.length) {
        const mapping = listOfSavedMappings.find(_ => _.name === name)
        if (mapping) {
          this.$q.loading.show({spinner: undefined})
          ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.EXPORT_FILE, JSON.stringify({fileSourceList: mapping.data.fileSourceList}))
          ipcRenderer.on(ipcChannels.File.EXPORT_DONE, (event, result) => {
            if (result) {
              this.$notify.success(String(this.$t('SUCCESS.FILE_IS_EXPORTED')))
            }
            this.$q.loading.hide()
            ipcRenderer.removeAllListeners(ipcChannels.File.EXPORT_DONE)
          })
        } else {
          this.$notify.error(String(this.$t('ERROR.MAPPING_COULDNT_BE_EXPORTED')))
        }
      }

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
