<template>
  <div class="splitter-slot" v-bind:class="{disabledArea: !match}">
    <q-card flat class="bg-white">
      <q-card-section class="splitter-slot">
        <q-item-section class="q-px-xs">
          <q-input borderless dense v-model="filter" label="Filter">
            <template v-slot:prepend>
              <q-icon name="sort" />
            </template>
            <template v-slot:append>
              <q-icon v-if="filter" name="clear" class="cursor-pointer" @click="filter=''" />
            </template>
          </q-input>
        </q-item-section>
        <q-separator />
        <div style="max-height: 50vh; overflow-y: auto">
          <q-splitter
            v-model="splitterModel"
            style="height: 50vh"
          >
            <!--Fhir Element Tree Part-->
            <template v-slot:before>
              <q-scroll-area style="height: 50vh">
                <q-tree :nodes="fhirElementList"
                        node-key="value"
                        label-key="label"
                        tick-strategy="strict"
                        :ticked.sync="tickedFHIRAttr"
                        :selected.sync="selectedStr"
                        :expanded.sync="expanded"
                        :filter="filter"
                        no-nodes-label="Please select a resource"
                        no-results-label="No result found"
                        selected-color="primary"
                        @update:selected="onSelected"
                        default-expand-all
                >
                  <template v-slot:default-header="prop">
                    <div class="row items-center">
                      <q-icon :name="prop.node.children.length ? 'account_tree' : 'lens'"
                              color="orange-5"
                              :size="prop.node.children.length ? 'sm' : 'xs'"
                              class="q-mr-sm"
                      />
                      <div>{{ prop.node.label }}</div>
                    </div>
                  </template>
                </q-tree>
              </q-scroll-area>
            </template>

            <!--Elements Definition Part-->
            <template v-slot:after>
              <q-scroll-area style="height: 50vh" v-if="selectedElem">
                <div class="q-px-md">
                  <q-card flat class="overflow-auto q-ma-xs">
                    <div class="text-h6 text-weight-bold text-primary">
                      <u>
                        {{ selectedElem.value }}
                        <q-tooltip>{{ selectedElem.value }}</q-tooltip>
                      </u>
                    </div>
                  </q-card>
                  <q-card flat v-if="selectedElem.short">
                    <q-card-section>
                      <div class="text-h6">Short</div>
                      <q-separator spaced />
                      <div class="text-grey-10">{{ selectedElem.short }}</div>
                    </q-card-section>
                  </q-card>
                  <q-card flat v-if="selectedElem.definition">
                    <q-card-section>
                      <div class="text-h6">Definition</div>
                      <q-separator spaced />
                      <div class="text-grey-10">{{ selectedElem.definition }}</div>
                    </q-card-section>
                  </q-card>
                  <q-card flat v-if="selectedElem.comment">
                    <q-card-section>
                      <div class="text-h6">Comments</div>
                      <q-separator spaced />
                      <div class="text-grey-10">{{ selectedElem.comment }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </q-scroll-area>
            </template>
          </q-splitter>
        </div>
        <q-separator />
        <div class="row absolute-bottom q-ma-xs">
          <q-btn flat label="Back" color="primary" icon="fas fa-angle-left" @click="match=false" no-caps />
          <q-space />
          <q-btn :disable="!tickedFHIRAttr.length" unelevated label="Match" color="blue-1" text-color="primary"
                 @click="matchFields" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { Sheet } from '@/common/file-source'

  @Component
  export default class FhirResourceTable extends Vue {
    private splitterModel = 50
    private loadingFhir: boolean = false
    private pagination = { page: 1, rowsPerPage: 0 }
    private selectedStr: string = ''
    private selectedElem: any = null
    private expanded = []
    private filter: string = ''
    get match (): boolean { return this.$store.getters.match }
    set match (value) { this.$store.commit('setMatch', value) }

    get fhirProfileList (): string[] { return this.$store.getters['fhir/profileList'].map(r => r.id) }
    set fhirProfileList (value) { this.$store.commit('fhir/setProfileList', value) }

    get currentFHIRRes (): string { return this.$store.getters['fhir/currentResource'] }
    set currentFHIRRes (value) { this.$store.commit('fhir/setCurrentResource', value) }

    get currentFHIRProf (): string { return this.$store.getters['fhir/currentProfile'] }
    set currentFHIRProf (value) { this.$store.commit('fhir/setCurrentProfile', value) }

    get fhirElementList (): object[] { return this.$store.getters['fhir/elementList'] }
    set fhirElementList (value) { this.$store.commit('fhir/setElementList', value) }

    get fhirElementListFlat (): any { return this.$store.getters['fhir/elementListFlat'] }

    get currentSheet (): Sheet | null { return this.$store.getters['file/currentSheet'] }

    get selectedAttr (): any { return this.$store.getters['file/selectedElements'] }
    set selectedAttr (value) { this.$store.commit('file/setSelectedElements', value) }

    get tickedFHIRAttr (): any { return this.$store.getters['fhir/selectedElements'] }
    set tickedFHIRAttr (value) { this.$store.commit('fhir/setSelectedElements', value) }

    created () {
      this.$store.dispatch('fhir/getResources')
        .then(res => { if (res) this.fhirElementList = [] })
        .catch(err => { throw err })
      if (this.currentFHIRRes) this.onFHIRResourceChanged()
    }

    @Watch('currentFHIRRes')
    onFHIRResourceChanged (): void {
      ([this.currentFHIRProf, this.selectedStr, this.fhirProfileList, this.tickedFHIRAttr, this.fhirElementList] = ['', '', [], [], []])
      this.loadingFhir = true
      this.$store.dispatch('fhir/getProfilesByRes', this.currentFHIRRes)
        .then(result => {
          if (result) {
            this.loadingFhir = false
            this.currentFHIRProf = this.fhirProfileList.length ? this.fhirProfileList[0] : ''
            // Fetch elements of base resources
            if (!this.currentFHIRProf) {
              this.$store.dispatch('fhir/getElements', this.currentFHIRRes)
                .then(() => this.loadingFhir = false )
                .catch(err => {
                  this.loadingFhir = false
                  throw err
                })
            }
          }
        })
        .catch(err => {
          this.loadingFhir = false
          throw err
        })
    }
    @Watch('currentFHIRProf')
    onFHIRProfileChanged (): void {
      ([this.tickedFHIRAttr, this.selectedElem] = [[], null])
      this.loadingFhir = true
      this.$store.dispatch('fhir/getElements', this.currentFHIRProf)
        .then(() => {
          this.loadingFhir = false
        })
        .catch(err => {
          this.loadingFhir = false
          throw err
        })
    }

    onSelected (target) {
      const filtered = this.fhirElementListFlat.filter(item => item.value === target)
      this.selectedElem = filtered.length ? filtered[0] : null
    }
    matchFields (): void {
      this.tickedFHIRAttr = this.tickedFHIRAttr.map(obj => ({value: obj, resource: this.currentFHIRRes, profile: this.currentFHIRProf}))
      for (const attr of this.selectedAttr) {
        for (const column of this.currentSheet?.headers || []) {
          if (column?.value === attr.value) {
            column['target'] = this.tickedFHIRAttr
          }
        }
      }
      ([this.selectedAttr, this.tickedFHIRAttr, this.match] = [[], [], false])
      this.$q.notify({ message: 'Target value entered successfully', icon: 'check', color: 'green-6'})
    }

  }
</script>
