<template>
  <div>
    <q-card flat class="bg-white">
      <q-card-section class="row q-col-gutter-sm">
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-item-label class="text-weight-bold">
            <span><q-icon name="fas fa-fire" size="xs" color="primary" class="q-mr-xs" /> FHIR Resource</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense options-dense v-model="currentFHIRRes" class="ellipsis" :options="fhirResourceOptions" label="FHIR Resource"
                    @filter="filterFn" use-input input-debounce="0" :loading="loadingResources">
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
          <q-select outlined dense options-dense v-model="currentFHIRProf" class="ellipsis" :options="fhirProfileList"
                     :option-label="item => item.split('/').pop()" label="Profiles" :disable="!fhirProfileList.length">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section avatar>
                  <q-icon name="fas fa-file-alt" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt.split('/').pop()" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </q-card-section>
      <div class="q-px-sm bg-grey-2">
        <q-toggle v-model="showMustFields" checked-icon="star" size="xs" color="red" label="Show mandatory fields only" class="text-grey-8" unchecked-icon="clear" />
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
                      <div class="row full-width q-pa-xs" :class="{'bg-grey-1': !prop.node.error,'bg-red-1': prop.node.error}">
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
                                    @remove="prop.node.selectedType = ''; $store.commit('fhir/setElementList', fhirElementList)"
                            />
                          </div>
                          <div class="row">
                            <div v-if="prop.node.type
                                       && prop.node.type.length
                                       && prop.node.type.length > 1 || (env.datatypes[prop.node.type[0].value]
                                       && prop.node.type[0].value !== 'CodeableConcept'
                                       && prop.node.type[0].value !== 'Coding'
                                       && prop.node.type[0].value !== 'Extension')"
                                 class="full-width">
                              <q-list dense class="q-ma-sm" style="font-size: 13px">
                                <q-tree :nodes="prop.node.type"
                                        node-key="value"
                                        label-key="label"
                                        @lazy-load="getDataType"
                                        accordion
                                >
                                  <template v-slot:default-header="propType">
                                    <div class="row full-width">
                                      <div class="row full-width items-center">
                                        <div>
                                          <template
                                            v-if="
                                                   propType.node.type
                                                   && propType.node.type.length
                                                   && propType.node.type.length > 1 || (env.datatypes[propType.node.type[0].value]
                                                   && propType.node.type[0].value !== 'CodeableConcept'
                                                   && propType.node.type[0].value !== 'Coding'
                                                   && propType.node.type[0].value !== 'Reference')
                                                 "
                                          >
                                            <span class="text-grey-8 text-weight-bold">{{ propType.node.label }}</span>
                                          </template>
                                          <template v-else>
                                            <div class="row items-center">
                                              <div v-if="propType.node.type[0].value !== 'Reference' && (!propType.node.children || !propType.node.children.length)">
                                                <q-radio dense v-model="prop.node.selectedType" class="text-grey-8 text-weight-medium full-width" :val="propType.node.value"
                                                         :label="propType.node.label" size="xs" @input="$store.commit('fhir/setElementList', fhirElementList)"
                                                />
                                              </div>
                                              <div class="text-grey-8 text-weight-medium" v-else>
                                                {{ propType.node.label }}
                                              </div>
                                              <q-space />
                                              <div v-if="propType.node.type[0].value === 'Reference'" class="select-reference">
                                                <q-select dense class="q-pl-xs ellipsis"
                                                          clearable
                                                          options-dense
                                                          standout="bg-primary text-white"
                                                          :label="!prop.node.selectedReference ? 'Resource Type' : 'Resource'"
                                                          :ref="prop.node.value"
                                                          v-model="prop.node.selectedReference"
                                                          :options="fhirResourceOptions"
                                                          @filter="filterFn"
                                                          option-label="name"
                                                          option-value="id"
                                                          style="width: 280px; font-size: 12px"
                                                          @input="prop.node.selectedReference ? prop.node.selectedType = propType.node.value + '.' + prop.node.selectedReference : undefined;
                                                                  $store.commit('fhir/setElementList', fhirElementList);
                                                                  $refs[prop.node.value].blur();"
                                                          @clear="prop.node.selectedReference = ''; $refs[prop.node.value].blur(); $store.commit('fhir/setElementList', fhirElementList)"
                                                />
                                              </div>
                                            </div>
                                          </template>
                                        </div>
                                        <q-space />
                                        <div>
                                          <span v-if="propType.node.type" class="text-caption text-primary">{{ propType.node.type.map(_ => _.label).join(', ') }}</span>
                                        </div>
                                      </div>
                                    </div>
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
    private loadingResources: boolean = false

    get fhirResourceList (): string[] { return this.$store.getters['fhir/resourceList'] }
    get fhirProfileList (): any[] { return this.$store.getters['fhir/profileList'].map(_ => _.url) }
    set fhirProfileList (value) { this.$store.commit('fhir/setProfileList', value) }

    get currentFHIRRes (): string { return this.$store.getters['fhir/currentResource'] }
    set currentFHIRRes (value) { this.$store.commit('fhir/setCurrentResource', value) }

    get currentFHIRProf (): any { return this.$store.getters['fhir/currentProfile'] }
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
      this.loadingResources = true
      this.$store.dispatch('fhir/getResources')
        .then(res => {
          this.loadingResources = false
          if (res) this.fhirElementList = []
        })
        .catch(err => {
          this.loadingResources = false
          this.$notify.error('Something went wrong while fetching resources')
        })
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
              this.$store.dispatch('fhir/getElements', {parameterName: '_id', profile: this.currentFHIRRes})
                .then(() => this.loadingFhir = false )
                .catch(() => {
                  this.loadingFhir = false
                  this.$notify.error('Resource elements couldn\'t be loaded')
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
        this.$store.dispatch('fhir/getElements', {parameterName: 'url', profile: this.currentFHIRProf})
          .then(() => {
            this.loadingFhir = false
          })
          .catch(() => {
            this.loadingFhir = false
            this.$notify.error('Resource elements couldn\'t be loaded')
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

    getDataType ({ node, key, done, fail }) {
      if (node.type?.length) {
        if (node.type.length > 1) {

          // If the node has more than one data type, add the types as children so that you can select one of them
          done(node.type.map((_: fhir.ElementTree) => {

            // If the type is CodeableConcept or Reference, delete lazy option to deactivate expandable root
            if (_.type?.length && (_.type[0].value === 'CodeableConcept' || _.type[0].value === 'Reference'))
              delete _.lazy
            _.value = key + '.' + _.value
            return _

          }))
        } else {

          // If there exists only one data type, fetch and display its content
          this.$store.dispatch('fhir/getDataTypes', environment.datatypes[node.type?.length && node.type[0].value])
            .then((elementTreeList: fhir.ElementTree[]) => {
              if (elementTreeList.length) {
                done(elementTreeList[0].children.map(_ => {
                  _.value = key + '.' + _.value.split('.').slice(1).join('.')
                  return _
                }))
              } else {
                fail([])
              }
            })
            .catch(err => fail([]))
        }

      } else {

        fail([])

      }
    }

  }
</script>

<style lang="stylus">
  .fhir-element-text:hover
    text-decoration underline
  .q-menu
    max-height 450px
</style>
