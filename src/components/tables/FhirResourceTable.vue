<template>
  <div>
    <q-card flat class="bg-white">
      <q-card-section class="row q-col-gutter-sm">
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-item-label class="text-weight-bold">
            <span><q-icon name="fas fa-fire" size="xs" color="primary" class="q-mr-xs" /> FHIR Resource</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense v-model="currentFHIRRes" class="ellipsis" :options="fhirResourceOptions" label="FHIR Resource"
                    @filter="filterFn" use-input input-debounce="0">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section avatar>
                  <q-icon name="fas fa-fire" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-item-label class="text-weight-bold">
            <span><q-icon name="far fa-file-alt" size="xs" color="primary" class="q-mr-xs" /> Profiles</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense v-model="currentFHIRProf" class="ellipsis" :options="fhirProfileList" label="Profiles" :disable="!fhirProfileList.length">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section avatar>
                  <q-icon name="fas fa-file-alt" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </q-card-section>
      <div class="q-px-sm bg-grey-2" style="margin-top: -10px; margin-bottom: -10px">
        <q-toggle v-model="showMustFields" checked-icon="star" size="xs" color="red" label="Only must fields" class="text-grey-8" unchecked-icon="clear" />
      </div>
      <q-card-section>
        <div>
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
          <div style="overflow-y: auto">
            <q-splitter v-model="splitterModel" :limits="[50, 98]">
              <!--Fhir Element Tree Part-->
              <template v-slot:before>
                <q-scroll-area style="height: 50vh">
                  <q-tree :nodes="filteredFhirElementList"
                          ref="fhirTree"
                          node-key="value"
                          label-key="label"
                          tick-strategy="strict"
                          :ticked.sync="tickedFHIRAttr"
                          :expanded.sync="expanded"
                          :filter="filter"
                          no-nodes-label="Please select a resource"
                          no-results-label="No result found"
                          selected-color="primary"
                          default-expand-all
                  >
                    <template v-slot:default-header="prop">
                      <div class="row items-center full-width bg-grey-1 q-pa-xs">
                        <div class="col">
                          <div class="row items-center">
                            <q-icon :name="prop.node.children && prop.node.children.length ? 'account_tree' : 'lens'"
                                    color="orange-5"
                                    :size="prop.node.children && prop.node.children.length ? 'sm' : 'xs'"
                                    class="q-mr-sm"
                            />
                            <div class="cursor-pointer fhir-element-text" v-bind:class="{'text-primary': selectedStr === prop.node.value}"
                                  @click="onSelected(prop.node.value)">
                              {{ prop.node.label }}
                              <span class="text-red">{{ prop.node.min ? '*' : '' }}</span>
                            </div>
                            <q-chip v-if="prop.node.selectedType" :label="prop.node.selectedType" size="sm"
                                    :removable="prop.node.type && prop.node.type.length > 0"
                                    @remove="prop.node.selectedType=''; $store.commit('fhir/setElementList', fhirElementList)"
                            />
                          </div>
                          <div class="row">
                            <div v-if="prop.node.type && prop.node.type.length && (prop.node.type.length > 1 || env.datatypes[prop.node.type[0].value])"
                                 class="full-width">
                              <q-list dense class="q-ma-sm" style="font-size: 13px">
                                <q-tree :nodes="prop.node.type"
                                        node-key="value"
                                        accordion
                                >
                                  <template v-slot:default-header="prop2">
                                    <template v-if="prop2.node.children && prop2.node.children.length > 0">
                                      <span class="text-grey-8 text-weight-bold q-pl-md">{{ prop2.node.value }}</span>
                                    </template>
                                    <template v-else>
                                      <div class="row full-width items-center">
                                        <div>
                                          <q-radio dense v-model="prop.node.selectedType" class="text-grey-8 text-weight-medium full-width" :val="prop2.node.value"
                                                   :label="prop2.node.value" size="xs" @input="$store.commit('fhir/setElementList', fhirElementList)"
                                          />
                                        </div>
                                        <q-space />
                                        <div>
                                          <span v-if="prop2.node.type" class="text-caption text-primary">{{ prop2.node.type.map(_ => _.value).join(', ') }}</span>
                                        </div>
                                      </div>
                                    </template>
                                  </template>
                                </q-tree>
                              </q-list>
                            </div>
                          </div>
                        </div>
                        <div class="col-4 text-right">
                          <span v-if="prop.node.type" class="text-caption text-primary">{{ prop.node.type.map(_ => _.value).join(', ') }}</span>
                        </div>
                      </div>
                    </template>
                  </q-tree>
                  <Loading v-if="loadingFhir" />
                </q-scroll-area>
              </template>

              <!--Elements Definition Part-->
              <template v-slot:after>
                <q-scroll-area style="height: 50vh" v-if="selectedElem">
                  <div>
                    <q-toolbar class="bg-grey-2">
                      <q-item-label class="text-weight-bold text-grey-7 ellipsis">
                      <span class="text-weight-regular text-primary">
                        [{{ selectedElem.min }}..{{ selectedElem.max }}]
                      </span>
                        <u>
                          {{ selectedElem.value }}
                          <q-tooltip>{{ selectedElem.value }}</q-tooltip>
                        </u>
                        <span class="text-red">{{ selectedElem.min ? '*' : '' }}</span>
                      </q-item-label>
                      <q-space />
                      <q-btn unelevated round dense size="sm" icon="close" color="white" text-color="grey-9" @click="selectedStr=null; selectedElem=null" />
                    </q-toolbar>
                    <div class="q-ma-sm q-gutter-sm">
                      <q-card flat bordered v-if="selectedElem.short">
                        <q-card-section>
                          <div class="text-h6">Short</div>
                          <q-separator spaced />
                          <div class="text-grey-10">{{ selectedElem.short }}</div>
                        </q-card-section>
                      </q-card>
                      <q-card flat bordered v-if="selectedElem.definition">
                        <q-card-section>
                          <div class="text-h6">Definition</div>
                          <q-separator spaced />
                          <div class="text-grey-10">{{ selectedElem.definition }}</div>
                        </q-card-section>
                      </q-card>
                      <q-card flat bordered v-if="selectedElem.comment">
                        <q-card-section>
                          <div class="text-h6">Comments</div>
                          <q-separator spaced />
                          <div class="text-grey-10">{{ selectedElem.comment }}</div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-scroll-area>
              </template>
            </q-splitter>
          </div>
          <q-separator />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { FileSource, Sheet } from '@/common/model/file-source'
  import Loading from '@/components/Loading.vue'
  import { environment } from '@/common/environment'

  @Component({
    components: {
      Loading
    }
  })
  export default class FhirResourceTable extends Vue {
    private splitterModel = 100
    private loadingFhir: boolean = false
    private pagination = { page: 1, rowsPerPage: 0 }
    private selectedStr: string = ''
    private selectedElem: any = null
    private expanded: string[] = []
    private filter: string = ''
    private fhirResourceOptions: string[] = []
    private showMustFields: boolean = false
    private env = environment

    get fhirResourceList (): string[] { return this.$store.getters['fhir/resourceList'] }
    get fhirProfileList (): string[] { return this.$store.getters['fhir/profileList'].map(r => r.id) }
    set fhirProfileList (value) { this.$store.commit('fhir/setProfileList', value) }

    get currentFHIRRes (): string { return this.$store.getters['fhir/currentResource'] }
    set currentFHIRRes (value) { this.$store.commit('fhir/setCurrentResource', value) }

    get currentFHIRProf (): string { return this.$store.getters['fhir/currentProfile'] }
    set currentFHIRProf (value) { this.$store.commit('fhir/setCurrentProfile', value) }

    get filteredFhirElementList (): fhir.ElementTree[] {
      return this.$store.getters['fhir/elementList'].filter(child => !this.showMustFields || child.min)
    }
    get fhirElementList (): fhir.ElementTree[] { return this.$store.getters['fhir/elementList'] }
    set fhirElementList (value) { this.$store.commit('fhir/setElementList', value) }

    get fhirElementListFlat (): any { return this.$store.getters['fhir/elementListFlat'] }
    get currentSource (): FileSource { return this.$store.getters['file/currentFile'] }
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
            this.currentFHIRProf = this.fhirProfileList.length ? this.fhirProfileList[0] : ''
            // Fetch elements of base resources
            if (!this.currentFHIRProf) {
              this.$store.dispatch('fhir/getElements', this.currentFHIRRes)
                .then(() => this.loadingFhir = false )
                .catch(() => {
                  this.loadingFhir = false
                  this.$q.notify({message: 'Resource elements couldn\'t be loaded', color: 'red'})
                })
            } else this.loadingFhir = false
          }
        })
        .catch(err => {
          this.loadingFhir = false
          throw err
        })
    }

    @Watch('currentFHIRProf')
    onFHIRProfileChanged (newVal: any): void {
      if (newVal) {
        ([this.tickedFHIRAttr, this.selectedElem, this.expanded, this.fhirElementList] = [[], null, [this.currentFHIRRes], []])
        this.loadingFhir = true
        this.$store.dispatch('fhir/getElements', this.currentFHIRProf)
          .then(() => {
            this.loadingFhir = false
          })
          .catch(() => {
            this.loadingFhir = false
            this.$q.notify({message: 'Resource elements couldn\'t be loaded', color: 'red'})
          })
      }
    }

    @Watch('selectedStr')
    onChangedSelectedStr () {
      if (this.selectedStr) this.splitterModel = 50
      else this.splitterModel = 100
    }

    filterFn (val, update) {
      if (val === '') {
        update(_ => this.fhirResourceOptions = this.fhirResourceList)
        return
      }
      update(_ => this.fhirResourceOptions = this.fhirResourceList.filter(v => v.toLowerCase().indexOf(val.toLowerCase()) > -1))
    }

    onSelected (target) {
      this.selectedStr = target
      const filtered = this.fhirElementListFlat.filter(item => item.value === target)
      this.selectedElem = filtered.length ? filtered[0] : null
    }

  }
</script>

<style lang="stylus">
  .fhir-element-text:hover
    text-decoration underline
</style>
