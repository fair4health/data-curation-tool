import {ipcRenderer} from "electron"
<template>
  <q-card flat class="col-xs-12 col-sm-12 col-md-6 bg-grey-1">
    <q-card-section>
      <q-item-label class="text-weight-bold q-mb-lg">
        <span class="text-primary"><q-icon name="fas fa-info" size="xs" class="q-mr-xs" /> Provide Terminology Server URL </span>
      </q-item-label>
      <q-input outlined square dense type="url" class="col-10" v-model="terminologyBaseUrl" color="primary"
               @keydown="tBaseVerificationStatus = Status.PENDING"
               placeholder="Terminology Server URL"
               :disable="isInProgress(tBaseVerificationStatus)"
               @keypress.enter="verifyTerminology"
      >
        <template v-slot:prepend>
          <q-avatar>
            <img src="../assets/fhir-logo.png" />
          </q-avatar>
        </template>
      </q-input>
      <q-item-label class="text-weight-regular bg-red-1 q-mt-md q-pa-md" v-if="isError(tBaseVerificationStatus) && statusDetail">
        <span class="text-red"><q-icon name="error" size="xs" class="q-mr-xs" /> {{ statusDetail }} </span>
      </q-item-label>
      <q-item-label class="text-weight-regular bg-green-1 q-mt-md q-pa-md" v-if="isSuccess(tBaseVerificationStatus) && statusDetail">
        <span class="text-green-8"><q-icon name="check" size="xs" class="q-mr-xs" /> {{ statusDetail }} </span>
      </q-item-label>
    </q-card-section>

    <q-card-section class="row">
      <q-space />
      <div class="q-gutter-sm">
        <q-btn unelevated label="Verify" icon="verified_user" color="grey-2" text-color="primary"
               :disable="!terminologyBaseUrl || isInProgress(tBaseVerificationStatus)" @click="verifyTerminology" no-caps>
              <span class="q-ml-sm">
                <q-spinner class="q-ml-sm" size="xs" v-show="isInProgress(tBaseVerificationStatus)" />
                <q-icon name="check" size="xs" color="green" v-show="isSuccess(tBaseVerificationStatus)" />
                <q-icon name="error_outline" size="xs" color="red" v-show="isError(tBaseVerificationStatus)" />
              </span>
        </q-btn>
        <q-btn unelevated label="Save" color="positive" :disable="!isSuccess(tBaseVerificationStatus)"
                no-caps />
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
  import { Component, Mixins } from 'vue-property-decorator'
  import StatusMixin from '@/common/mixins/statusMixin'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import Status from '@/common/Status'

  @Component
  export default class TerminologyConfig extends Mixins(StatusMixin) {
    private terminologyBaseUrl: string = ''
    private statusDetail: string = ''
    private Status = Status

    get tBaseVerificationStatus (): status { return this.$store.getters[types.Terminology.T_BASE_VERIFICATION_STATUS] }
    set tBaseVerificationStatus (value) { this.$store.commit(types.Terminology.SET_T_BASE_VERIFICATION_STATUS, value) }

    mounted () {
      this.terminologyBaseUrl = localStorage.getItem('terminologyBaseUrl') || ''
    }

    verifyTerminology () {
      if (this.terminologyBaseUrl) {
        this.tBaseVerificationStatus = Status.IN_PROGRESS
        this.$store.dispatch(types.Terminology.VERIFY_TERMINOLOGY, this.terminologyBaseUrl)
          .then(() => {
            this.statusDetail = 'Terminology URL is verified.'
            this.tBaseVerificationStatus = Status.SUCCESS
          })
          .catch(err => {
            this.statusDetail = err
            this.tBaseVerificationStatus = Status.ERROR
          })
      }
    }
  }
</script>
