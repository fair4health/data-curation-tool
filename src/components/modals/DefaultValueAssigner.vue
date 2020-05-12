<template>
  <q-dialog ref="defaultValueAssigner" @hide="onDialogHide">
    <q-card class="assigner-card">
      <q-card-section>
        <div class="text-h6">
          Default Value Assignment
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input outlined
                 dense
                 clearable
                 label="Value"
                 class="code-system-popup"
                 v-model="defaultValue"
        />
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn flat color="primary" label="OK" @click="onOKClick" :disable="!defaultValue" />
        <q-btn flat color="primary" label="Close" @click="onCloseClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator'
  import { QDialog } from 'quasar'

  @Component
  export default class DefaultValueAssigner extends Vue {
    @Prop({required: true, default: ''}) defaultValueProp: any
    private defaultValue: string = ''

    mounted () {
      this.defaultValue = this.defaultValueProp
    }

    show () {
      (this.$refs.defaultValueAssigner as QDialog).show()
    }

    hide () {
      (this.$refs.defaultValueAssigner as QDialog).hide()
    }

    onDialogHide () {
      this.$emit('hide')
    }

    onOKClick () {
      this.$emit('ok', this.defaultValue)
      this.hide()
    }

    onCloseClick () {
      this.hide()
    }
  }
</script>

<style lang="stylus">
  .assigner-card
    min-width 600px !important
</style>
