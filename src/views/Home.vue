<template>
  <div>
    <!--HEADER & QUICK START-->
    <div class="top-fix-column">
      <q-toolbar class="bg-grey-4">
        <q-toolbar-title class="text-grey-8">
          {{ $t('LABELS.WELCOME_TO') }} <span class="text-primary text-weight-bold">{{ $t('COMMON.APP_NAME') }}</span>
        </q-toolbar-title>
        <q-space />
        <q-btn unelevated rounded to="/curation" color="primary" :label="$t('BUTTONS.QUICK_START')" icon-right="fas fa-angle-right" />
      </q-toolbar>
      <q-separator />
    </div>

    <!--OVERALL STEPS-->
    <q-item class="q-pa-lg text-weight-bold text-grey-8">
      <q-item-section>
        <q-item-label class="text-h4 text-weight-bold">{{ $t('LABELS.OVERALL_STEPS') }}</q-item-label>
        <q-stepper flat v-model="currStep" ref="stepper" alternative-labels color="primary" class="bg-grey-3">
          <q-step v-for="(step, index) in stepDescriptions" :key="index"
                  :name="index+1" :title="step.title" :icon="step.icon" />
        </q-stepper>
      </q-item-section>
    </q-item>

    <!--Curation Step Descriptions-->
    <q-item v-for="(step, index) in stepDescriptions" :key="index" class="q-pa-lg text-grey-8">
      <q-item-section>
        <q-item-label class="text-h7 text-weight-bold text-grey-8">
          <q-icon :name="step.icon" /> {{ step.title }}
        </q-item-label>
        <q-card flat class="q-ma-md">
          <q-card-section>
            {{ step.description }}
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
    private currStep: number = 0

    get stepDescriptions (): Array<{title: string, description: string, icon: string}> {
      return [
        {
          title: String(this.$t('COMMON.VERIFY_FHIR_REPO')),
          description: String(this.$t('INFO.FHIR_REPO_VERIFICATION_INFO')),
          icon: 'fas fa-fire'
        },
        {
          title: String(this.$t('COMMON.ANALYZE_DATA_SOURCE')),
          description: String(this.$t('INFO.DATA_SOURCE_ANALYZER_INFO')),
          icon: 'fas fa-database'
        },
        {
          title: String(this.$t('COMMON.MAP_METADATA')),
          description: String(this.$t('INFO.METADATA_MAPPER_INFO')),
          icon: 'fas fa-list-ul'
        },
        {
          title: String(this.$t('COMMON.VALIDATE')),
          description: String(this.$t('INFO.VALIDATOR_INFO')),
          icon: 'fas fa-check-circle'
        },
        {
          title: String(this.$t('COMMON.TRANSFORM')),
          description: String(this.$t('INFO.TRANSFORMER_INFO')),
          icon: 'fas fa-exchange-alt'
        }
      ]
    }
  }

</script>
