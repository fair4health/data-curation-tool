<template>
  <q-menu square :anchor="anchorPosition" :self="selfPosition" :offset="offset">
    <q-list dense class="menu-list q-my-xs">
      <template v-for="menuItem in menu">
        <q-item clickable dense class="no-padding" v-close-popup="!!menuItem.action" v-on="menuItem.action ? {click: menuItem.action} : {}">
          <q-item-section class="row">
            <span>
              <q-icon :name="menuItem.icon" class="q-mx-md" />
              <span class="text-size-lg">{{ menuItem.label }}</span>
            </span>
          </q-item-section>
          <q-item-section side class="q-ml-md">
            <q-icon v-if="menuItem.afterIcon" size="xs" :name="menuItem.afterIcon" />
            <q-icon v-if="menuItem.submenu && menuItem.submenu.length" size="xs" name="keyboard_arrow_right" />
          </q-item-section>
          <menu-tree :menu="menuItem.submenu" anchorPosition="top right" selfPosition="top left" />
        </q-item>
        <q-separator v-if="menuItem.separate" />
      </template>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator'

  @Component
  export default class MenuTree extends Vue {
    @Prop({required: true}) menu: MenuItem[]
    @Prop() offset: number[]
    @Prop() anchorPosition: string
    @Prop() selfPosition: string
  }
</script>
