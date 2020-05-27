<template>
  <div>
    <q-bar class="bg-black text-weight-light text-white q-electron-drag q-pr-none">
      <q-btn flat dense round aria-label="Menu" icon="menu"
             @click="$q.screen.lt.lg || !drawerOpen ? (drawerOpen = !drawerOpen) : (drawerMiniState = !drawerMiniState)"
      />
      <img class="flex flex-center" src="../assets/FAIR4Health-logo.png" width="80px">
      <div class="text-weight-bold text-size-xl">{{ $t('COMMON.APP_NAME') }}</div>
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
      <q-space />
      <q-btn-dropdown dense
                      flat
                      :label="$i18n.locale"
                      :menu-offset="[0, 4]"
                      size="9px"
                      icon="language"
      >
        <q-list padding>
          <q-item dense
                  clickable
                  v-close-popup
                  v-for="lang in langs"
                  :key="lang"
                  class="flex flex-center"
                  @click="$i18n.locale = lang"
          >
            <span class="text-size-xs text-uppercase">{{ lang }}</span>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { remote, shell } from 'electron'
  import MenuTree from '@/layouts/MenuTree.vue'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import { environment } from '@/common/environment'

  @Component({
    components: {
      MenuTree
    }
  })
  export default class TitleBar extends Vue {
    private currentWindow = remote.getCurrentWindow()
    private isMaximized = this.currentWindow.isMaximized()
    private langs = environment.langs
    get menu (): MenuItem[] {
      return [
        {
          label: this.$tc('MENU.FILE'),
          submenu: [
            {
              label: this.$tc('MENU.EXIT'),
              action: () => this.closeApp()
            }
          ]
        },
        {
          label: this.$tc('MENU.VIEW'),
          submenu: [
            {
              label: this.$tc('MENU.TOGGLE_FULL_SCREEN'),
              action: () => this.toggleFullScreen()
            }
          ]
        },
        {
          label: this.$tc('MENU.TOOLS'),
          submenu: [
            {
              label: this.$tc('MENU.LANGUAGE'),
              icon: 'language',
              separate: true,
              submenu: [
                {
                  label: 'English',
                  icon: this.isLang('en') ? 'check' : '',
                  action: () => this.updateLang('en')
                }
              ]
            },
            {
              label: this.$tc('MENU.TOGGLE_DEVELOPER_TOOLS'),
              action: () => this.toggleDevTools()
            }
          ]
        },
        {
          label: this.$tc('MENU.HELP'),
          submenu: [
            {
              label: this.$tc('MENU.HELP'),
              icon: 'fas fa-question',
              action: () => this.openExternal(this.projectHomePage)
            }
          ]
        }
      ]
    }
    get projectHomePage (): string { return window.process.env.ELECTRON_WEBPACK_APP_F4H_HOMEPAGE }

    get drawerOpen (): boolean { return this.$store.getters[types.DRAWER_OPEN] }
    set drawerOpen (value) { this.$store.commit(types.SET_DRAWER_OPEN, value) }

    get drawerMiniState (): boolean { return this.$store.getters[types.DRAWER_MINI_STATE] }
    set drawerMiniState (value) { this.$store.commit(types.SET_DRAWER_MINI_STATE, value) }

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

    isLang (lang: string): boolean {
      return this.$i18n.locale === lang
    }

    updateLang (lang: string) {
      this.$i18n.locale = lang
    }
  }
</script>

<style lang="stylus" scoped>
  .title-bar-btn
    border-radius 0 0
  .btn-close:hover
    background red
</style>
