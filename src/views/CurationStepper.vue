<template>
  <div>

    <!--The first step - Data Source Analyzing-->
    <template v-if="step === 1">
      <DataSourceAnalyzer />
    </template>

    <!--The second step - Metadata Mapping-->
    <template v-if="step === 2">
      <MetadataMapper />
    </template>

    <!--The third step - Transforming-->
    <template v-if="step === 3">
      <Transformer />
    </template>

    <!--The last step Validation of Resources-->
    <template v-if="step === 4" />

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import Loading from '@/components/Loading.vue'

  @Component({
    components: {
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
