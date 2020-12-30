<template>
  <q-dialog ref="dialog">
    <q-card class="dialog-card">
      <q-card-section class="row items-center">
        <div class="text-h6">
          <q-icon name="visibility" color="primary" size="sm" />
          {{ $t('TITLES.SNAPSHOT_OF_DATA') }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="onCloseClick" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          flat
          bordered
          binary-state-sort
          :columns="columns"
          :data="entries"
          :pagination.sync="pagination"
          :rows-per-page-options="[10]"
        >
          <template v-slot:header="props">
            <tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="bg-grey-2"
              >
                <span class="vertical-middle text-grey-9">
                  {{ col.label }}
                </span>
              </q-th>
            </tr>
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
  import { Component, Mixins, Prop } from 'vue-property-decorator'
  import ModalMixin from '@/common/mixins/modalMixin'

  @Component
  export default class SnapshotDataCard extends Mixins(ModalMixin) {
    @Prop({required: true}) columns: any
    @Prop({required: true}) entries: any
    private pagination = {page: 1, rowsPerPage: 10}
  }
</script>

<style lang="stylus">
  .dialog-card
    width 900px !important
    max-width 80vw !important
</style>
