<template>
  <q-btn dense
         unelevated
         color="grey-3"
         text-color="grey-8"
         class="q-px-sm q-mr-sm"
         no-caps
  >
    <span class="text-size-sm">{{ $t('BUTTONS.SYSTEM') }}</span>
    <q-popup-edit buttons
                  v-model="propModel.node.selectedUri"
                  :label-set="$t('BUTTONS.SET')"
                  :label-cancel="$t('BUTTONS.CANCEL')"
                  @save="updateElementList()"
    >
      <template>
        <q-item-label class="text-size-xxl text-weight-bold">
          {{ $t('LABELS.CODE_SYSTEM') }}
        </q-item-label>
        <q-separator spaced />
        <code-system-select :label="$t('LABELS.CODE_SYSTEM')"
                            v-model="propModel.node.selectedUri"
                            :value="propModel.node.selectedUri"
        />
      </template>
    </q-popup-edit>
  </q-btn>
</template>

<script lang="ts">
  import { Component, Prop, Mixins } from 'vue-property-decorator'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import StatusMixin from '@/common/mixins/statusMixin'
  import Loading from '@/components/Loading.vue'

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
  export default class CodeSystemPopup extends Mixins(StatusMixin) {
    @Prop() prop: any

    private propModel: any = this.prop

    get fhirElementList (): fhir.ElementTree[] { return this.$store.getters[types.Fhir.ELEMENT_LIST] }

    updateElementList () {
      this.$store.commit(types.Fhir.SET_ELEMENT_LIST, this.fhirElementList)
      this.$emit('update-prop', this.propModel)
    }
  }
</script>
