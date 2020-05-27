<template>
  <div>
    <q-toolbar class="bg-grey-4">
      <q-toolbar-title class="text-grey-8">
        {{ $t('TITLES.ABOUT') }}
      </q-toolbar-title>
    </q-toolbar>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component
  export default class About extends Vue {}

</script>
