<template>
  <div>
    <!--HEADER & QUICK START-->
    <div class="top-fix-column">
      <q-toolbar class="bg-grey-4">
        <q-toolbar-title class="text-grey-8">
          Welcome to <span class="text-primary text-weight-bold">FAIR4Health Data Curation Tool</span>
        </q-toolbar-title>
        <q-space />
        <q-btn unelevated rounded to="/curation" color="primary" label="Quick Start" icon-right="fas fa-angle-right" />
      </q-toolbar>
      <q-separator />
    </div>

    <!--OVERALL STEPS-->
    <q-item class="q-pa-lg text-weight-bold text-grey-8">
      <q-item-section>
        <q-item-label class="text-h4 text-weight-bold">Overall Steps</q-item-label>
        <q-stepper flat v-model="step" ref="stepper" alternative-labels color="primary" class="bg-grey-3">
          <q-step :name="1" title="Analyze Data Source" icon="fas fa-database" />
          <q-step :name="2" title="Map Metadata" icon="fas fa-list-ul" />
          <q-step :name="3" title="Validate" icon="fas fa-check-circle" />
          <q-step :name="4" title="Transform" icon="fas fa-exchange-alt" />
        </q-stepper>
      </q-item-section>
    </q-item>

    <!--Analyze Data Source-->
    <q-item class="q-pa-lg text-weight-bold text-grey-8">
      <q-item-section>
        <q-item-label class="text-h7 text-grey-8">
          <q-icon name="fas fa-database" /> Analyze Data Source
        </q-item-label>
        <q-card flat class="q-ma-md">
          <q-card-section>
            Text
          </q-card-section>
        </q-card>
      </q-item-section>
    </q-item>

    <!--Map Metadata-->
    <q-item class="q-pa-lg text-weight-bold text-grey-8">
      <q-item-section>
        <q-item-label class="text-h7 text-grey-8">
          <q-icon name="fas fa-list-ul" /> Map Metadata
        </q-item-label>
        <q-card flat class="q-ma-md">
          <q-card-section>
            Text
          </q-card-section>
        </q-card>
      </q-item-section>
    </q-item>

    <!--Validate-->
    <q-item class="q-pa-lg text-weight-bold text-grey-8">
      <q-item-section>
        <q-item-label class="text-h7 text-grey-8">
          <q-icon name="fas fa-check-circle" /> Validate
        </q-item-label>
        <q-card flat class="q-ma-md">
          <q-card-section>
            Text
          </q-card-section>
        </q-card>
      </q-item-section>
    </q-item>

    <!--Transform-->
    <q-item class="q-pa-lg text-weight-bold text-grey-8">
      <q-item-section>
        <q-item-label class="text-h7 text-grey-8">
          <q-icon name="fas fa-exchange-alt" /> Transform
        </q-item-label>
        <q-card flat class="q-ma-md">
          <q-card-section>
            Text
          </q-card-section>
        </q-card>
      </q-item-section>
    </q-item>

  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component
  export default class Home extends Vue {
    private step: number = 0;
  }

</script>
