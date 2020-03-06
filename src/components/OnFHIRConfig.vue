<template>
  <div class="q-mt-xl">
    <div class="row justify-center">
      <q-card flat class="col-6">
        <q-card-section>
          <q-item-label class="text-weight-bold q-mb-lg">
            <span class="text-info"><q-icon name="fas fa-info" size="xs" class="q-mr-xs" /> Provide FHIR repository URL. </span>
          </q-item-label>
          <q-input outlined square dense type="url" class="col-10" v-model="onfhirBaseUrl" color="primary"
                   @keydown="fhirBaseVerificationStatus='pending'">
            <template v-slot:append>
              <q-avatar square>
                <img src="../assets/fhir-logo.png" />
              </q-avatar>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="row">
          <q-space />
          <div class="q-gutter-sm">
            <q-btn unelevated label="Verify" icon="verified_user" color="blue-1" text-color="primary"
                   :disable="!onfhirBaseUrl" @click="validateFhir" no-caps>
              <span class="q-ml-sm">
                <q-spinner class="q-ml-sm" size="xs" v-show="fhirBaseVerificationStatus==='in-progress'" />
                <q-icon name="check" size="xs" color="green" v-show="fhirBaseVerificationStatus==='success'" />
                <q-icon name="error_outline" size="xs" color="red" v-show="fhirBaseVerificationStatus==='error'" />
              </span>
            </q-btn>
            <q-btn unelevated label="Next" icon-right="chevron_right" color="primary" :disable="fhirBaseVerificationStatus!=='success'"
                   @click="$store.commit('incrementStep')" no-caps />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component
  export default class OnFHIRConfig extends Vue {
    private onfhirBaseUrl: string = ''

    get fhirBaseVerificationStatus (): status { return this.$store.getters['fhir/fhirBaseVerificationStatus'] }
    set fhirBaseVerificationStatus (value) { this.$store.commit('fhir/setFhirBaseVerificationStatus', value) }

    mounted () {
      const url = localStorage.getItem('fhirBaseUrl')
      if (url) {
        this.onfhirBaseUrl = url
      }
    }

    validateFhir () {
      if (this.onfhirBaseUrl) {
        this.fhirBaseVerificationStatus = 'in-progress'
        this.$store.commit('fhir/updateFhirBase', this.onfhirBaseUrl)
        this.$store.dispatch('fhir/searchResource', 'metadata')
          .then(() => this.fhirBaseVerificationStatus = 'success')
          .catch(() => this.fhirBaseVerificationStatus = 'error')
      }
    }
  }
</script>
