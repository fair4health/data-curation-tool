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
    <div class="bg-grey-10 q-pa-sm q-pl-md row items-center">
      <div class="cursor-pointer non-selectable">
        File
        <q-menu>
          <q-list dense style="min-width: 150px">
            <q-item clickable v-close-popup @click="closeApp">
              <q-item-section>Close</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <div class="q-ml-md cursor-pointer non-selectable">
        View
        <q-menu auto-close>
          <q-list dense style="min-width: 150px">
            <q-item clickable @click="toggleFullScreen">
              <q-item-section>Toggle Full Screen</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <div class="q-ml-md cursor-pointer non-selectable">
        Tool
        <q-menu auto-close>
          <q-list dense style="min-width: 150px">
            <q-item clickable @click="toggleDevTools">
              <q-item-section>Toggle Developer Tools</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <div class="q-ml-md cursor-pointer non-selectable">
        Help
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { remote } from 'electron'

  @Component
  export default class TitleBar extends Vue {
    private currentWindow = remote.getCurrentWindow()
    private isMaximized = this.currentWindow.isMaximized()

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
  }
</script>

<style scoped>

</style>
