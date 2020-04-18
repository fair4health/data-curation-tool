<template>
  <div>
    <q-bar class="bg-black text-weight-light text-white q-electron-drag q-pr-none">
      <q-btn flat dense round aria-label="Menu" icon="menu"
             @click="$q.screen.lt.lg || !drawerOpen ? (drawerOpen = !drawerOpen) : (drawerMiniState = !drawerMiniState)"
      />
      <img class="flex flex-center" src="../assets/FAIR4Health-logo.png" width="80px">
      <div class="text-weight-bold" style="font-size: 14px">Data Curation Tool</div>
      <q-space />
      <div class="q-mx-none q-px-none">
        <q-btn flat square icon="remove" class="title-bar-btn" @click="minimizeApp" />
        <q-btn flat :icon="isMaximized ? 'mdi-window-restore' : 'mdi-crop-square'" class="title-bar-btn" @click="toggleFullScreen" />
        <q-btn flat icon="close" class="title-bar-btn btn-close" @click="closeApp" />
      </div>
    </q-bar>
    <div class="bg-grey-10 q-pa-sm q-pl-md row q-gutter-x-sm items-center">
      <div v-for="menuItem in menu" class="q-px-xs cursor-pointer non-selectable">
        {{ menuItem.label }}
        <menu-tree :menu="menuItem.submenu" :offset="[0, 8]" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { remote, shell } from 'electron'
  import MenuTree from '@/layouts/MenuTree.vue'

  @Component({
    components: {
      MenuTree
    }
  })
  export default class TitleBar extends Vue {
    private currentWindow = remote.getCurrentWindow()
    private isMaximized = this.currentWindow.isMaximized()
    private menu: MenuItem[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Exit',
            action: () => this.closeApp()
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Full Screen',
            action: () => this.toggleFullScreen()
          }
        ]
      },
      {
        label: 'Tool',
        submenu: [
          {
            label: 'Toggle Developer Tools',
            action: () => this.toggleDevTools()
          }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Help',
            icon: 'fas fa-question',
            action: () => this.openExternal(this.projectHomePage)
          }
        ]
      }
    ]

    get projectHomePage (): string { return window.process.env.ELECTRON_WEBPACK_APP_F4H_HOMEPAGE }

    get drawerOpen (): boolean { return this.$store.getters.drawerOpen }
    set drawerOpen (value) { this.$store.commit('setDrawerOpen', value) }

    get drawerMiniState (): boolean { return this.$store.getters.drawerMiniState }
    set drawerMiniState (value) { this.$store.commit('setDrawerMiniState', value) }

    @Watch('$q.screen.height')
    onHeightChange () {
      this.isMaximized = this.currentWindow.isMaximized()
    }

    toggleFullScreen () {
      if (this.currentWindow.isMaximized()) this.currentWindow.unmaximize()
      else this.currentWindow.maximize()
    }
    minimizeApp () { this.currentWindow.minimize() }
    closeApp () { this.currentWindow.destroy() }
    toggleDevTools () { remote.getCurrentWebContents().toggleDevTools() }
    openExternal (url: string) { shell.openExternal(url) }
  }
</script>

<style scoped>

</style>
