<template>
  <q-layout view="hHh Lpr lFf" class="bg-grey-3">
    <q-header elevated class="bg-grey-9">
      <q-toolbar>
        <q-btn flat dense round aria-label="Menu" icon="menu"
               @click="$q.screen.lt.lg || !leftDrawerOpen ? (leftDrawerOpen = !leftDrawerOpen) : (miniState = !miniState)"
        />
        <q-toolbar-title>
          <img class="flex flex-center" src="../assets/FAIR4Health-logo.png" width="120px">
        </q-toolbar-title>
        <q-btn flat dense round aria-label="Fullscreen" :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
               @click="$q.fullscreen.isActive ? $q.fullscreen.exit() : $q.fullscreen.request()"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
      :width="240"
      :mini-width="75"
      :breakpoint="500"
      :mini="$q.screen.lt.lg || miniState"
    >
      <q-list class="menu-list">
        <q-item to="/" exact active-class="text-primary bg-blue-grey-1 text-weight-bold">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
          <q-tooltip v-if="isCollapsed" anchor="center right" self="center left" :offset="[5, 10]"
                     content-class="bg-white text-primary" transition-show="scale" transition-hide="scale">
            Home
          </q-tooltip>
        </q-item>
        <q-item to="/curation" exact active-class="text-primary bg-blue-grey-1 text-weight-bold">
          <q-item-section avatar>
            <q-icon name="device_hub" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Curation</q-item-label>
          </q-item-section>
          <q-tooltip v-if="isCollapsed" anchor="center right" self="center left" :offset="[5, 10]"
                     content-class="bg-white text-primary" transition-show="scale" transition-hide="scale">
            Curation
          </q-tooltip>
        </q-item>
        <q-item v-if="$route.name==='curation'" animation>
          <q-stepper flat vertical :contracted="isCollapsed" v-model="currentStep"
                     ref="stepper" alternative-labels color="primary" class="bg-grey-3"
                     :style="isCollapsed ? 'padding: 0; width: 70px' : ''">
            <q-step v-for="step in steps" :key="step.stepId"
                    :class="{'step-item cursor-pointer': currentStep > step.stepId}"
                    @click="changeStep(step.stepId)"
                    :name="step.stepId"
                    :title="step.title"
                    :icon="step.icon"
                    :done-icon="step.icon"
                    :done="currentStep > step.stepId"
                    active-color="grey-7"
                    done-color="primary"
            />
          </q-stepper>
        </q-item>
        <q-separator />
        <q-item to="/about" exact active-class="text-primary bg-blue-grey-1 text-weight-bold">
          <q-item-section avatar>
            <q-icon name="info" />
          </q-item-section>
          <q-item-section>
            <q-item-label>About</q-item-label>
          </q-item-section>
          <q-tooltip v-if="isCollapsed" anchor="center right" self="center left" :offset="[5, 10]"
                     content-class="bg-white text-primary" transition-show="scale" transition-hide="scale">
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
        <q-splitter
          v-model="splitterModel"
          horizontal
          :limits="limits"
          :style="style"
          after-class="bg-white logger-class"
        >

          <!--Router View-->
          <template v-slot:before>
            <router-view />
          </template>

          <!--Logger Component-->
          <template v-slot:after>
            <q-page-sticky expand position="top" style="position: sticky; transform: none">
              <q-toolbar class="bg-grey-4">
                <q-toolbar-title class="text-grey-8 text-subtitle1">
                  <q-icon name="fas fa-columns fa-sm" />
                  Console
                </q-toolbar-title>
                <q-space />
                <div class="row items-center q-gutter-xs">
                  <template v-if="splitterModel < limits[1]">
                    <div v-if="searchKey" class="text-caption">
                      {{ matchCount }} {{ matchCount > 1 ? ' matches' : ' match' }}
                    </div>
                    <q-input dense rounded standout="bg-grey-5" placeholder="Search..." v-model="searchKey"
                             class="q-ml-md" input-class="text-grey-9" @keydown.esc="searchKey = ''"
                    >
                      <template v-slot:append>
                        <q-icon v-if="searchKey === ''" name="search" color="grey-8" />
                        <q-icon v-else name="clear" color="grey-8" class="cursor-pointer" @click="searchKey = ''" />
                      </template>
                    </q-input>
                  </template>
                  <q-btn round flat dense color="grey-8"
                         :icon="splitterModel >= limits[1] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                         @click="splitterModel >= limits[1] ? splitterModel = 70 : splitterModel = limits[1]"
                  />
                </div>
              </q-toolbar>
            </q-page-sticky>
            <template v-if="splitterModel < limits[1]">
              <Logger v-model="matchCount" :searchKey="searchKey" />
            </template>
          </template>

        </q-splitter>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import Loading from '@/components/Loading.vue'

  @Component({
    components: {
      Logger: () => ({
        component: import('@/components/Logger.vue'),
        loading: Loading
      })
    } as any
  })
  export default class MainLayout extends Vue {
    private splitterModel: any = this.limits[1]
    private miniState: boolean = true
    private leftDrawerOpen: boolean = false
    private searchKey: string = ''
    private matchCount: number = 0
    private steps: StepItem[] = [
      { title: 'Verify FHIR Repo', icon: 'fas fa-fire', stepId: 1 },
      { title: 'Analyze Data Source', icon: 'fas fa-database', stepId: 2 },
      { title: 'Map Metadata', icon: 'fas fa-list-ul', stepId: 3 },
      { title: 'Validate', icon: 'fas fa-check-circle', stepId: 4 },
      { title: 'Confirm and Transform', icon: 'fas fa-exchange-alt', stepId: 5 },
    ]

    get currentStep (): number { return this.$store.getters.curationStep }
    set currentStep (value) { this.$store.commit('setStep', value) }

    get style () { return {height: this.$q.screen.height - 50 + 'px'} }
    get limits () { return [20, Math.floor(100 - (50.0 / (this.$q.screen.height - 50) * 100))] }
    get isCollapsed () { return (this.$q.screen.gt.xs && (this.$q.screen.lt.lg || this.miniState)) }
    get logger () { return this.$store.getters.log }

    @Watch('$q.screen.height')
    onScreenChange () {
      this.splitterModel = this.limits[1]
    }

    @Watch('logger')
    @Watch('splitterModel')
    onLoggerChange () {
      const logDiv = document.getElementsByClassName('logger-class')[0]
      if (logDiv) {
        setTimeout(() => {
          logDiv.scrollTo(0, logDiv.scrollHeight)
        }, 0)
      }
    }

    changeStep (newStep: number) {
      const message = `<span class="text-weight-bold text-grey-9" style="font-size: 16px">The changes you have made will be lost.</span> <br><br>` +
        `Are you sure you want to go to ` +
        `<span class="text-weight-bold text-primary">${this.steps[newStep - 1].title}</span> step?`
      this.$q.dialog({
        title: '<span class="text-primary"><i class="fas fa-info-circle" style="padding-right: 5px"></i>Previous Step</span>',
        message,
        cancel: true,
        html: true
      }).onOk(() => {
        if (newStep < 3) this.$store.dispatch('file/destroyStore')
        this.$store.commit('setStep', newStep)
      })
    }
  }
</script>

<style lang="stylus">
  .main-page
    /*max-width 1400px*/
    margin-left auto
    margin-right auto
  .menu-list .q-item
    border-radius 0 32px 32px 0
  .step-item:hover
    background #e5e5e5
</style>
