<template>
  <div>
    <q-toolbar class="bg-grey-4 top-fix-column">
      <q-btn flat :label="$t('BUTTONS.BACK')" color="primary" icon="chevron_left" @click="previousStep" no-caps />
      <q-toolbar-title class="text-grey-8" align="center">
        <q-icon name="fas fa-database" color="primary" class="q-px-md" />
        {{ $t('TITLES.DATA_SOURCE_ANALYZER') }}
      </q-toolbar-title>
      <q-btn unelevated :label="$t('BUTTONS.NEXT')" icon-right="chevron_right" color="primary"
             :disable="!(fileSourceList.length && (dataSourceType === 'file' || (dataSourceType === 'db' && isSuccess(dbConnectionStatus))))"
             @click="nextStep" no-caps />
    </q-toolbar>
    <div class="q-ma-sm row">
      <q-expansion-item
        default-opened
        class="overflow-hidden q-ma-xs col-xs-12 col-sm-12 col-md-6"
        :label="$t('LABELS.DATA_SOURCE')"
        header-class="bg-primary text-white"
        expand-icon-class="text-white"
        :expand-icon-toggle="true"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="folder" color="primary" text-color="white" />
          </q-item-section>
          <q-item-section>
            {{ $t('LABELS.DATA_SOURCE') }}
          </q-item-section>
        </template>
        <q-card bordered>
          <q-tabs
            v-model="dataSourceType"
            dense
            class="bg-grey-1 text-grey"
            active-color="primary"
            active-bg-color="white"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="file" :disable="isSuccess(dbConnectionStatus)" :label="$t('LABELS.FILE')" icon="fas fa-file-medical" no-caps />
            <q-tab name="db" :disable="dataSourceType === 'file' && fileSourceList.length > 0" :label="$t('LABELS.DATABASE')" icon="fas fa-database" no-caps />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="dataSourceType" animated>
            <q-tab-panel name="file">
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
            </q-tab-panel>
            <q-tab-panel name="db">
              <q-card-section class="row flex-center center">
                <div class="q-gutter-sm col-xs-12 col-sm-12 col-md-10 text-center">
                  <q-select standout="bg-primary text-white" dense label="Database Type" :options="availableDBTypes"
                            v-model="dbConnectionOptions.dbType" :readonly="isSuccess(dbConnectionStatus)" />
                  <q-input outlined dense label="Hostname" v-model.lazy.trim="dbConnectionOptions.host" input-class="text-grey-8" :readonly="isSuccess(dbConnectionStatus)" />
                  <q-input outlined dense label="Port" v-model.lazy.trim="dbConnectionOptions.port" type="number" input-class="text-grey-8" :readonly="isSuccess(dbConnectionStatus)" />
                  <q-input outlined dense label="Database" v-model.lazy.trim="dbConnectionOptions.database" input-class="text-grey-8" :readonly="isSuccess(dbConnectionStatus)" />
                  <q-separator class="q-my-md" inset />
                  <q-select standout="bg-primary text-white" dense label="Authentication" :options="dbAuthTypes"
                            v-model="dbConnectionOptions.dbAuth" :readonly="isSuccess(dbConnectionStatus)" />
                  <q-input v-show="dbConnectionOptions.dbAuth.value !== 'none'" outlined dense label="Username" v-model.lazy.trim="dbConnectionOptions.username" input-class="text-grey-8" :readonly="isSuccess(dbConnectionStatus)" />
                  <q-input v-show="dbConnectionOptions.dbAuth.value !== 'none'" outlined dense label="Password" v-model.lazy.trim="dbConnectionOptions.password" :type="isPwd ? 'password' : 'text'" :readonly="isSuccess(dbConnectionStatus)">
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="row q-gutter-sm col-xs-12 col-sm-12 col-md-10 text-grey-7 q-ma-md">
                  <q-btn v-show="isSuccess(dbConnectionStatus)" unelevated :label="$t('BUTTONS.REMOVE_CONNECTION')" color="negative" @click="closeDbConnection" class="q-px-sm" no-caps />
                  <q-space />
                  <q-btn v-show="isSuccess(dbConnectionStatus)" rounded unelevated :label="$t('BUTTONS.RELOAD_TABLES')" color="grey-2" text-color="grey-7" @click="selectDB" icon="sync" no-caps />
                  <q-btn outline color="positive" @click="establishDbConnection" :disable="isDBConnectable"
                         :loading="isInProgress(dbConnectionStatus)"
                  >
                  <span v-if="isSuccess(dbConnectionStatus) || isError(dbConnectionStatus)" class="q-mr-sm">
                    <q-icon name="check" size="xs" color="green" v-show="isSuccess(dbConnectionStatus)" />
                    <q-icon name="error_outline" size="xs" color="red" v-show="isError(dbConnectionStatus)" />
                  </span>
                    <span>{{ $t('BUTTONS.CONNECT') }}</span>
                  </q-btn>
                </div>
              </q-card-section>
              <q-card-section v-if="dataSourceType === 'db' && fileSourceList.length > 0" class="row flex-center center">
                <q-list separator bordered class="bg-white col-xs-12 col-sm-12 col-md-10">
                  <q-item class="bg-grey-3 text-h5 text-grey-8">
                    {{ $t('LABELS.TABLES') }}
                  </q-item>
                  <q-item v-for="(file, index) in fileSourceList" :key="index" clickable>
                    <q-item-section avatar>
                      <q-avatar icon="fas fa-database" color="primary" text-color="white" size="md" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-size-lg">{{ file.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </q-expansion-item>
      <q-expansion-item
        default-opened
        class="overflow-hidden q-ma-xs col"
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
        <q-card bordered>
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
  </div>
</template>

<script lang="ts">
  import { Component, Mixins } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { DataSourceType, DBConnectionOptions, FileSource } from '@/common/model/data-source'
  import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import { savedMappingTable } from '@/common/model/data-table'
  import { Connection } from 'typeorm'
  import { environment } from '@/common/environment'
  import StatusMixin from '@/common/mixins/statusMixin'
  import Status from '@/common/Status'

  @Component
  export default class DataSourceAnalyzer extends Mixins(StatusMixin) {
    private isHovering: boolean = false
    private mappingStore: store.MappingObject[] = []
    private columns = savedMappingTable.columns
    private pagination = savedMappingTable.pagination
    private connection: Connection
    private isPwd: boolean = true

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
    get availableDBTypes (): string[] { return environment.databaseTypes }
    get dbAuthTypes (): Array<{value: string, label: string}> {
      return [
        {value: 'none', label: 'None'},
        {value: 'username_password', label: 'Username / Password'}
        ]
    }
    get isDBConnectable (): boolean {
      return !(this.dbConnectionOptions.dbType
        && this.dbConnectionOptions.host
        && this.dbConnectionOptions.port
        && this.dbConnectionOptions.database
        && (this.dbConnectionOptions.dbAuth.value === 'none' || (this.dbConnectionOptions.username && this.dbConnectionOptions.password))
      )
    }

    get dataSourceType (): DataSourceType { return this.$store.getters[types.DATA_SOURCE_TYPE] }
    set dataSourceType (value) { this.$store.commit(types.SET_DATA_SOURCE_TYPE, value) }

    get dbConnectionStatus (): Status { return this.$store.getters[types.DB_CONNECTION_STATUS] }
    set dbConnectionStatus (value) { this.$store.commit(types.SET_DB_CONNECTION_STATUS, value) }

    get dbConnectionOptions (): DBConnectionOptions { return this.$store.getters[types.DB_CONNECTION_OPTIONS] }
    set dbConnectionOptions (value) { this.$store.commit(types.SET_DB_CONNECTION_OPTIONS, value) }

    mounted () {
      // Init database connection options from local storage
      if (localStorage.getItem('db-connection-options')) this.dbConnectionOptions = JSON.parse(localStorage.getItem('db-connection-options'))
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
        if (mapping.dbConnectionOptions) {
          this.dataSourceType = DataSourceType.DB
          this.dbConnectionOptions = mapping.dbConnectionOptions
          this.establishDbConnection().then(() => {
            this.$store.dispatch(types.File.INITIALIZE_STORE, this.$_.cloneDeep(mapping.data))
            this.$q.loading.hide()
          })
            .catch(() => {
              this.$notify.error(String(this.$t('ERROR.DATA_COULDNT_BE_IMPORTED')))
              this.$q.loading.hide()
            })
        } else {
          this.dataSourceType = DataSourceType.FILE
          this.$store.dispatch(types.File.INITIALIZE_STORE, this.$_.cloneDeep(mapping.data))
            .then(() => this.$q.loading.hide())
            .catch(() => {
              this.$notify.error(String(this.$t('ERROR.DATA_COULDNT_BE_IMPORTED')))
              this.$q.loading.hide()
            })
        }
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
          if (data.dbConnectionOptions) {
            this.dataSourceType = DataSourceType.DB
            this.dbConnectionOptions = data.dbConnectionOptions
            this.establishDbConnection().then(() => {
              this.$store.dispatch(types.File.INITIALIZE_STORE, data)
            })
            .catch(err => {
              this.$notify.error(String(this.$t('ERROR.DATA_COULDNT_BE_IMPORTED')))
            })
          } else {
            this.dataSourceType = DataSourceType.FILE
            this.$store.dispatch(types.File.INITIALIZE_STORE, data)
              .catch(() => {
                this.$notify.error(String(this.$t('ERROR.DATA_COULDNT_BE_IMPORTED')))
              })
          }
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
          const state = {
            fileSourceList: mapping.data.fileSourceList,
            dbConnectionOptions: mapping.dbConnectionOptions
          }
          ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.EXPORT_FILE, JSON.stringify(state))
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

    establishDbConnection (): Promise<any> {
      this.$q.loading.show()
      return new Promise((resolve, reject) => {
        this.dbConnectionStatus = Status.IN_PROGRESS
        const dbConnectionOptions: DBConnectionOptions = {
          dbType: this.dbConnectionOptions.dbType,
          host: this.dbConnectionOptions.host,
          port: this.dbConnectionOptions.port,
          database: this.dbConnectionOptions.database,
          username: this.dbConnectionOptions.dbAuth.value !== 'none' ? this.dbConnectionOptions.username : '',
          password: this.dbConnectionOptions.dbAuth.value !== 'none' ? this.dbConnectionOptions.password : ''
        }
        ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.Database.CREATE_CONNECTION, dbConnectionOptions)
        ipcRenderer.on(ipcChannels.Database.CONNECTION_ESTABLISHED, (event, res: OutcomeDetail) => {
          ipcRenderer.removeAllListeners(ipcChannels.Database.CONNECTION_ESTABLISHED)
          this.$q.loading.hide()
          localStorage.setItem('db-connection-options', JSON.stringify(this.dbConnectionOptions))
          if (this.isSuccess(res.status)) {
            this.$notify.success(res.message)
            this.dbConnectionStatus = Status.SUCCESS
            this.selectDB().then(() => {
              resolve()
            }).catch(() => {
              reject()
            })
          } else {
            this.$notify.error(res.message)
            this.dbConnectionStatus = Status.ERROR
            reject()
          }
        })
      })
    }

    closeDbConnection (): void {
      this.$q.loading.show()
      ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.Database.CLOSE_CONNECTION)
      ipcRenderer.on(ipcChannels.Database.CLOSE_CONNECTION_RES, (event, res: OutcomeDetail) => {
        ipcRenderer.removeAllListeners(ipcChannels.Database.CLOSE_CONNECTION_RES)
        this.$q.loading.hide()
        if (this.isSuccess(res.status)) {
          this.$notify.success(res.message)
          this.dbConnectionStatus = Status.NONE
          this.fileSourceList = []
        } else {
          this.$notify.error(res.message)
        }
      })
    }

    selectDB (): Promise<any> {
      this.$q.loading.show()
      return new Promise((resolve, reject) => {
        ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.Database.SELECT_DB)
        ipcRenderer.on(ipcChannels.File.SELECTED_FILES, (event, data) => {
          this.fileSourceList = []
          if (data) {
            data.map(file => {
              this.$store.commit(types.File.ADD_FILE, file)
            })
            resolve()
          } else {
            this.$notify.error(String(this.$t('ERROR.NO_TABLES_FOUND')))
            reject()
          }
          this.$q.loading.hide()
          ipcRenderer.removeAllListeners(ipcChannels.File.SELECTED_FILES)
        })
      })
    }

    browseFile (): void {
      this.$q.loading.show({spinner: undefined})
      ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.File.BROWSE_FILE)
      ipcRenderer.on(ipcChannels.File.SELECTED_FILES, (event, data) => {
        if (data) {
          data.map(file => {
            this.$store.commit(types.File.ADD_FILE, file)
          })
        } else {
          this.$notify.error(String(this.$t('ERROR.NO_FILES_FOUND')))
        }
        this.$q.loading.hide()
        ipcRenderer.removeAllListeners(ipcChannels.File.SELECTED_FILES)
      })
    }

    nextStep () {
      // Send the data source type to the bg-threads
      ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.SET_DATA_SOURCE_TYPE, this.dataSourceType)
      this.$store.commit(types.INCREMENT_STEP)
    }

    previousStep () {
      this.$store.commit(types.DECREMENT_STEP)
    }

  }
</script>

<style lang="stylus">
  .drag-drop-card
    min-height 40vh
    border-style dashed
</style>
