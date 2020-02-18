<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6 row items-center">
          <div>
            <q-icon name="feedback" color="primary" size="sm" class="q-mx-sm" />
            Transform Details
          </div>
          <q-space />
          <div v-if="transformDetails.length" class="row q-gutter-sm">
            <div>
              <q-chip square class="bg-grey-3">
                <q-avatar color="green" text-color="white" icon="check" />
                {{ successTransformCount.toLocaleString() }}
              </q-chip>
            </div>
            <div>
              <q-chip square class="bg-grey-3">
                <q-avatar color="orange-6" text-color="white" icon="warning" />
                {{ errorTransformCount.toLocaleString() }}
              </q-chip>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="scroll">
        <div class="bg-grey-2 q-mb-sm">
          <q-toggle
            v-model="successDetails"
            checked-icon="check"
            color="green"
            label="Transformed"
            unchecked-icon="clear"
          />
          <q-toggle
            v-model="errorDetails"
            checked-icon="warning"
            color="orange-6"
            label="Errors"
            unchecked-icon="clear"
          />
        </div>
        <q-table flat binary-state-sort :data="filteredTransformDetails" :columns="columns" row-key="name"
                 :rows-per-page-options="[10, 20, 0]" :pagination.sync="pagination" class="sticky-header-table"
                 table-style="max-height: 50vh" color="primary"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="status" :props="props">
                <template v-if="props.row.status === 'done'">
                  <q-icon name="check" color="green" size="xs" />
                </template>
                <template v-else-if="props.row.status === 'error'">
                  <q-icon name="warning" color="orange-6" size="xs" />
                </template>
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
        <q-btn flat color="primary" label="Close" @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { QDialog } from 'quasar'

  @Component
  export default class ErrorCard extends Vue {
    private columns = [
      { name: 'status', label: 'Status', field: 'status', align: 'center', icon: 'fas fa-info-circle',
        classes: 'bg-grey-2', headerClasses: 'bg-primary text-white col-1', style: 'width: 50px' },
      { name: 'message', label: 'Detail', field: 'message', align: 'left', sortable: true }
    ]
    private pagination = { page: 1, rowsPerPage: 10 }
    private successDetails: boolean = true
    private errorDetails: boolean = true

    get transformDetails (): TransformDetail[] { return this.$store.getters['fhir/transformDetails'] }
    get filteredTransformDetails (): TransformDetail[] {
      const details: TransformDetail[] = this.$store.getters['fhir/transformDetails']
      return details.filter(_ => {
        return (this.successDetails ? _.status === 'done' : 0) || (this.errorDetails ? _.status === 'error' : 0)
      })
    }
    get successTransformCount (): number { return this.transformDetails.filter(_ => _.status === 'done').length }
    get errorTransformCount (): number { return this.transformDetails.filter(_ => _.status === 'error').length }

    show () {
      (this.$refs.dialog as QDialog).show()
    }

    hide () {
      (this.$refs.dialog as QDialog).hide()
      this.$store.commit('fhir/setTransformDetails', [])
    }

    onDialogHide () {
      this.$emit('hide')
    }

    onOKClick () {
      this.$emit('ok')
      this.hide()
    }

    onCancelClick () {
      this.hide()
    }
  }
</script>

<style lang="stylus">
  .message-details-class
    font-size 0.85em
    max-width 70vw
    white-space normal
    margin-top 4px
</style>
