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
                 class="code-system-popup"
                 v-model="author"
        >
          <template v-slot:prepend>
            <q-icon name="business" />
          </template>
        </q-input>
        <q-select outlined dense v-model="license" class="ellipsis" :options="licenseList" option-value="display"
                  option-label="display" :label="$t('LABELS.LICENSE')" menu-anchor="bottom middle" menu-self="top middle">
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
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn flat color="primary" :label="$t('BUTTONS.CLOSE')" @click="onCloseClick" />
        <q-btn unelevated color="primary" :label="$t('BUTTONS.OK')" @click="save" :disable="!(author && license)" />
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

    mounted () {
      const cached = localStorage.getItem('transform-request')
      if (cached) {
        const transformRequest: TransformRequest = JSON.parse(cached) as TransformRequest
        this.author = transformRequest.author
        this.license = transformRequest.license
      }
    }

    save () {
      const transformRequest: TransformRequest = {author: this.author, license: this.license}
      localStorage.setItem('transform-request', JSON.stringify(transformRequest))
      this.onOKClick(transformRequest)
    }
  }
</script>
