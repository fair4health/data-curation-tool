<template>
  <q-dialog ref="dialog">
    <q-card class="assigner-card">
      <q-card-section class="row items-center">
        <div class="text-h6">
          {{ $t('TITLES.ASSIGN_DEFAULT_VALUE') }}
        </div>
        <q-space />
        <div class="q-gutter-sm">
          <q-btn v-if="hasValue()"
                 unelevated
                 rounded
                 :label="$t('BUTTONS.REMOVE')"
                 icon="delete"
                 color="negative"
                 @click="removeValue"
                 no-caps
          />
          <q-btn flat round dense icon="close" @click="onCloseClick" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <code-system-select v-if="isCodeable"
                            :label="$t('LABELS.CODE_SYSTEM')"
                            v-model="defaultSystem"
                            :value="defaultSystem"
                            :edit="!isFixedUri"
        />
        <q-input outlined
                 dense
                 clearable
                 :label="$t('LABELS.VALUE')"
                 class="code-system-popup"
                 v-model.lazy.trim="defaultValue"
                 @keypress.enter="onOKClick({defaultValue, defaultSystem})"
        />
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn flat color="primary" :label="$t('BUTTONS.CLOSE')" @click="onCloseClick" />
        <q-btn unelevated color="primary" :label="hasValue() ? $t('BUTTONS.UPDATE') : $t('BUTTONS.OK')"
               @click="onOKClick({defaultValue, defaultSystem})" :disable="!isDisable()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { Component, Mixins, Prop } from 'vue-property-decorator'
  import ModalMixin from '@/common/mixins/modalMixin'
  import Loading from '@/components/Loading.vue'

  @Component({
    components: {
      Loading,
      CodeSystemSelect: () => ({
        component: import('@/components/CodeSystemSelect.vue'),
        loading: Loading,
        delay: 0
      })
    } as any
  })
  export default class DefaultValueAssigner extends Mixins(ModalMixin) {
    @Prop({required: true, default: undefined}) defaultValueProp: DefaultValueAssignerItem
    private defaultValue: string = ''
    private defaultSystem: string = ''
    private isCodeable: boolean = false
    private isFixedUri: boolean = false

    mounted () {
      this.defaultValue = this.defaultValueProp.defaultValue
      this.defaultSystem = this.defaultValueProp.defaultSystem
      this.isCodeable = this.defaultValueProp.isCodeable
      this.isFixedUri = this.defaultValueProp.isFixedUri
    }

    removeValue () {
      this.$emit('ok', '')
      this.onCloseClick()
    }

    isDisable () {
      return this.isCodeable ? this.defaultSystem && this.defaultValue : this.defaultValue
    }

    hasValue () {
      return this.defaultValueProp.isCodeable ? this.defaultValueProp.defaultSystem && this.defaultValueProp.defaultValue
        : this.defaultValueProp.defaultValue
    }

  }
</script>

<style lang="stylus">
  .assigner-card
    min-width 600px !important
</style>
