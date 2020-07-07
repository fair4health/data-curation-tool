<template>
  <q-dialog ref="dialog">
    <q-card class="concept-map-card">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ $t('TITLES.CONCEPT_MAP_DETAILS') }}
        </div>
        <q-space />
        <div class="q-gutter-sm">
          <q-btn v-if="propModel.conceptMap && propModel.conceptMap.source"
                 unelevated
                 rounded
                 label="Remove mapping"
                 icon="delete"
                 color="negative"
                 @click="removeConceptMap"
                 no-caps
          />
          <q-btn flat round dense icon="close" @click="onCloseClick" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row">
          <span class="text-size-lg text-weight-bold q-pa-xs">{{ $t('LABELS.SOURCE') }} <span class="text-red">*</span></span>
          <code-system-select class="full-width" v-model="sourceUrl" :value="sourceUrl" :label="$t('LABELS.SOURCE')" />
        </div>
        <div class="row">
          <span class="text-size-lg text-weight-bold q-pa-xs">{{ $t('LABELS.TARGET') }} <span class="text-red"></span></span>

          <!--Fixed URL from FHIR Resource element-->
          <template v-if="propModel.target && propModel.target.length && propModel.target[0].fixedUri">
            <q-input outlined
                     dense
                     class="full-width"
                     :value="propModel.target[0].fixedUri"
                     :hint="$t('LABELS.FIXED_URL_FROM_FHIR')"
                     disable
            />
          </template>
          <template v-else>
            <code-system-select class="full-width" v-model="targetUrl" :value="targetUrl" :label="$t('LABELS.TARGET')" />
          </template>

        </div>
        <q-item-label v-if="mandatoryError" class="text-weight-regular bg-red-1 q-pa-md">
          <span class="text-negative"><q-icon name="error" size="xs" class="q-mr-xs" /> Please check mandatory fields </span>
        </q-item-label>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat color="primary" :label="$t('BUTTONS.CANCEL')" @click="onCloseClick" />
        <q-btn unelevated color="primary" :label="$t('BUTTONS.OK')" @click="updateElementList" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { Component, Prop, Mixins } from 'vue-property-decorator'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import Loading from '@/components/Loading.vue'
  import { BufferElement } from '@/common/model/file-source'
  import ModalMixin from '@/common/mixins/modalMixin'

  @Component({
    components: {
      Loading,
      CodeSystemSelect: () => ({
        component: import('@/components/CodeSystemSelect.vue'),
        loading: Loading,
        delay: 0
      })
    } as any
  })
  export default class CodeSystemPopup extends Mixins(ModalMixin) {
    @Prop({required: true}) element: BufferElement

    private propModel: BufferElement = this.element
    private sourceUrl: string = this.propModel.conceptMap?.source || ''
    private targetUrl: string = this.propModel.conceptMap?.target || ''
    private mandatoryError: boolean = false

    get bufferSheetHeaders (): BufferElement[] { return this.$store.getters[types.File.BUFFER_SHEET_HEADERS] }

    updateElementList () {
      this.mandatoryError = false
      if (this.sourceUrl) {
        const targetUrl: string = this.propModel.target?.length && this.propModel.target[0]?.fixedUri || this.targetUrl
        this.propModel.conceptMap = {source: this.sourceUrl, target: targetUrl}
        this.onOKClick(true)
      } else {
        this.mandatoryError = true
      }
    }

    removeConceptMap () {
      delete this.propModel.conceptMap
      this.onOKClick(true)
    }
  }
</script>

<style lang="stylus">
  .concept-map-card
    min-width 700px !important
</style>
