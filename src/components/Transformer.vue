<template>
  <div>
    <q-toolbar class="bg-grey-4 top-fix-column">
      <q-toolbar-title class="text-grey-8">
        Curation - <span class="text-subtitle1">Transformer</span>
      </q-toolbar-title>
    </q-toolbar>
    <q-card flat bordered class="q-ma-sm">
      <q-card-section>
        <q-table flat binary-state-sort title="Transform" class="full-width" :data="transformList" :columns="columns"
                 row-key="resourceType" :pagination.sync="pagination" :rows-per-page-options="[0]"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="bg-primary text-white"
              >
                <q-icon v-if="col.icon" :name="col.icon" />
                <span class="vertical-middle q-ml-xs">{{ col.label }}</span>
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <tr :props="props">
              <q-td key="status" :props="props" class="q-table--col-auto-width">
                <div class="row items-center q-gutter-md">
                  <div class="col">
                    <template v-if="isInProgress(props.row.status)">
                      <q-spinner color="grey-9" />
                    </template>
                    <template v-else-if="isSuccess(props.row.status)">
                      <q-icon name="check" size="xs" color="green" />
                    </template>
                    <template v-else-if="isWarning(props.row.status)">
                      <q-icon name="warning" size="xs" color="orange-6" />
                    </template>
                    <template v-else-if="isError(props.row.status)">
                      <q-icon name="error_outline" size="xs" color="red" />
                    </template>
                    <template v-else>
                      <q-icon name="access_time" size="xs" color="grey-7" />
                    </template>
                  </div>

                  <div class="col q-pr-lg">
                    <template v-if="isInProgress(props.row.status)"><q-item-label caption>In progress</q-item-label></template>
                    <template v-else-if="isSuccess(props.row.status)"><q-item-label caption>Completed</q-item-label></template>
                    <template v-else-if="isError(props.row.status)"><q-item-label caption>Error</q-item-label></template>
                    <template v-else-if="isWarning(props.row.status)"><q-item-label caption>Warning</q-item-label></template>
                    <template v-else><q-item-label caption>Pending</q-item-label></template>
                  </div>
                </div>
              </q-td>
              <q-td key="resourceType" :props="props">
                {{ props.row.resourceType }}
              </q-td>
              <q-td key="count" :props="props">
                <q-chip square class="bg-grey-3 text-grey-8">
                  {{ props.row.count }}
                </q-chip>
              </q-td>
              <q-td key="createdCount" :props="props">
                <q-chip square class="bg-positive text-white">
                  {{ props.row.createdCount || '-' }}
                </q-chip>
              </q-td>
              <q-td key="action" :props="props" class="q-table--col-auto-width">
                <div class="row">
                  <q-space />
                  <div class="text-grey-8 q-gutter-xs">
                    <q-btn class="gt-xs" size="12px" flat dense round icon="delete" color="red-7" @click="removeResourceFromStore(props.row.resourceType)"
                           :disable="isInProgress(transformStatus)">
                      <q-tooltip content-class="bg-white text-red-7">Remove</q-tooltip>
                    </q-btn>
                    <q-btn size="12px" flat dense round icon="more_vert" :disable="isInProgress(transformStatus)">
                      <q-tooltip content-class="bg-white text-grey-9">More</q-tooltip>
                      <q-menu auto-close>
                        <q-list padding class="menu-list">
                          <q-item clickable dense @click="removeResourceFromFHIR(props.row.resourceType)">
                            <q-item-section class="text-size-md">Remove from FHIR</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </div>
              </q-td>
            </tr>
          </template>
        </q-table>
        <div class="row content-end q-gutter-sm">
          <q-space />
          <q-btn unelevated color="primary" label="Details" @click="openOutcomeDetailCard(transformOutcomeDetails)" class="q-mt-lg"
                 v-show="!isInProgress(transformStatus) && !isPending(transformStatus)" no-caps />
          <q-btn outline color="primary" @click="transform" class="q-mt-lg"
                 :disable="isInProgress(transformStatus) || !transformList.length" no-caps>
            <span v-if="!isPending(transformStatus)" class="q-mr-sm">
              <q-spinner size="xs" v-show="isInProgress(transformStatus)" />
              <q-icon name="check" size="xs" color="green" v-show="isSuccess(transformStatus)" />
              <q-icon name="error_outline" size="xs" color="red" v-show="isError(transformStatus)" />
            </span>
            <span>Transform</span>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
    <div class="row q-pa-sm">
      <q-btn unelevated label="Back" color="primary" icon="chevron_left" @click="previousStep" no-caps />
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Mixins } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import OutcomeCard from '@/components/modals/OutcomeCard.vue'
  import electronStore from '@/common/electron-store'
  import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import Status from '@/common/Status'
  import StatusMixin from '@/common/mixins/statusMixin'
  import { transformerTable } from '@/common/model/data-table'

  @Component
  export default class Transformer extends Mixins(StatusMixin) {
    private pagination = transformerTable.pagination
    private columns = transformerTable.columns

    get fhirBase (): string { return this.$store.getters[types.Fhir.FHIR_BASE] }

    get transformStatus (): status { return this.$store.getters[types.TRANSFORM_STATUS] }
    set transformStatus (value) { this.$store.commit(types.SET_TRANSFORM_STATUS, value) }

    get resources (): Map<string, fhir.Resource[]> { return this.$store.getters[types.RESOURCES] }
    set resources (value) { this.$store.commit(types.SET_RESOURCES, value) }

    get transformList (): TransformListItem[] { return this.$store.getters[types.TRANSFORM_LIST] }
    set transformList (value) { this.$store.commit(types.SET_TRANSFORM_LIST, value) }

    get transformOutcomeDetails (): OutcomeDetail[] { return this.$store.getters[types.TRANSFORM_OUTCOME_DETAILS] }
    set transformOutcomeDetails (value) { this.$store.commit(types.SET_TRANSFORM_OUTCOME_DETAILS, value) }

    onInit () {
      this.resources = new Map(Object.entries(electronStore.get('resources') || {}))
      this.transformList = Array.from(this.resources.entries()).map(resource => ({resourceType: resource[0], count: resource[1].length, status: Status.PENDING}))
    }

    transform () {
      if (this.transformList.length) {
        ipcRenderer.send(ipcChannels.TO_BACKGROUND, ipcChannels.Fhir.TRANSFORM)
        this.transformStatus = Status.IN_PROGRESS
        ipcRenderer.on(ipcChannels.Fhir.TRANSFORM_RESULT, (event, result: OutcomeDetail) => {
          ipcRenderer.removeAllListeners(ipcChannels.Fhir.TRANSFORM_RESULT)
          this.transformStatus = result.status
          this.transformOutcomeDetails = result.outcomeDetails || []
        })
        this.transformList.map((item: TransformListItem) => {

          ipcRenderer.on(`transform-${item.resourceType}`, (event, result: OutcomeDetail) => {
            if (this.isInProgress(result.status)) {

              this.transformList = this.transformList.map(_ => {
                if (_.resourceType === item.resourceType) _.status = Status.IN_PROGRESS
                return _
              })

            } else {

              this.transformList = this.transformList.map(_ => {
                if (_.resourceType === item.resourceType) {
                  _.status = result.status
                  _.createdCount = (result.outcomeDetails || []).filter(value => this.isSuccess(value.status)).length
                }
                return _
              })
              ipcRenderer.removeAllListeners(`transform-${item.resourceType}`)

            }

          })
        })
      }
    }

    previousStep () {
      this.$q.dialog({
        title: '<span class="text-primary"><i class="fas fa-info-circle q-pr-sm"></i>Previous Step</span>',
        message: 'If you go back and make any change, the changes you have made in this section will be lost.',
        class: 'text-grey-9',
        cancel: true,
        html: true
      }).onOk(() => {
        this.$store.commit(types.DECREMENT_STEP)
      })
    }

    removeResourceFromStore (resourceType: string) {
      this.$q.dialog({
        title: '<span class="text-negative"><i class="fas fa-trash q-pr-sm"></i>Remove Resource</span>',
        message: `Are you sure to remove ${resourceType} resource. ${resourceType} resources will not be transformed.`,
        class: 'text-grey-9',
        cancel: true,
        html: true
      }).onOk(() => {
        electronStore.delete(`resources.${resourceType}`)
        this.onInit()
      })
    }

    removeResourceFromFHIR (resourceType: string) {
      this.$q.loading.show()
      this.$store.dispatch(types.Fhir.DELETE_ALL, resourceType)
        .then(() => {
          this.$q.loading.hide()
          this.$notify.success(`${resourceType} Resources have been removed successfully`)
        })
      .catch(() => {
        this.$q.loading.hide()
        this.$notify.error('Something went wrong')
      })
    }

    openOutcomeDetailCard (outcomeDetails: OutcomeDetail[]) {
      this.$store.commit(types.Fhir.SET_OUTCOME_DETAILS, outcomeDetails)
      this.$q.dialog({
        component: OutcomeCard,
        parent: this
      })
    }

  }
</script>
