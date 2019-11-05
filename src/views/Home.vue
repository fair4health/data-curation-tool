<template>
  <Message msg="Welcome"/>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator'

  @Component({
    components: {
      Message: () => import('@/components/Message.vue')
    }
  })
  export default class Home extends Vue {
  }

</script>
