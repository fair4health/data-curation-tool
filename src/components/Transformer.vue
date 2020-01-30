<template>
  <div>
    <q-toolbar class="bg-grey-4">
      <q-toolbar-title class="text-grey-8">
        Curation - <span class="text-subtitle1">Confirm and Transform</span>
      </q-toolbar-title>
    </q-toolbar>
    <q-card flat bordered class="q-ma-sm">
      <q-card-section>
        <q-table flat binary-state-sort title="Mappings" :data="mappingList" :columns="columns" row-key="name"
                 :rows-per-page-options="[0]" :pagination.sync="pagination" :filter="filter" class="sticky-header-table"
                 table-style="max-height: 60vh" :loading="loading" color="primary"
        >
          <template v-slot:top-right>
            <q-input borderless dense v-model="filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:header-cell="props">
            <q-th :props="props">
              <q-icon v-if="props.col.icon" :name="props.col.icon" />
              <span class="vertical-middle q-ml-xs">{{ props.col.label }}</span>
            </q-th>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="status" :props="props">
                <template v-if="props.row.transform.status === 'processing'">
                  <span>
                    <q-spinner color="grey-9" />
                    <q-tooltip>Transforming...</q-tooltip>
                  </span>
                </template>
                <template v-else-if="props.row.transform.status === 'done'">
                  <q-icon name="check" color="green">
                    <q-tooltip>Completed</q-tooltip>
                  </q-icon>
                </template>
                <template v-else-if="props.row.transform.status === 'warning'">
                  <q-icon name="warning" color="orange-6">
                    <q-tooltip>{{ props.row.transform.description }}</q-tooltip>
                  </q-icon>
                </template>
                <template v-else-if="props.row.transform.status === 'error'">
                  <q-icon name="error_outline" color="red">
                    <q-tooltip>{{ props.row.transform.description }}</q-tooltip>
                  </q-icon>
                </template>
                <template v-else>
                  <q-icon name="access_time" color="grey-9">
                    <q-tooltip>Waiting</q-tooltip>
                  </q-icon>
                </template>
              </q-td>
              <q-td key="file" :props="props">
                <q-btn dense round flat size="sm" :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'" @click="props.expand = !props.expand" />
                {{ props.row.file }}
              </q-td>
              <q-td key="sheet" :props="props">
                {{ props.row.sheet }}
              </q-td>
              <q-td key="targets" :props="props" class="text-weight-bold">
                {{ props.row.targets }}
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%" class="bg-grey-2">
                <q-card flat bordered>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar>
                        <q-icon name="far fa-file-alt" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ props.row.sheet }}</q-item-label>
                      <q-item-label caption>{{ props.row.file }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label>Total</q-item-label>
                      <q-item-label caption>{{ (props.row.info && props.row.info.total) || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator />

                  <q-card-section class="q-mb-xs q-pt-xs overflow-auto" >
                    <div class="text-grey-8" style="max-height: 15vh">
                      <div v-for="(target, index) in props.row.targetList" :key="index">
                        {{target.value}} -> {{target.target.map(_ => _.value)}} <br/>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <div class="row content-end q-gutter-sm">
          <q-btn flat label="Back" icon="fas fa-angle-left" class="q-mt-lg" @click="previousStep" no-caps />
          <q-space />
          <q-btn class="q-mt-lg" color="primary" label="Remove Resource" no-caps>
            <q-spinner class="q-ml-sm" size="xs" v-show="loading" />
            <q-menu transition-show="jump-down" transition-hide="jump-up" auto-close>
              <q-list style="min-width: 100px">
                <q-item clickable v-for="(resource, index) in resourceList" :key="index" @click="remove(resource)">
                  <q-item-section>{{ resource }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn flat label="Transform" class="q-mt-lg" @click="start" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { FileSource } from '@/common/model/file-source'
  import { ipcRenderer } from 'electron'
  import { mappingDataTableHeaders } from '@/common/model/data-table'

  @Component
  export default class Transformer extends Vue {
    private mappingList: any[] = []
    // Mapping data grouped by file and sheets
    private mappingObj: Map<string, any> = new Map<string, any>()
    private pagination = { page: 1, rowsPerPage: 0 }
    private filter: string = ''
    private loading: boolean = false
    private resourceList: string[] = ['Patient', 'Practitioner', 'Condition', 'Observation']

    get columns (): object[] { return mappingDataTableHeaders }
    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }

    mounted () {
      this.loading = true
      setTimeout(() => {
        this.getMappings().then(() => {
          let index = 0
          this.mappingList = Object.keys(this.mappingObj).flatMap(f =>
            Object.keys(this.mappingObj[f]).map(s =>
              ({name: index++, file: f, sheet: s, targets: this.mappingObj[f][s].length, targetList: this.mappingObj[f][s], transform: 0})))
          this.loading = false
        })
      }, 0)
    }

    start () {
      const filePathList = Object.keys(this.groupBy(this.mappingList, 'file'))
      for (let i = 0, p = Promise.resolve(); i < filePathList.length; i++) {
        p = p.then(_ => new Promise(resolve => {
          const filePath = filePathList[i]
          this.$q.loading.show({
            message: `Loading ${filePath.split('\\').pop()}...`
          })
          this.mappingList = this.mappingList.map(item => {
            if (item.file === filePath) {
              item.transform = {status: 'processing'}
            }
            return item
          })
          const sheets = this.mappingObj[filePath]
          ipcRenderer.send('transform', {filePath, sheets})

          // In case of file reading failure
          // Delete all other sheets listeners in that file
          ipcRenderer.on(`transforming-${filePath}`, (event, result) => {
            this.$q.loading.hide()
            ipcRenderer.removeAllListeners(`transforming-${filePath}`)
          })

          Promise.all(Object.keys(this.mappingObj[filePath]).map(sheet => {
            return new Promise(resolve1 => {
              ipcRenderer.on(`info-${filePath}-${sheet}`, (event, result) => {
                this.mappingList = this.mappingList.map(item => {
                  if ((item.file === filePath) && (item.sheet === sheet)) {
                    if (!item.info) item.info = {}
                    Object.assign(item.info, result)
                  }
                  return item
                })
                // TODO:
                // ipcRenderer.removeAllListeners(`info-${filePath}-${sheet}`)
              })
              ipcRenderer.on(`transforming-${filePath}-${sheet}`, (event, result) => {
                ipcRenderer.removeAllListeners(`transforming-${filePath}-${sheet}`)

                // Update status of mapping entries
                this.mappingList = this.mappingList.map(v => {
                  if (v.file === filePath && v.sheet === sheet) {
                    v.transform = result
                  }
                  return v
                })
                if (result) {
                  this.$log.success('Transforming', `Transform done ${sheet} in ${filePath}`)
                  resolve1()
                } else {
                  this.$log.error('Transforming', `Transform error for ${sheet} in ${filePath}. For details see logs/main`)
                  resolve1()
                }
              })
            })
          }))
          .then(() => resolve())
          .catch(() => resolve())
        }))
      }
    }
    getMappings (): Promise<any> {
      return Promise.all(this.fileSourceList.map(async file => {
        this.mappingObj[file.path] = {}
        const currFile = this.mappingObj[file.path]
        return Promise.all(file.sheets?.map(async sheet => {
          // TODO:
          // Filter headers which have any targets
          const headersWithTarget = sheet.headers?.filter(h => h.target?.length) || []
          if (headersWithTarget.length) {
            currFile[sheet.label] = headersWithTarget
          }
        }) || [])
      }))
    }
    groupBy (xs, key): any {
      return xs.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x)
        return rv
      }, {})
    }
    remove (resourceType: string) {
      this.loading = true
      ipcRenderer.send('delete-resource', resourceType)
      ipcRenderer.on('delete-resource-result', (event, result) => {
        ipcRenderer.removeAllListeners('delete-resource-result')
        if (result) {
          this.loading = false
          this.$q.notify({message: `${resourceType} Resources removed successfully`, color: 'grey-8'})
        } else {
          this.loading = false
          this.$q.notify({message: 'Something went wrong', color: 'grey-8'})
        }
      })
    }
    previousStep () {
      this.$q.dialog({
        title: 'Previous Step',
        message: 'If you go back and make any change, the changes you have made in this section will be lost.',
        class: 'text-weight-bold text-grey-9',
        cancel: true
      }).onOk(() => {
        this.$store.commit('decrementStep')
      })
    }
  }
</script>
