<template>
  <div class="q-mt-xs q-mx-sm q-mb-md text-caption" v-html="highlight(logger, searchKey)" />
</template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator'

  @Component
  export default class Logger extends Vue {
    @Prop({default: ''}) searchKey: string = ''

    get logger (): string { return this.$store.getters.log }

    highlight (text: string, search: string): string {
      let count = 0
      if (!search) {
        return text
      }
      search = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
      const regex = new RegExp(`(${search})(?!([^<]+)?>)`, 'gi')
      const filtered = text.replace(regex, match => {
        count += 1
        return '<span style="background:#9CC3F6">' + match + '</span>'
      })
      this.$emit('input', count)
      return filtered
    }
  }
</script>
