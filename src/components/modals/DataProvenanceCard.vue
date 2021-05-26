<template>
  <q-dialog ref="dialog">
    <q-card class="assigner-card">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ $t('TITLES.AUTHOR_AND_LICENSE_INFO') }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="onCloseClick" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input outlined
                 dense
                 clearable
                 :label="$t('LABELS.AUTHOR')"
                 class="q-mb-md"
                 v-model="author"
        >
          <template v-slot:prepend>
            <q-icon name="business" />
          </template>
        </q-input>
        <q-select v-if="!isCustomLicense" outlined dense v-model="license" class="ellipsis q-mb-md"
                  :options="licenseList" option-value="display" option-label="display"
                  :label="$t('LABELS.LICENSE')" menu-anchor="bottom middle" menu-self="top middle">
          <template v-slot:prepend>
            <q-icon name="fas fa-id-card" size="xs" />
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
              <q-item-section avatar>
                <q-icon name="fas fa-id-card" size="xs" color="grey-8" />
              </q-item-section>
              <q-item-section class="q-table--col-auto-width">
                <q-item-label class="text-size-xl text-weight-bold text-grey-9">{{ scope.opt.display }}</q-item-label>
                <q-item-label class="text-caption text-primary">{{ scope.opt.uri }}</q-item-label>
                <q-item-label class="text-size-md">{{ scope.opt.description }}</q-item-label>
              </q-item-section>
              <q-separator />
            </q-item>
          </template>
        </q-select>
        <q-input v-if="isCustomLicense" outlined
                 dense
                 type="textarea"
                 :label="$t('LABELS.LICENSE')"
                 class="q-mb-md"
                 v-model="customLicenseDisplay"
        >
          <template v-slot:prepend>
            <q-icon name="fas fa-id-card" />
          </template>
        </q-input>
        <q-checkbox dense v-model="isCustomLicense" :label="$t('LABELS.ADD_CUSTOM_LICENSE')"></q-checkbox>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn flat color="primary" :label="$t('BUTTONS.CLOSE')" @click="onCloseClick" />
        <q-btn unelevated color="primary" :label="$t('BUTTONS.OK')" @click="save" :disable="!verifyLicense()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { Component, Mixins } from 'vue-property-decorator'
  import ModalMixin from '@/common/mixins/modalMixin'
  import { environment } from '@/common/environment'

  @Component
  export default class DataProvenanceCard extends Mixins(ModalMixin) {
    private author: string = ''
    private license: License = null
    private licenseList: License[] = environment.licenses
    private isCustomLicense: boolean = false
    private customLicenseDisplay: string = ''

    mounted () {
      const cached = localStorage.getItem('transform-request')
      const isCustom = localStorage.getItem('transform-request-is-custom')
      this.isCustomLicense = isCustom && isCustom.toLowerCase() === 'true' || false
      if (cached) {
        const transformRequest: TransformRequest = JSON.parse(cached) as TransformRequest
        this.author = transformRequest.author
        if (this.isCustomLicense) this.customLicenseDisplay = transformRequest.license.display
        else this.license = transformRequest.license
      }
    }

    save () {
      const transformRequest: TransformRequest = {author: this.author, license: this.license}
      if (this.isCustomLicense) {
        transformRequest.license = {display: this.customLicenseDisplay}
      }
      localStorage.setItem('transform-request-is-custom', String(this.isCustomLicense))
      localStorage.setItem('transform-request', JSON.stringify(transformRequest))
      this.onOKClick(transformRequest)
    }

    verifyLicense () {
      return this.author && ((!this.isCustomLicense && this.license && this.license.uri) || (this.isCustomLicense && this.customLicenseDisplay))
    }
  }
</script>
