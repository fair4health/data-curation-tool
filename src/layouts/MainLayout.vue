<template>
  <q-layout view="hHh Lpr lFf" class="bg-grey-3">
    <q-header elevated class="bg-grey-9">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="$q.screen.lt.lg ? (leftDrawerOpen = !leftDrawerOpen) : (miniState = !miniState)"
          aria-label="Menu"
          icon="menu"
        />
        <q-toolbar-title>
          <img class="flex flex-center" src="https://www.fair4health.eu/images/logo.png" width="120px">
        </q-toolbar-title>
        <q-btn
          flat
          dense
          round
          @click="$q.fullscreen.isActive ? $q.fullscreen.exit() : $q.fullscreen.request()"
          aria-label="Fullscreen"
          :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
      :width="240"
      :breakpoint="500"
      :mini="$q.screen.lt.lg || miniState"
    >
      <q-list>
        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
          <q-tooltip v-if="miniState" anchor="center right" self="center left" content-class="bg-grey-4 text-grey-9"
                     :offset="[5, 10]" transition-show="scale" transition-hide="scale">
            Home
          </q-tooltip>
        </q-item>
        <q-item to="/curation" exact>
          <q-item-section avatar>
            <q-icon name="device_hub" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Curation</q-item-label>
          </q-item-section>
          <q-tooltip v-if="miniState" anchor="center right" self="center left" content-class="bg-grey-4 text-grey-9"
                     :offset="[5, 10]" transition-show="scale" transition-hide="scale">
            Curation
          </q-tooltip>
        </q-item>
        <q-separator />
        <q-item to="/about" exact>
          <q-item-section avatar>
            <q-icon name="info" />
          </q-item-section>
          <q-item-section>
            <q-item-label>About</q-item-label>
          </q-item-section>
          <q-tooltip v-if="miniState" anchor="center right" self="center left" content-class="bg-grey-4 text-grey-9"
                     :offset="[5, 10]" transition-show="scale" transition-hide="scale">
            About
          </q-tooltip>
        </q-item>
      </q-list>
      <q-list v-if="($q.screen.gt.md && !miniState) || $q.screen.xs" padding class="text-grey-8 fixed-bottom">
        <q-separator />
        <q-item>
          <q-item-section>
            <span class="text-weight-bold flex flex-center text-caption">
              <span>Powered by </span>
              <img src="https://www.srdc.com.tr/wp-content/uploads/2014/12/srdc-wp.png" class="q-ml-sm" width="120px">
            </span>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!--Router view in page container-->
    <q-page-container class="main-page">
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  @Component
  export default class MainLayout extends Vue {
    private miniState: boolean = true;
    private leftDrawerOpen: boolean = false;
  }
</script>

<style lang="stylus">
  .main-page
    /*max-width 1400px*/
    margin-left auto
    margin-right auto
  .notify-opacity
    opacity 0.9
</style>
