<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="mapping-detail-card">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ $t('TITLES.MAPPING_DETAILS') }}
        </div>
        <q-space />
        <q-btn flat v-close-popup round dense icon="close" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-mb-md">
          <q-chip square :label="'#' + mapping.recordId" color="secondary" class="text-white text-weight-bold text-size-lg" />
          <q-chip square :label="mapping.resource" color="primary" class="text-white text-size-lg" />
          <q-chip square :label="mapping.profile" color="primary" class="text-white text-size-lg" />
        </div>
        <div class="row">
          <q-table flat binary-state-sort :data="mapping.data" :columns="columns" row-key="name"
                   :rows-per-page-options="[5, 10, 0]" :pagination.sync="pagination" :filter="filterText" class="sticky-header-table full-width"
                   color="primary" table-class="mapping-detail-table" :rows-per-page-label="$t('TABLE.RECORDS_PER_PAGE')"
          >
            <template v-slot:header-cell="props">
              <th :props="props" :class="props.col.headerClasses" :align="props.col.align">
                {{ $t(props.col.label) }}
              </th>
            </template>
            <template v-slot:body="props">
              <tr :props="props">
                <q-td key="sourceField" :props="props">
                  <span class="text-size-md">
                    {{ props.row.value || '-' }}
                  </span>
                </q-td>
                <q-td key="targetField" :props="props">
                  <div v-for="(target, targetI) in props.row.target" :key="targetI" class="full-width">
                    <q-chip dense square v-if="!!target.value"
                            color="grey-3" text-color="grey-9">
                      <div class="ellipsis text-size-md">{{ target.value }}</div>
                      <q-tooltip>{{ target.value }}</q-tooltip>
                    </q-chip>
                    <div v-else>
                      -
                    </div>
                  </div>
                </q-td>
                <q-td key="targetType" :props="props">
                  <div v-for="(target, targetI) in props.row.target" :key="targetI" class="full-width">
                    <q-chip dense square v-if="!!target.type"
                            color="grey-3" text-color="grey-9">
                      <div class="ellipsis text-size-md">{{ target.type }}</div>
                      <q-tooltip>{{ target.type }}</q-tooltip>
                    </q-chip>
                    <div v-else>
                      -
                    </div>
                  </div>
                </q-td>
                <q-td key="defaultValue" :props="props">
                  <q-chip dense square v-if="!!props.row.defaultValue"
                          color="grey-4" text-color="grey-8" class="q-pa-sm no-margin">
                    <div class="ellipsis text-size-md">
                      <q-icon name="fas fa-thumbtack" class="q-mr-xs" />
                      {{ props.row.defaultValue }}
                    </div>
                    <q-tooltip>{{ props.row.defaultValue }}</q-tooltip>
                  </q-chip>
                  <div v-else>
                    -
                  </div>
                </q-td>
                <q-td key="fixedUri" :props="props">
                  <div v-for="(target, targetI) in props.row.target" :key="targetI" class="full-width truncate-chip-labels">
                    <q-chip dense square v-if="!!target.fixedUri" clickable @click="openExternal(target.fixedUri)"
                            color="grey-3" text-color="grey-9" class="cursor-pointer">
                      <div class="ellipsis text-size-md">
                        <q-icon name="open_in_new" class="q-mr-xs" />
                        {{ target.fixedUri }}
                      </div>
                      <q-tooltip>
                        <q-icon name="open_in_new" class="q-mr-xs" />
                        {{ target.fixedUri }}
                      </q-tooltip>
                    </q-chip>
                    <div v-else>
                      -
                    </div>
                  </div>
                </q-td>
                <q-td key="conceptMap" :props="props">
                  <span class="text-size-md">
                    {{ props.row.conceptMap && props.row.conceptMap.name || '-' }}
                  </span>
                </q-td>
              </tr>
            </template>
          </q-table>
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right" class="col-auto">
        <q-btn outline class="q-px-md" color="primary" :label="$t('BUTTONS.EDIT')" icon="edit" @click="onOKClick(mapping)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { Component, Mixins, Prop } from 'vue-property-decorator'
  import { mappingDetailTable } from '@/common/model/data-table'
  import { shell } from 'electron'
  import ModalMixin from '@/common/mixins/modalMixin'

  @Component
  export default class MappingDetailCard extends Mixins(ModalMixin) {
    @Prop({required: true, default: undefined}) mapping: store.Record | undefined
    private filterText: string = ''
    private columns = mappingDetailTable.columns
    private pagination = mappingDetailTable.pagination

    openExternal (url: string) {
      shell.openExternal(url)
    }

  }
</script>

<style lang="stylus">
  .mapping-detail-card
    min-width 1000px
    max-width 1500px
  .mapping-detail-table
    max-height 67vh
</style>
