<template>
  <q-layout view="hHh Lpr lFf" class="bg-grey-3">
    <q-header elevated>
      <TitleBar />
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
      :width="240"
      :mini-width="75"
      :breakpoint="500"
      :mini="$q.screen.lt.lg || drawerMiniState"
    >
      <q-list class="drawer-list text-secondary">
        <q-item to="/" exact active-class="text-primary bg-grey-3">
          <q-item-section avatar class="items-center">
            <q-icon name="home" />
            <span v-show="$q.screen.lt.lg || drawerMiniState" class="text-size-xs">Home</span>
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/curation" exact active-class="text-primary bg-grey-3">
          <q-item-section avatar class="items-center">
            <q-icon name="device_hub" />
            <span v-show="$q.screen.lt.lg || drawerMiniState" class="text-size-xs">Curation</span>
          </q-item-section>
          <q-item-section>
            <q-item-label>Curation</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="$route.name==='curation'" animation>
          <q-stepper flat vertical :contracted="isCollapsed" v-model="currentStep"
                     ref="stepper" alternative-labels color="primary" class="bg-grey-3 no-padding"
                     v-bind:class="{'collapsed-stepper': isCollapsed}">
            <q-step v-for="step in steps" :key="step.stepId"
                    :class="{'step-item cursor-pointer': currentStep > step.stepId}"
                    @click="changeStep(step.stepId)"
                    :name="step.stepId"
                    :title="step.title"
                    :icon="step.icon"
                    :done-icon="step.icon"
                    :done="currentStep > step.stepId"
                    active-color="primary"
                    done-color="secondary"
            />
          </q-stepper>
        </q-item>
        <q-separator />
        <q-item to="/about" exact active-class="text-primary bg-grey-3">
          <q-item-section avatar class="items-center">
            <q-icon name="info" />
            <span v-show="$q.screen.lt.lg || drawerMiniState" class="text-size-xs">About</span>
          </q-item-section>
          <q-item-section>
            <q-item-label>About</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-list class="fixed-bottom">
        <q-separator />
        <q-item clickable @click="openExternal(projectHomePage)">
          <q-item-section avatar>
            <q-avatar size="sm">
              <img src="../assets/github-logo.png" />
            </q-avatar>
          </q-item-section>
          <q-item-section class="text-grey-7">
            <span>View on <span class="text-weight-bold">GitHub</span></span>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!--Router view in page container-->
    <q-page-container class="main-page">
      <q-page class="full-height">
        <div class="fill-window overflow-auto">
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { shell } from 'electron'
  import TitleBar from '@/layouts/TitleBar.vue'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'

  @Component({
    components: { TitleBar }
  })
  export default class MainLayout extends Vue {
    private steps: StepItem[] = [
      { title: 'Verify FHIR Repo', icon: 'fas fa-fire', stepId: 1 },
      { title: 'Analyze Data Source', icon: 'fas fa-database', stepId: 2 },
      { title: 'Map Metadata', icon: 'fas fa-list-ul', stepId: 3 },
      { title: 'Validate', icon: 'fas fa-check-circle', stepId: 4 },
      { title: 'Confirm and Transform', icon: 'fas fa-exchange-alt', stepId: 5 },
    ]

    get drawerOpen (): boolean { return this.$store.getters[types.DRAWER_OPEN] }
    set drawerOpen (value) { this.$store.commit(types.SET_DRAWER_OPEN, value) }

    get drawerMiniState (): boolean { return this.$store.getters[types.DRAWER_MINI_STATE] }
    set drawerMiniState (value) { this.$store.commit(types.SET_DRAWER_MINI_STATE, value) }

    get currentStep (): number { return this.$store.getters[types.CURATION_STEP] }
    set currentStep (value) { this.$store.commit(types.SET_STEP, value) }

    get isCollapsed () { return (this.$q.screen.gt.xs && (this.$q.screen.lt.lg || this.drawerMiniState)) }
    get projectHomePage (): string { return window.process.env.ELECTRON_WEBPACK_APP_F4H_HOMEPAGE }

    changeStep (newStep: number) {
      if (this.currentStep > newStep) {
        const message = `<span class="text-weight-bold text-grey-9 text-size-xxl">The changes you have made will be lost.</span> <br><br>` +
          `Are you sure you want to go to ` +
          `<span class="text-weight-bold text-primary">${this.steps[newStep - 1].title}</span> step?`
        this.$q.dialog({
          title: '<span class="text-primary"><i class="fas fa-info-circle q-pr-sm"></i>Previous Step</span>',
          message,
          cancel: true,
          html: true
        }).onOk(() => {
          if (newStep < 3) this.$store.dispatch(types.File.DESTROY_STORE)
          this.$store.commit(types.SET_STEP, newStep)
        })
      }
    }

    openExternal (url: string) { shell.openExternal(url) }
  }
</script>

<style lang="stylus" scoped>
  .main-page
    margin-left auto
    margin-right auto
  .drawer-list .q-item.q-router-link--exact-active
    border-left solid 4px #526EB2
  .drawer-list .q-item
    border-radius 0 32px 32px 0
  .step-item:hover
    background #e5e5e5
  .fill-window
    height calc(100vh - 68.44px)
  .collapsed-stepper
    width 70px
</style>
