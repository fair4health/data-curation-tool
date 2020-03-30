<template>
  <div class="q-py-xl">
    <div class="row justify-center">
      <q-card flat class="col-6">
        <q-card-section>
          <q-item-label class="text-weight-bold q-mb-lg">
            <span class="text-primary"><q-icon name="fas fa-info" size="xs" class="q-mr-xs" /> Provide FHIR Repository URL </span>
          </q-item-label>
          <q-input outlined square dense type="url" class="col-10" v-model="onfhirBaseUrl" color="primary"
                   @keydown="fhirBaseVerificationStatus='pending'"
                   placeholder="FHIR Repository URL"
                   :disable="fhirBaseVerificationStatus === 'in-progress'"
                   @keypress.enter="verifyFhir"
          >
            <template v-slot:prepend>
              <q-avatar>
                <img src="../assets/fhir-logo.png" />
              </q-avatar>
            </template>
          </q-input>
          <q-item-label class="text-weight-regular bg-red-1 q-mt-md q-pa-md" v-if="fhirBaseVerificationStatus === 'error' && statusDetail">
            <span class="text-red"><q-icon name="error" size="xs" class="q-mr-xs" /> {{ statusDetail }} </span>
          </q-item-label>
          <q-item-label class="text-weight-regular bg-green-1 q-mt-md q-pa-md" v-if="fhirBaseVerificationStatus === 'success' && statusDetail">
            <span class="text-green-8"><q-icon name="check" size="xs" class="q-mr-xs" /> {{ statusDetail }} </span>
          </q-item-label>
        </q-card-section>

        <q-card-section class="row">
          <q-space />
          <div class="q-gutter-sm">
            <q-btn unelevated label="Verify" icon="verified_user" color="blue-1" text-color="primary"
                   :disable="!onfhirBaseUrl" @click="verifyFhir" no-caps>
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
    private statusDetail: string = ''

    get fhirBaseVerificationStatus (): status { return this.$store.getters['fhir/fhirBaseVerificationStatus'] }
    set fhirBaseVerificationStatus (value) { this.$store.commit('fhir/setFhirBaseVerificationStatus', value) }

    mounted () {
      const url = localStorage.getItem('fhirBaseUrl')
      if (url) {
        this.onfhirBaseUrl = url
      }
    }

    verifyFhir () {
      if (this.onfhirBaseUrl) {
        this.fhirBaseVerificationStatus = 'in-progress'
        this.$store.commit('fhir/updateFhirBase', this.onfhirBaseUrl)
        this.$store.dispatch('fhir/verifyFhir')
          .then(() => {
            this.statusDetail = 'FHIR Repository URL is verified.'
            this.fhirBaseVerificationStatus = 'success'
          })
          .catch(err => {
            this.statusDetail = err
            this.fhirBaseVerificationStatus = 'error'
          })
      }
    }
  }
</script>
