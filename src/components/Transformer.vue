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
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <template v-if="props.value === 'processing'">
                <q-spinner color="grey-9" />
              </template>
              <template v-else-if="props.value === 'done'">
                <q-icon name="check" color="green" />
              </template>
              <template v-else-if="props.value === 'error'">
                <q-icon name="error_outline" color="red" />
              </template>
              <template v-else>
                <q-icon name="access_time" color="grey-9" />
              </template>
            </q-td>
          </template>
          <template v-slot:body-cell-target="props">
            <q-td :props="props">
              {{ props.row.target.map(t => t.value).join(', ') }}
            </q-td>
          </template>
        </q-table>
        <div class="row content-end">
          <q-btn flat label="Back" icon="fas fa-angle-left" class="q-mt-lg" @click="$store.commit('decrementStep')" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { FileSource } from '@/common/file-source'
  import { ipcRenderer } from 'electron'

  @Component
  export default class Transformer extends Vue {
    private mappingList: any[] = []
    private columns: any[] = [
      { name: 'status', align: 'left', label: 'Status', field: 'status', sortable: true },
      { name: 'file', align: 'left', label: 'File', field: 'file', sortable: true },
      { name: 'sheet', align: 'left', label: 'Sheet', field: 'sheet', sortable: true },
      { name: 'header_value', align: 'left', label: 'Value', field: 'header_value', sortable: true },
      { name: 'header_type', align: 'left', label: 'Type', field: 'header_type', sortable: true },
      { name: 'target', align: 'left', label: 'Target', field: 'target', sortable: true }
    ]
    private pagination = { page: 1, rowsPerPage: 0 }
    private filter: string = ''
    private loading: boolean = false

    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }

    mounted () {
      this.loading = true
      setTimeout(() => {
        this.getMappings().then(() => {
          this.loading = false
        })
      }, 0)
    }

    getMappings (): Promise<any> {
      return Promise.all(this.fileSourceList.map( async file => {
        return Promise.all(file.sheets?.map(async sheet => {
          return Promise.all(sheet.headers?.map(async header => {
            if (header.target) {
              this.mappingList.push({
                file: file.path,
                sheet: sheet.label,
                header_value: header.value,
                header_type: header.type,
                target: header.target,
                status: 0
              })
            }
          }) || [])
        }) || [])
      }))
    }
  }
</script>
