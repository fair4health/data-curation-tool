<template>
  <div>

    <!--Start point - FHIR URL Verification-->
    <template v-if="step === 1">
      <OnFHIRConfig />
    </template>

    <!--The first step - Data Source Analyzing-->
    <template v-if="step === 2">
      <DataSourceAnalyzer />
    </template>

    <!--The second step - Metadata Mapping-->
    <template v-if="step === 3">
      <MetadataMapper />
    </template>

    <!--The third step - Validation-->
    <template v-if="step === 4">
      <Validator />
    </template>

    <!--The last step - Transform-->
    <template v-if="step === 5">
      <Transformer />
    </template>

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import Loading from '@/components/Loading.vue'

  @Component({
    components: {
      OnFHIRConfig: () => ({
        component: import('@/components/OnFHIRConfig.vue'),
        loading: Loading,
        delay: 0
      }),
      DataSourceAnalyzer: () => ({
        component: import('@/components/DataSourceAnalyzer.vue'),
        loading: Loading,
        delay: 0
      }),
      MetadataMapper: () => ({
        component: import('@/components/MetadataMapper.vue'),
        loading: Loading,
        delay: 0
      }),
      Validator: () => ({
        component: import('@/components/Validator.vue'),
        loading: Loading,
        delay: 0
      }),
      Transformer: () => ({
        component: import('@/components/Transformer.vue'),
        loading: Loading,
        delay: 0
      })
    } as any
  })
  export default class Stepper extends Vue {
    get step (): number { return this.$store.getters.curationStep }
  }

</script>
