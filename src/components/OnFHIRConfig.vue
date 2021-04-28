<template>
  <div class="q-py-xl">
    <div class="row justify-center q-mx-lg">
      <q-card flat class="col-xs-12 col-sm-12 col-md-6">
        <q-card-section>
          <q-item-label class="text-weight-bold q-mb-lg">
            <span class="text-primary"><q-icon name="fas fa-info" size="xs" class="q-mr-xs" /> {{ $t('LABELS.PROVIDE_FHIR_URL') }} </span>
          </q-item-label>
          <q-input outlined square dense type="url" class="col-10" v-model.lazy.trim="onfhirBaseUrl" color="primary"
                   @input="fhirBaseVerificationStatus = Status.PENDING"
                   :placeholder="$t('LABELS.FHIR_REPOSITORY_URL')"
                   :disable="isInProgress(fhirBaseVerificationStatus)"
                   @keypress.enter="verifyFhir"
          >
            <template v-slot:prepend>
              <q-avatar>
                <img src="../assets/fhir-logo.png" />
              </q-avatar>
            </template>
          </q-input>
          <q-item-label class="text-weight-regular bg-red-1 q-mt-md q-pa-md" v-if="isError(fhirBaseVerificationStatus) && fhirBaseVerificationStatusDetail">
            <span class="text-red"><q-icon name="error" size="xs" class="q-mr-xs" /> {{ fhirBaseVerificationStatusDetail }} </span>
          </q-item-label>
          <q-item-label class="text-weight-regular bg-green-1 q-mt-md q-pa-md" v-if="isSuccess(fhirBaseVerificationStatus) && fhirBaseVerificationStatusDetail">
            <span class="text-green-8"><q-icon name="check" size="xs" class="q-mr-xs" /> {{ fhirBaseVerificationStatusDetail }} </span>
          </q-item-label>
        </q-card-section>

        <q-card-section class="row">
          <q-space />
          <div class="q-gutter-sm">
            <q-btn unelevated :label="$t('BUTTONS.VERIFY')" icon="verified_user" color="grey-2" text-color="primary"
                   :disable="!onfhirBaseUrl || isInProgress(fhirBaseVerificationStatus)" @click="verifyFhir" no-caps>
              <span class="q-ml-sm">
                <q-spinner class="q-ml-sm" size="xs" v-show="isInProgress(fhirBaseVerificationStatus)" />
                <q-icon name="check" size="xs" color="positive" v-show="isSuccess(fhirBaseVerificationStatus)" />
                <q-icon name="error_outline" size="xs" color="negative" v-show="isError(fhirBaseVerificationStatus)" />
              </span>
            </q-btn>
            <q-btn unelevated :label="$t('BUTTONS.NEXT')" icon-right="chevron_right" color="primary" :disable="!isSuccess(fhirBaseVerificationStatus)"
                   @click="nextStep" no-caps />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-if="!terminologyOpen" class="row justify-center q-mx-lg q-mt-lg">
      <div class="self-end">
        <q-btn :label="$t('BUTTONS.ADD_TERMINOLOGY_SERVICE')" color="primary" class="q-pa-sm no-border-radius" icon="add"
               @click="terminologyOpen = true" no-caps />
      </div>
    </div>
    <div v-if="terminologyOpen" class="row justify-center q-mx-lg q-mt-lg">
      <terminology-config />
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Mixins } from 'vue-property-decorator'
  import { ipcRenderer } from 'electron'
  import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import Status from '@/common/Status'
  import StatusMixin from '@/common/mixins/statusMixin'
  import Loading from '@/components/Loading.vue'
  import {FHIRUtil} from '@/common/utils/fhir-util'

  @Component({
    components: {
      TerminologyConfig: () => ({
        component: import('@/components/TerminologyConfig.vue'),
        loading: Loading,
        delay: 0
      })
    } as any
  })
  export default class OnFHIRConfig extends Mixins(StatusMixin) {
    private onfhirBaseUrl: string = ''
    private Status = Status
    private terminologyOpen: boolean = false

    get fhirBaseVerificationStatus (): status { return this.$store.getters[types.Fhir.FHIR_BASE_VERIFICATION_STATUS] }
    set fhirBaseVerificationStatus (value) { this.$store.commit(types.Fhir.SET_FHIR_BASE_VERIFICATION_STATUS, value) }

    get fhirBaseVerificationStatusDetail (): string { return this.$store.getters[types.Fhir.FHIR_BASE_VERIFICATION_STATUS_DETAIL] }
    set fhirBaseVerificationStatusDetail (value) { this.$store.commit(types.Fhir.SET_FHIR_BASE_VERIFICATION_STATUS_DETAIL, value) }

    get tBaseVerificationStatus (): status { return this.$store.getters[types.Terminology.T_BASE_VERIFICATION_STATUS] }

    mounted () {
      this.onfhirBaseUrl = localStorage.getItem('fhirBaseUrl') || ''
      if (this.isSuccess(this.tBaseVerificationStatus)) {
        this.terminologyOpen = true
      }
    }

    verifyFhir () {
      if (this.onfhirBaseUrl) {
        this.onfhirBaseUrl = FHIRUtil.trimUrl(this.onfhirBaseUrl)
        this.fhirBaseVerificationStatus = Status.IN_PROGRESS
        this.$store.dispatch(types.Fhir.VERIFY_FHIR, this.onfhirBaseUrl)
          .then(() => {
            this.fhirBaseVerificationStatusDetail = String(this.$t('SUCCESS.FHIR_URL_VERIFIED'))
            this.fhirBaseVerificationStatus = Status.SUCCESS
            ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.Fhir.SET_FHIR_BASE, this.onfhirBaseUrl)
          })
          .catch(err => {
            this.fhirBaseVerificationStatusDetail = err
            this.fhirBaseVerificationStatus = Status.ERROR
          })
      }
    }

    nextStep () {
      this.$store.commit(types.INCREMENT_STEP)
    }
  }
</script>
