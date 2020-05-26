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
        <q-stepper flat v-model="step" ref="stepper" alternative-labels color="primary" class="bg-grey-3">
          <q-step :name="1" :title="$t('COMMON.ANALYZE_DATA_SOURCE')" icon="fas fa-database" />
          <q-step :name="2" :title="$t('COMMON.MAP_METADATA')" icon="fas fa-list-ul" />
          <q-step :name="3" :title="$t('COMMON.VALIDATE')" icon="fas fa-check-circle" />
          <q-step :name="4" :title="$t('COMMON.TRANSFORM')" icon="fas fa-exchange-alt" />
        </q-stepper>
      </q-item-section>
    </q-item>

    <!--Analyze Data Source-->
    <q-item class="q-pa-lg text-weight-bold text-grey-8">
      <q-item-section>
        <q-item-label class="text-h7 text-grey-8">
          <q-icon name="fas fa-database" /> {{ $t('COMMON.ANALYZE_DATA_SOURCE') }}
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
          <q-icon name="fas fa-list-ul" /> {{ $t('COMMON.MAP_METADATA') }}
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
          <q-icon name="fas fa-check-circle" /> {{ $t('COMMON.VALIDATE') }}
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
          <q-icon name="fas fa-exchange-alt" /> {{ $t('COMMON.TRANSFORM') }}
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
    private step: number = 0
  }

</script>
