<template>
  <q-dialog ref="dialog" @hide="onDialogHide" :full-width="fullscreen" :full-height="fullscreen">
    <q-card class="dialog-card">
      <q-card-section class="row items-center">
        <div class="text-h6">
          <q-icon name="feedback" color="primary" size="sm" class="q-mx-sm" />
          {{ $t('TITLES.OUTCOME_DETAILS') }}
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
        <q-btn flat round dense :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
               @click="fullscreen = !fullscreen" class="q-ml-md">
          <q-tooltip content-class="bg-white text-primary">{{ $t(fullscreen ? 'BUTTONS.MINIMIZE' : 'BUTTONS.MAXIMIZE') }}</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="close" @click="onCloseClick" />
      </q-card-section>

      <q-separator />

      <q-card-section class="scroll">
        <div class="row q-gutter-sm">
          <div class="bg-grey-2 q-mb-sm col">
            <div class="text-subtitle1 text-weight-bold text-grey-7 q-pa-sm">{{ $t('LABELS.STATUS') }}</div>
            <q-separator />
            <q-toggle v-model="successDetails" checked-icon="check" color="positive" :label="$t('COMMON.SUCCESS')" unchecked-icon="clear"/>
            <q-toggle v-model="errorDetails" checked-icon="warning" color="negative" :label="$t('COMMON.ERROR')" unchecked-icon="clear"/>
          </div>
          <div class="bg-grey-2 q-mb-sm col">
            <div class="text-subtitle1 text-weight-bold text-grey-7 q-pa-sm">{{ $t('LABELS.RESOURCES') }}</div>
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
                 table-class="outcome-table" :rows-per-page-label="$t('TABLE.RECORDS_PER_PAGE')"
        >
          <template v-slot:header-cell="props">
            <th :props="props" :class="props.col.headerClasses" :align="props.col.align">
              {{ $t(props.col.label) }}
            </th>
          </template>
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
        <q-btn flat color="primary" :label="$t('BUTTONS.CLOSE')" @click="onCloseClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { Component, Mixins } from 'vue-property-decorator'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import StatusMixin from '@/common/mixins/statusMixin'
  import ModalMixin from '@/common/mixins/modalMixin'
  import { outcomeDetailTable } from '@/common/model/data-table'

  @Component
  export default class OutcomeCard extends Mixins(StatusMixin, ModalMixin) {
    private columns = outcomeDetailTable.columns
    private pagination = outcomeDetailTable.pagination
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
