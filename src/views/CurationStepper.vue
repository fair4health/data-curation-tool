<template>
  <div>
    <q-toolbar class="bg-grey-4 text-white">
      <q-toolbar-title class="text-grey-8">
        Curation
      </q-toolbar-title>
    </q-toolbar>
    <q-stepper flat v-model="step" ref="stepper" :contracted="$q.screen.lt.sm" alternative-labels color="primary" class="bg-grey-3">

      <!--The first step - Data Source Analyzing-->
      <q-step :name="1" title="Analyze Data Source" icon="fas fa-database" :done="step > 1">
        <DataSourceAnalyzer />
      </q-step>

      <!--The second step - Metadata Mapping-->
      <q-step :name="2" title="Map Metadata" icon="fas fa-list-ul" :done="step > 2">
        <MetadataMapper />
      </q-step>

      <!--The third step - Transforming-->
      <q-step :name="3" title="Confirm and Transform" icon="fas fa-exchange-alt" :done="step > 3">
        <q-separator />
        Transform information
      </q-step>

      <!--The last step Validation of Resources-->
      <q-step :name="4" title="Validate" icon="fas fa-check-circle" :done="step > 4">
        <q-separator />
        Validation result
      </q-step>

    </q-stepper>
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
    set step (value) { this.$store.commit('stepUp', value) }
  }

</script>
