<template>
  <p>{{ msg }}</p>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Message extends Vue {
  @Prop() private msg!: string;
}
</script>
