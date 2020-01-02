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

  @Component({
    components: {
      DataSourceAnalyzer: () => import('@/components/DataSourceAnalyzer.vue'),
      MetadataMapper: () => import('@/components/MetadataMapper.vue'),
      Transformer: () => import('@/components/Transformer.vue')
    }
  })
  export default class Stepper extends Vue {
    get step (): number { return this.$store.getters.curationStep }
  }

</script>
