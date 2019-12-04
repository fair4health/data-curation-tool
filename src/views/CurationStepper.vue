<template>
  <div>
    <q-toolbar class="bg-grey-4">
      <q-toolbar-title class="text-grey-8">
        Curation
      </q-toolbar-title>
    </q-toolbar>
    <div class="q-ma-sm">

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
        <MetadataMapper />
      </template>

      <!--The last step Validation of Resources-->
      <template v-if="step === 4">
        <MetadataMapper />
      </template>

    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component({
    components: {
      DataSourceAnalyzer: () => import('@/components/DataSourceAnalyzer.vue'),
      MetadataMapper: () => import('@/components/MetadataMapper.vue')
    }
  })
  export default class Stepper extends Vue {
    get step (): number { return this.$store.getters.curationStep }
  }

</script>
