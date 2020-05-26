<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="assigner-card">
      <q-card-section>
        <div class="text-h6">
          {{ $t('TITLES.ASSIGN_DEFAULT_VALUE') }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input outlined
                 dense
                 clearable
                 :label="$t('LABELS.VALUE')"
                 class="code-system-popup"
                 v-model="defaultValue"
                 @keypress.enter="onOKClick(defaultValue)"
        />
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn flat color="primary" :label="$t('BUTTONS.OK')" @click="onOKClick(defaultValue)" :disable="!defaultValue" />
        <q-btn flat color="primary" :label="$t('BUTTONS.CLOSE')" @click="onCloseClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { Component, Mixins, Prop } from 'vue-property-decorator'
  import ModalMixin from '@/common/mixins/modalMixin'

  @Component
  export default class DefaultValueAssigner extends Mixins(ModalMixin) {
    @Prop({required: true, default: ''}) defaultValueProp: any
    private defaultValue: string = ''

    mounted () {
      this.defaultValue = this.defaultValueProp
    }

  }
</script>

<style lang="stylus">
  .assigner-card
    min-width 600px !important
</style>
