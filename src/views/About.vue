<template>
  <Message msg="This is an about page"/>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator'

  @Component({
    components: {
      Message: () => import('@/components/Message.vue')
    }
  })

  export default class About extends Vue {
  }
</script>
