<template>
  <q-card flat class="col-xs-12 col-sm-12 col-md-6">
    <q-card-section>
      <q-item-label class="text-weight-bold q-mb-lg text-primary text-h6">
        {{ $t('LABELS.ADD_TERMINOLOGY_SERVICE') }}
      </q-item-label>
      <q-input outlined dense type="url" class="col-10" v-model.lazy.trim="terminologyBaseUrl" color="primary"
               @input="tBaseVerificationStatus = Status.PENDING"
               :placeholder="$t('LABELS.TERMINOLOGY_SERVICE_URL')"
               :disable="isInProgress(tBaseVerificationStatus)"
               @keypress.enter="verifyTerminology"
      />
      <q-item-label class="text-weight-regular bg-red-1 q-mt-md q-pa-md" v-if="isError(tBaseVerificationStatus) && tBaseVerificationStatusDetail">
        <span class="text-red"><q-icon name="error" size="xs" class="q-mr-xs" /> {{ tBaseVerificationStatusDetail }} </span>
      </q-item-label>
      <q-item-label class="text-weight-regular bg-green-1 q-mt-md q-pa-md" v-if="isSuccess(tBaseVerificationStatus) && tBaseVerificationStatusDetail">
        <span class="text-green-8"><q-icon name="check" size="xs" class="q-mr-xs" /> {{ tBaseVerificationStatusDetail }} </span>
      </q-item-label>
    </q-card-section>

    <q-card-section class="row">
      <q-space />
      <div class="q-gutter-sm">
        <q-btn :label="$t('BUTTONS.VERIFY_AND_SAVE')" icon="verified_user" color="positive"
               :disable="!terminologyBaseUrl || isInProgress(tBaseVerificationStatus)" @click="verifyTerminology" no-caps>
              <span class="q-ml-sm">
                <q-spinner class="q-ml-sm" size="xs" v-show="isInProgress(tBaseVerificationStatus)" />
                <q-icon name="check" size="xs" v-show="isSuccess(tBaseVerificationStatus)" />
              </span>
        </q-btn>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
  import { Component, Mixins } from 'vue-property-decorator'
  import StatusMixin from '@/common/mixins/statusMixin'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import Status from '@/common/Status'
  import { IpcChannelUtil as ipcChannels } from '@/common/utils/ipc-channel-util'
  import { ipcRenderer } from 'electron'
  import {FHIRUtil} from '@/common/utils/fhir-util'

  @Component
  export default class TerminologyConfig extends Mixins(StatusMixin) {
    private terminologyBaseUrl: string = ''
    private Status = Status

    get tBaseVerificationStatus (): status { return this.$store.getters[types.Terminology.T_BASE_VERIFICATION_STATUS] }
    set tBaseVerificationStatus (value) { this.$store.commit(types.Terminology.SET_T_BASE_VERIFICATION_STATUS, value) }

    get tBaseVerificationStatusDetail (): string { return this.$store.getters[types.Terminology.T_BASE_VERIFICATION_STATUS_DETAIL] }
    set tBaseVerificationStatusDetail (value) { this.$store.commit(types.Terminology.SET_T_BASE_VERIFICATION_STATUS_DETAIL, value) }

    mounted () {
      this.terminologyBaseUrl = localStorage.getItem('terminologyBaseUrl') || ''
    }

    verifyTerminology () {
      if (this.terminologyBaseUrl) {
        this.terminologyBaseUrl = FHIRUtil.trimUrl(this.terminologyBaseUrl)
        this.tBaseVerificationStatus = Status.IN_PROGRESS
        this.$store.dispatch(types.Terminology.VERIFY_TERMINOLOGY, this.terminologyBaseUrl)
          .then(() => {
            this.tBaseVerificationStatusDetail = String(this.$t('SUCCESS.TERMINOLOGY_URL_VERIFIED'))
            this.tBaseVerificationStatus = Status.SUCCESS
            ipcRenderer.send(ipcChannels.TO_ALL_BACKGROUND, ipcChannels.Terminology.SET_TERMINOLOGY_BASE_URL, this.terminologyBaseUrl)
          })
          .catch(err => {
            this.tBaseVerificationStatusDetail = err
            this.tBaseVerificationStatus = Status.ERROR
          })
      }
    }
  }
</script>
