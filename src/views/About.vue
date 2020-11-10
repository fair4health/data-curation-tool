<template>
  <div>
    <q-toolbar class="bg-grey-4">
      <q-toolbar-title class="text-grey-8">
        {{ $t('TITLES.ABOUT') }}
      </q-toolbar-title>
    </q-toolbar>
    <div class="row justify-center q-ma-lg">
      <q-card flat class="bg-grey-3 col-xs-12 col-sm-12 col-md-6">
        <p align="center"><img src="../assets/FAIR4Health-logo.png" alt="FAIR4Health Logo" width="400" /></p>
        <q-card-section>
          <p class="text-grey-7 text-size-xl text-center">{{ description }}</p>
        </q-card-section>
        <q-card-section class="text-center text-h6 text-grey-7">
          {{ $t('LABELS.FOLLOW_US') }}
        </q-card-section>
        <q-card-section class="text-center q-gutter-md">
          <q-btn flat round icon="fab fa-github" size="lg" @click="openExternal(github)">
            <q-tooltip>GitHub</q-tooltip>
          </q-btn>
          <q-btn flat round icon="fab fa-youtube" size="lg" color="negative" @click="openExternal(youtube)">
            <q-tooltip>Youtube</q-tooltip>
          </q-btn>
          <q-btn flat round size="lg" color="positive" @click="openExternal(projectWebsite)">
            <q-avatar size="lg"><img src="../assets/f4h-512x512.png" alt="FAIR4Health Website" /></q-avatar>
            <q-tooltip>FAIR4Health Website</q-tooltip>
          </q-btn>
        </q-card-section>
        <q-card-section class="text-center text-grey-6 q-pt-xl">
          {{ acknowledgement }}
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { shell } from 'electron'

  @Component
  export default class About extends Vue {
    private description: string = 'The Data Curation Tool is a standalone, desktop application developed by the ' +
      'FAIR4Health project. The tool is used to connect the health data sources which can be in various formats ' +
      '(Excel files, CSV files, SQL databases) and migrate data into a HL7 FHIR Repository. The tool shows the ' +
      'available FHIR profiles to the user so that he/she can perform mappings appropriately. The tool can also ' +
      'contact a Terminology Server (which is actually another HL7 FHIR Repository) so that data fields can be ' +
      'annotated if coding schemes are in use.'
    private github: string = 'https://github.com/fair4health/data-curation-tool'
    private youtube: string = 'https://www.youtube.com/channel/UCpycUIqaXMAJCZPatqcm4cg'
    private projectWebsite: string = 'https://www.fair4health.eu/'
    private acknowledgement: string = 'This research has received funding from the European Union’s Horizon 2020 ' +
      'research and innovation programme under grant agreement No 824666 (Improving Health Research in EU through FAIR Data).'

    openExternal (url: string) { shell.openExternal(url) }
  }

</script>
