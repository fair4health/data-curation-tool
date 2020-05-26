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
        <q-select outlined
                  dense
                  options-dense
                  use-input
                  hide-selected
                  fill-input
                  clearable
                  :placeholder="$t('LABELS.CODE_SYSTEM')"
                  class="code-system-popup"
                  v-model="propModel.node.selectedUri"
                  input-debounce="0"
                  :options="systems"
                  @filter="filterCodeSystems"
                  :hint="hintCodeSystem"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ $t('LABELS.NO_RESULT') }}
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </template>
    </q-popup-edit>
  </q-btn>
</template>

<script lang="ts">
  import { Component, Prop, Mixins } from 'vue-property-decorator'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import { environment } from '@/common/environment'
  import StatusMixin from '@/common/mixins/statusMixin'

  @Component
  export default class CodeSystemPopup extends Mixins(StatusMixin) {
    @Prop() prop: any
    private systems: string[] = []

    private propModel: any = this.prop

    get fhirElementList (): fhir.ElementTree[] { return this.$store.getters[types.Fhir.ELEMENT_LIST] }
    get codeSystemList (): string[] { return this.$store.getters[types.Terminology.CODE_SYSTEM_LIST] }
    get terminologyBaseUrl (): string { return this.$store.getters[types.Terminology.TERMINOLOGY_BASE_URL] }
    get tBaseVerificationStatus (): status { return this.$store.getters[types.Terminology.T_BASE_VERIFICATION_STATUS] }
    get hintCodeSystem (): string {
      if (this.isSuccess(this.tBaseVerificationStatus)) return String(this.$t('LABELS.TERMINOLOGY_SERVICE_X', {url: this.terminologyBaseUrl}))
      else return String(this.$t('ERROR.NO_TERMINOLOGY_SERVICE_IS_CONNECTED'))
    }
    get mergedCodeSystems (): string[] {
      const envCodeSystems = Object.values(environment.codesystems).map(_ => _)
      return this.codeSystemList.concat(envCodeSystems.filter((item) => this.codeSystemList.indexOf(item) < 0))
    }

    filterCodeSystems (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.systems = this.mergedCodeSystems.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    }

    updateElementList () {
      this.$store.commit(types.Fhir.SET_ELEMENT_LIST, this.fhirElementList)
      this.$emit('update-prop', this.propModel)
    }
  }
</script>
