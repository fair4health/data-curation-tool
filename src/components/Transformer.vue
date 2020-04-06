<template>
  <div>
    <q-toolbar class="bg-grey-4 top-fix-column">
      <q-toolbar-title class="text-grey-8">
        Curation - <span class="text-subtitle1">Transformer</span>
      </q-toolbar-title>
    </q-toolbar>
    <q-card flat bordered class="q-ma-sm">
      <q-card-section>
        <q-item-label class="text-h5 q-ma-md">Transform</q-item-label>
        <q-list separator class="rounded-borders">
          <q-item class="q-py-md text-white bg-primary" style="font-size: 13px">
            <q-item-section top avatar>Status</q-item-section>
            <q-item-section top class="col-1 gt-sm" />
            <q-item-section top class="col-7">Resource Type</q-item-section>
            <q-item-section top>Count</q-item-section>
            <q-item-section top side class="text-white">Actions</q-item-section>
          </q-item>
          <template v-if="transformList.length">
            <q-item v-for="resource in transformList" :key="resource.resourceType" class="q-py-md bg-grey-1">
              <q-item-section avatar>
                <template v-if="resource.status === 'in-progress'">
                  <span>
                    <q-spinner color="grey-9" />
                    <q-tooltip>Transforming...</q-tooltip>
                  </span>
                </template>
                <template v-else-if="resource.status === 'success'">
                  <q-icon name="check" color="green">
                    <q-tooltip>Completed</q-tooltip>
                  </q-icon>
                </template>
                <template v-else-if="resource.status === 'warning'">
                  <q-icon name="warning" color="orange-6">
                    <q-tooltip>{{ resource.description }}</q-tooltip>
                  </q-icon>
                </template>
                <template v-else-if="resource.status === 'error'">
                  <q-icon name="error_outline" color="red" class="cursor-pointer">
                    <q-tooltip content-class="error-tooltip" class="ellipsis-3-lines">{{ resource.validation.description }}</q-tooltip>
                  </q-icon>
                </template>
                <template v-else>
                  <q-icon name="access_time" color="grey-7">
                    <q-tooltip>Waiting</q-tooltip>
                  </q-icon>
                </template>
              </q-item-section>

              <q-item-section class="col-1 gt-sm">
                <template v-if="resource.status === 'in-progress'"><q-item-label class="q-mt-sm" caption>In progress</q-item-label></template>
                <template v-else-if="resource.status === 'success'"><q-item-label class="q-mt-sm" caption>Completed</q-item-label></template>
                <template v-else-if="resource.status === 'error'"><q-item-label class="q-mt-sm" caption>Error</q-item-label></template>
                <template v-else-if="resource.status === 'warning'"><q-item-label class="q-mt-sm" caption>Warning</q-item-label></template>
                <template v-else><q-item-label class="q-mt-sm" caption>Pending</q-item-label></template>
              </q-item-section>

              <q-item-section class="col-7">
                <q-item-label lines="2">
                  <span class="text-weight-medium text-grey-7" style="font-size: 15px">{{ resource.resourceType }}</span>
                </q-item-label>
              </q-item-section>

              <q-item-section>
                <div>
                  <q-chip square class="bg-orange-6 text-white">
                    {{ resource.count }}
                  </q-chip>
                  <q-chip v-if="resource.createdCount" square class="bg-green text-white">
                    {{ resource.createdCount }}
                  </q-chip>
                </div>
              </q-item-section>

              <q-item-section side>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn class="gt-xs" size="12px" flat dense round icon="delete" color="red-7" @click="removeResourceFromStore(resource.resourceType)"
                         :disable="transformStatus === 'in-progress'">
                    <q-tooltip content-class="bg-white text-red-7">Remove</q-tooltip>
                  </q-btn>
                  <q-btn size="12px" flat dense round icon="more_vert" :disable="transformStatus === 'in-progress'">
                    <q-tooltip content-class="bg-white text-grey-9">More</q-tooltip>
                    <q-menu transition-show="jump-down" transition-hide="jump-up" auto-close>
                      <q-list style="min-width: 150px">
                        <q-item clickable @click="removeResourceFromFHIR(resource.resourceType)">
                          <q-item-section style="font-size: 12px">Remove from FHIR</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <div class="text-grey-9 q-ma-md">
              <q-icon name="warning" size="sm" />
              <span class="q-pl-sm" style="font-size: 13px">No data available</span>
            </div>
          </template>
          <q-separator />
        </q-list>
        <div class="row content-end q-gutter-sm">
          <q-space />
          <q-btn unelevated color="primary" label="Details" @click="openOutcomeDetailCard(transformOutcomeDetails)" class="q-mt-lg"
                 v-show="transformStatus !== 'in-progress' && transformStatus !== 'pending'" no-caps />
          <q-btn outline color="primary" @click="transform" class="q-mt-lg"
                 :disable="transformStatus === 'in-progress' || !transformList.length" no-caps>
            <span v-if="transformStatus !== 'pending'" class="q-mr-sm">
              <q-spinner size="xs" v-show="transformStatus === 'in-progress'" />
              <q-icon name="check" size="xs" color="green" v-show="transformStatus === 'success'" />
              <q-icon name="error_outline" size="xs" color="red" v-show="transformStatus === 'error'" />
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
  import { Component, Vue } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import OutcomeCard from '@/components/OutcomeCard.vue'
  import electronStore from '../common/electron-store'

  @Component
  export default class Transformer extends Vue {
    private pagination = { page: 1, rowsPerPage: 0 }
    private columns = [
      { name: 'status', label: 'Status', field: 'status', align: 'center', icon: 'fas fa-info-circle',
        classes: 'bg-grey-2', headerClasses: 'bg-primary text-white col-1', style: 'width: 50px' },
      { name: 'resourceType', label: 'Resource', field: 'resourceType', align: 'center', sortable: true,
        classes: 'bg-grey-1', headerClasses: 'bg-grey-4 text-grey-10 col-1' },
      { name: 'count', label: 'Count', field: 'count', align: 'center', sortable: true }
    ]

    get fhirBase (): string { return this.$store.getters['fhir/fhirBase'] }

    get transformStatus (): status { return this.$store.getters['transformStatus'] }
    set transformStatus (value) { this.$store.commit('setTransformStatus', value) }

    get resources (): Map<string, fhir.Resource[]> { return this.$store.getters['resources'] }
    set resources (value) { this.$store.commit('setResources', value) }

    get transformList (): TransformListItem[] { return this.$store.getters['transformList'] }
    set transformList (value) { this.$store.commit('setTransformList', value) }

    get transformOutcomeDetails (): OutcomeDetail[] { return this.$store.getters['transformOutcomeDetails'] }
    set transformOutcomeDetails (value) { this.$store.commit('setTransformOutcomeDetails', value) }

    onInit () {
      this.resources = new Map(Object.entries(electronStore.get('resources') || {}))
      this.transformList = Array.from(this.resources.entries()).map(resource => ({resourceType: resource[0], count: resource[1].length, status: 'pending'}))
    }

    transform () {
      if (this.transformList.length) {
        ipcRenderer.send('transform', this.fhirBase)
        this.transformStatus = 'in-progress'
        ipcRenderer.on('transform-result', (event, result: OutcomeDetail) => {
          ipcRenderer.removeAllListeners(`transform-result`)
          this.transformStatus = result.status
          this.transformOutcomeDetails = result.outcomeDetails || []
        })
        this.transformList.map((item: TransformListItem) => {

          ipcRenderer.on(`transform-${item.resourceType}`, (event, result: OutcomeDetail) => {
            if (result.status === 'in-progress') {

              this.transformList = this.transformList.map(_ => {
                if (_.resourceType === item.resourceType) _.status = 'in-progress'
                return _
              })

            } else {

              this.transformList = this.transformList.map(_ => {
                if (_.resourceType === item.resourceType) {
                  _.status = result.status
                  _.createdCount = (result.outcomeDetails || []).filter(value => value.status === 'success').length
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
        title: '<span class="text-primary"><i class="fas fa-info-circle" style="padding-right: 5px"></i>Previous Step</span>',
        message: 'If you go back and make any change, the changes you have made in this section will be lost.',
        class: 'text-grey-9',
        cancel: true,
        html: true
      }).onOk(() => {
        this.$store.commit('decrementStep')
      })
    }

    removeResourceFromStore (resourceType: string) {
      this.$q.dialog({
        title: '<i class="fas fa-trash text-red-7"> Remove Resource </i>',
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
      const fhirBase: string = this.$store.getters['fhir/fhirBase']
      ipcRenderer.send('delete-resource', fhirBase, resourceType)
      ipcRenderer.on('delete-resource-result', (event, result) => {
        ipcRenderer.removeAllListeners('delete-resource-result')
        if (result) {
          this.$q.loading.hide()
          this.$notify.success(`${resourceType} Resources removed successfully`)
        } else {
          this.$q.loading.hide()
          this.$notify.error('Something went wrong')
        }
      })
    }

    openOutcomeDetailCard (outcomeDetails: OutcomeDetail[]) {
      this.$store.commit('fhir/setOutcomeDetails', outcomeDetails)
      this.$q.dialog({
        component: OutcomeCard,
        parent: this
      })
    }

  }
</script>
