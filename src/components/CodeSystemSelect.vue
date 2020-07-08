<template>
  <q-select outlined
            dense
            options-dense
            use-input
            hide-selected
            fill-input
            clearable
            :placeholder="label"
            class="code-system-popup"
            :value="url"
            input-debounce="0"
            :options="systemUrls"
            @filter="filterCodeSystems"
            @input-value="updateUrl"
            @input="updateUrl"
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

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator'
  import { environment } from '@/common/environment'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'

  @Component
  export default class CodeSystemSelect extends Vue {
    @Prop({required: true}) label: string
    @Prop({required: true}) value: string

    private systemUrls: string[] = []
    private url: string = this.value || ''

    get codeSystemList (): string[] { return this.$store.getters[types.Terminology.CODE_SYSTEM_LIST] }
    get mergedCodeSystems (): string[] {
      const envCodeSystems = Object.values(environment.codesystems).map(_ => _)
      return this.codeSystemList.concat(envCodeSystems.filter((item) => this.codeSystemList.indexOf(item) < 0))
    }

    filterCodeSystems (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.systemUrls = this.mergedCodeSystems.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    }

    updateUrl (val: string) {
      this.url = val
      this.$emit('input', this.url)
    }
  }
</script>
