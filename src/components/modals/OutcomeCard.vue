<template>
  <q-dialog ref="dialog" @hide="onDialogHide" :full-width="fullscreen" :full-height="fullscreen">
    <q-card class="dialog-card">
      <q-card-section>
        <div class="text-h6 row items-center">
          <div>
            <q-icon name="feedback" color="primary" size="sm" class="q-mx-sm" />
            Outcome Details
          </div>
          <q-space />
          <div v-if="outcomeDetails.length" class="row q-gutter-sm">
            <div>
              <q-chip square class="bg-grey-3">
                <q-avatar color="positive" text-color="white" icon="check" />
                {{ successTransformCount.toLocaleString() }}
              </q-chip>
            </div>
            <div>
              <q-chip square class="bg-grey-3">
                <q-avatar color="negative" text-color="white" icon="warning" />
                {{ errorTransformCount.toLocaleString() }}
              </q-chip>
            </div>
          </div>
          <q-btn flat dense :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                 @click="fullscreen = !fullscreen" class="q-ml-md">
            <q-tooltip content-class="bg-white text-primary">{{ fullscreen ? 'Minimize' : 'Maximize'}}</q-tooltip>
          </q-btn>
          <q-btn unelevated dense icon="close" color="grey-3" text-color="grey-10" @click="onCloseClick">
            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="scroll">
        <div class="row q-gutter-sm">
          <div class="bg-grey-2 q-mb-sm col">
            <div class="text-subtitle1 text-weight-bold text-grey-7 q-pa-sm">Status</div>
            <q-separator />
            <q-toggle v-model="successDetails" checked-icon="check" color="positive" label="Success" unchecked-icon="clear"/>
            <q-toggle v-model="errorDetails" checked-icon="warning" color="negative" label="Error" unchecked-icon="clear"/>
          </div>
          <div class="bg-grey-2 q-mb-sm col">
            <div class="text-subtitle1 text-weight-bold text-grey-7 q-pa-sm">Resources</div>
            <q-separator />
            <q-toggle
              v-model="selectedResources"
              v-for="resource in activeProfiles"
              :key="resource"
              :label="resource"
              :val="resource"
              color="primary"
              checked-icon="check"
              unchecked-icon="clear"
            />
          </div>
        </div>
        <q-table flat binary-state-sort :data="filteredOutcomeDetails" :columns="columns" row-key="name" color="primary"
                 :rows-per-page-options="[10, 20, 50]" :pagination.sync="pagination" class="sticky-header-table"
                 table-class="outcome-table"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="status" :props="props">
                <template v-if="isSuccess(props.row.status)">
                  <q-icon name="check" color="positive" size="xs" />
                </template>
                <template v-else-if="isError(props.row.status)">
                  <q-icon name="warning" color="negative" size="xs" />
                </template>
              </q-td>
              <q-td key="resourceType" :props="props">
                <div class="message-details-class text-grey-8">
                  {{ props.row.resourceType }}
                </div>
              </q-td>
              <q-td key="message" :props="props">
                <div class="message-details-class text-grey-8">
                  {{ props.row.message }}
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Close" @click="onCloseClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { Component, Mixins } from 'vue-property-decorator'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import StatusMixin from '@/common/mixins/statusMixin'
  import ModalMixin from '@/common/mixins/modalMixin'

  @Component
  export default class OutcomeCard extends Mixins(StatusMixin, ModalMixin) {
    private columns = [
      { name: 'status', label: 'Status', field: 'status', align: 'center', icon: 'fas fa-info-circle',
        classes: 'bg-grey-2', headerClasses: 'bg-primary text-white col-1 outcome-table-column' },
      { name: 'resourceType', label: 'Resource', field: 'resourceType', align: 'center', sortable: true,
        classes: 'bg-grey-1', headerClasses: 'bg-grey-4 text-grey-10 col-1 outcome-table-column' },
      { name: 'message', label: 'Detail', field: 'message', align: 'left', sortable: true }
    ]
    private pagination = { page: 1, rowsPerPage: 10 }
    private successDetails: boolean = true
    private errorDetails: boolean = true
    private selectedResources: string[] = []
    private fullscreen: boolean = false

    get outcomeDetails (): OutcomeDetail[] { return this.$store.getters[types.Fhir.OUTCOME_DETAILS] }
    get filteredOutcomeDetails (): OutcomeDetail[] {
      const details: OutcomeDetail[] = this.$store.getters[types.Fhir.OUTCOME_DETAILS]
      return details.filter(_ => {
        return ((this.successDetails ? this.isSuccess(_.status) : 0) || (this.errorDetails ? this.isError(_.status) : 0))
          && this.selectedResources.includes(_.resourceType)
      })
    }
    get successTransformCount (): number { return this.outcomeDetails.filter(_ => this.isSuccess(_.status)).length }
    get errorTransformCount (): number { return this.outcomeDetails.filter(_ => this.isError(_.status)).length }
    get activeProfiles (): any[] {
      return this.selectedResources = Object.keys(this.outcomeDetails.reduce((acc, curr) => {
        (acc[curr['resourceType']] = acc[curr['resourceType']] || [])
        return acc
      }, {}))
    }

    beforeDestroy () {
      this.$store.commit(types.Fhir.SET_OUTCOME_DETAILS, [])
    }

  }
</script>

<style lang="stylus">
  .dialog-card
    width 900px !important
    max-width 80vw !important
  .message-details-class
    font-size 0.85em
    max-width 70vw
    white-space normal
    margin-top 4px
  .outcome-table
    max-height 50vh
  .outcome-table-column
    width 50px
</style>
