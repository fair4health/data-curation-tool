<template>
  <div>
    <q-card flat class="bg-white">
      <q-card-section class="row q-col-gutter-sm">
        <div class="col-xs-12 col-sm-12 col-md-6">
          <q-item-label class="text-weight-bold">
            <span><q-icon name="fas fa-fire" size="xs" color="primary" class="q-mr-xs" /> {{ $t('LABELS.FHIR_RESOURCE') }}</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense options-dense fill-input hide-selected v-model="currentFHIRRes" class="cursor-pointer" :options="fhirResourceOptions"
                    :label="$t('LABELS.FHIR_RESOURCE')" @filter="filterFn" use-input input-debounce="0" :loading="loadingResources">
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
            <span><q-icon name="far fa-file-alt" size="xs" color="primary" class="q-mr-xs" /> {{ $t('LABELS.PROFILES') }}</span>
          </q-item-label>
          <q-separator spaced />
          <q-select outlined dense options-dense v-model="currentFHIRProf" class="ellipsis" :options="sortProfiles(fhirProfileList)"
                    :option-label="item => item.split('/').pop()" :label="$t('LABELS.PROFILES')" :disable="!fhirProfileList.length"
                    clearable @clear="onFHIRResourceChanged">
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
      <div class="row q-px-md bg-grey-1 flex-center">
        <div class="col q-gutter-xs">
          <q-toggle v-model="showMandatoryElements"
                    checked-icon="check"
                    size="xs"
                    color="primary"
                    :label="$t('BUTTONS.SHOW_MANDATORY_ELEMENTS_ONLY')"
                    class="text-grey-8 text-size-lg"
                    unchecked-icon="clear"
          />
          <q-toggle v-model="hideBaseElements"
                    checked-icon="check"
                    size="xs"
                    color="primary"
                    :label="$t('BUTTONS.HIDE_BASE_RESOURCE_ELEMENTS')"
                    class="text-grey-8 text-size-lg"
                    unchecked-icon="clear"
          />
        </div>
<!--        <q-btn unelevated stretch :label="$t('BUTTONS.OPTIONS')" color="grey-3" text-color="grey-8" class="text-size-lg" no-caps>-->
<!--          <q-badge v-if="filterCount" color="primary" class="text-size-xs" floating>-->
<!--            {{ filterCount }}-->
<!--          </q-badge>-->
<!--          <q-menu>-->
<!--            <q-list padding class="menu-list">-->
<!--              <q-item clickable dense>-->
<!--                <q-item-section>-->
<!--                  <q-toggle v-model="showMandatoryElements"-->
<!--                            checked-icon="check"-->
<!--                            size="xs"-->
<!--                            color="primary"-->
<!--                            :label="$t('BUTTONS.SHOW_MANDATORY_ELEMENTS_ONLY')"-->
<!--                            class="text-grey-8 text-size-lg"-->
<!--                            unchecked-icon="clear"-->
<!--                  />-->
<!--                </q-item-section>-->
<!--              </q-item>-->
<!--              <q-item clickable dense>-->
<!--                <q-item-section>-->
<!--                  <q-toggle v-model="hideBaseElements"-->
<!--                            checked-icon="check"-->
<!--                            size="xs"-->
<!--                            color="primary"-->
<!--                            :label="$t('BUTTONS.HIDE_BASE_RESOURCE_ELEMENTS')"-->
<!--                            class="text-grey-8 text-size-lg"-->
<!--                            unchecked-icon="clear"-->
<!--                  />-->
<!--                </q-item-section>-->
<!--              </q-item>-->
<!--            </q-list>-->
<!--          </q-menu>-->
<!--        </q-btn>-->
        <q-space />
        <q-input standout="bg-primary" rounded dense v-model.lazy.trim="filterText" :placeholder="$t('BUTTONS.SEARCH')" @keydown.esc="filterText = ''">
          <template v-slot:append>
            <q-icon v-if="!filterText" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="filterText = ''" />
          </template>
        </q-input>
      </div>
      <div class="row bg-grey-2">
        <div class="col q-px-md q-py-sm">
          <div class="text-size-sm text-grey-8"><span class="text-red">* </span>{{ $t('INFO.ASTERISK_INFO') }}</div>
          <div v-show="expandedTableInfo" class="text-size-sm text-grey-8"><span class="text-red">* </span>{{ $t('INFO.ID_FIELD_INFO') }}</div>
        </div>
        <div class="col-auto q-mr-md q-pa-xs">
          <q-btn flat round dense size="sm" :icon="expandedTableInfo ? 'expand_less' : 'expand_more'"
                 @click="expandedTableInfo = !expandedTableInfo" class="flex-center center" />
        </div>
      </div>
      <q-card-section class="q-pt-none">
        <q-splitter v-model="splitterModel" :limits="[50, 100]">
          <!--Fhir Element Tree Part-->
          <template v-slot:before>
            <q-scroll-area class="fhir-table-height overflow-hidden q-pa-sm">
              <q-tree :nodes="filteredFhirElementList"
                      ref="fhirTree"
                      node-key="value"
                      label-key="label"
                      tick-strategy="strict"
                      :ticked.sync="tickedFHIRAttr"
                      :expanded.sync="expanded"
                      :filter="filterText"
                      :no-nodes-label="$t('LABELS.PLEASE_SELECT_A_RESOURCE')"
                      :no-results-label="$t('LABELS.NO_RESULT')"
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
                                @remove="prop.node.selectedType = ''; updateElementList(); prop.ticked = false"
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
                          <q-list dense class="q-ma-sm text-size-lg">
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
                                                     :label="propType.node.label" size="xs" @input="updateElementList(); prop.ticked = true"
                                            />
                                          </div>
                                          <div class="text-grey-8 text-weight-medium" v-else>
                                            {{ propType.node.label }}
                                          </div>
                                          <q-space />
                                          <div v-if="propType.node.type[0].value === 'Reference'" class="select-reference">
                                            <q-select dense class="q-pl-xs ellipsis text-size-md select-input"
                                                      options-dense
                                                      standout="bg-primary text-white"
                                                      :label="!prop.node.selectedReference ? 'Resource Type' : 'Resource'"
                                                      :ref="prop.node.value"
                                                      v-model="prop.node.selectedReference"
                                                      :options="getTargetResourceOptions(prop.node, propType.node)"
                                                      @filter="filterFn"
                                                      option-label="name"
                                                      option-value="id"
                                                      @input="prop.node.selectedReference ? prop.node.selectedType = propType.node.value + '.' + prop.node.selectedReference : undefined;
                                                                updateElementList(); prop.ticked = true;
                                                                $refs[prop.node.value].blur();"
                                                      @clear="prop.node.selectedReference = ''; $refs[prop.node.value].blur(); updateElementList()"
                                            />
                                          </div>
                                        </div>
                                      </template>
                                    </div>
                                    <q-space />
                                    <div>
                                      <code-system-popup
                                        v-if="!propType.node.fixedUri
                                                && propType.node.type.length === 1
                                                && (propType.node.type[0].value === 'CodeableConcept'
                                                    || propType.node.type[0].value === 'Coding')"
                                        :prop="prop"
                                        @update-prop="(value) => prop = value"
                                      />
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
                      <code-system-popup
                        v-if="!prop.node.fixedUri
                                && prop.node.type.length === 1
                                && (prop.node.type[0].value === 'CodeableConcept'
                                    || prop.node.type[0].value === 'Coding')"
                        :prop="prop"
                        @update-prop="(value) => prop = value"
                      />
                      <span v-if="prop.node.type" class="text-caption text-primary">{{ prop.node.type.map(_ => _.value).join(', ') }}</span>
                      <div class="ellipsis">
                          <span v-if="prop.node.fixedUri || prop.node.selectedUri" class="cursor-pointer">
                            <a class="text-size-sm bg-grey-3 text-grey-8" @click="openExternal(prop.node.fixedUri || prop.node.selectedUri)">
                              <u>{{ prop.node.fixedUri || prop.node.selectedUri }}</u>
                            </a>
                            <q-tooltip>
                              <span class="row items-center">
                                <q-icon name="open_in_new" class="q-mr-xs" />
                              {{ prop.node.fixedUri || prop.node.selectedUri }}
                              </span>
                            </q-tooltip>
                          </span>
                      </div>
                    </div>
                  </div>
                </template>
              </q-tree>
              <Loading v-if="loadingFhir" />
            </q-scroll-area>
          </template>

          <!--Elements Definition Part-->
          <template v-slot:after>
            <q-scroll-area v-if="selectedElem" class="fhir-table-height overflow-hidden">
              <div>
                <q-toolbar>
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
                <q-separator inset />
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
        <q-separator />
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator'
  import { Sheet } from '@/common/model/data-source'
  import Loading from '@/components/Loading.vue'
  import { environment } from '@/common/environment'
  import { VuexStoreUtil as types } from '@/common/utils/vuex-store-util'
  import { shell } from 'electron'

  @Component({
    components: {
      Loading,
      CodeSystemPopup: () => ({
        component: import('@/components/modals/CodeSystemPopup.vue'),
        loading: Loading,
        delay: 0
      })
    } as any
  })
  export default class FhirResourceTable extends Vue {
    private splitterModel = 100
    private loadingFhir: boolean = false
    private pagination = { page: 1, rowsPerPage: 0 }
    private selectedStr: string = ''
    private selectedElem: any = null
    private expanded: string[] = []
    private filterText: string = ''
    private fhirResourceOptions: string[] = []
    private showMandatoryElements: boolean = false
    private env = environment
    private loadingResources: boolean = false
    private hideBaseElements: boolean = true
    private expandedTableInfo: boolean = true

    get fhirResourceList (): string[] { return this.$store.getters[types.Fhir.RESOURCE_LIST] }
    get fhirProfileList (): string[] { return this.$store.getters[types.Fhir.PROFILE_LIST].map(_ => _.url) }
    set fhirProfileList (value) { this.$store.commit(types.Fhir.SET_PROFILE_LIST, value) }

    get currentFHIRRes (): string { return this.$store.getters[types.Fhir.CURRENT_RESOURCE] }
    set currentFHIRRes (value) { this.$store.commit(types.Fhir.SET_CURRENT_RESOURCE, value) }

    get currentFHIRProf (): any { return this.$store.getters[types.Fhir.CURRENT_PROFILE] }
    set currentFHIRProf (value) { this.$store.commit(types.Fhir.SET_CURRENT_PROFILE, value) }

    get filteredFhirElementList (): fhir.ElementTree[] {
      return this.$store.getters[types.Fhir.ELEMENT_LIST]
        .filter((element: fhir.ElementTree) => {
          return (!this.hideBaseElements || !this.isFhirBaseResourceContent(element)) && (!this.showMandatoryElements || element.min)
        })
    }
    get fhirElementList (): fhir.ElementTree[] { return this.$store.getters[types.Fhir.ELEMENT_LIST] }
    set fhirElementList (value) { this.$store.commit(types.Fhir.SET_ELEMENT_LIST, value) }

    get fhirElementListFlat (): any { return this.$store.getters[types.Fhir.ELEMENT_LIST_FLAT] }
    get currentSheet (): Sheet | null { return this.$store.getters[types.File.CURRENT_SHEET] }

    get tickedFHIRAttr (): any { return this.$store.getters[types.Fhir.SELECTED_FHIR_ELEMENTS] }
    set tickedFHIRAttr (value) { this.$store.commit(types.Fhir.SET_SELECTED_FHIR_ELEMENTS, value) }

    get baseElementList (): string[] {
      return ['meta', 'implicitRules', 'language', 'text', 'contained', 'extension', 'modifierExtension']
    }
    get filterCount (): number {
      let count: number = 0
      if (this.showMandatoryElements) count++
      if (this.hideBaseElements) count++
      return count
    }

    created () {
      this.loadingResources = true
      this.$store.dispatch(types.Fhir.GET_RESOURCES)
        .then(res => {
          this.loadingResources = false
          if (res) this.fhirElementList = []
        })
        .catch(err => {
          this.loadingResources = false
          this.$notify.error(String(this.$t('ERROR.ST_WRONG_FETCHING_X', {name: 'resources'})))
        })
      if (this.currentFHIRRes) this.onFHIRResourceChanged()
      this.expandedTableInfo = (localStorage.getItem('expandedTableInfo') || '').toLowerCase() === 'true'
    }

    @Watch('currentFHIRRes')
    onFHIRResourceChanged (): void {
      ([this.currentFHIRProf, this.selectedStr, this.fhirProfileList, this.tickedFHIRAttr, this.fhirElementList] = ['', '', [], [], []])
      this.loadingFhir = true
      this.$store.dispatch(types.Fhir.GET_PROFILES_BY_RES, this.currentFHIRRes)
        .then(result => {
          if (result) {
            // Fetch elements of base resources
            if (!this.currentFHIRProf) {
              this.$store.dispatch(types.Fhir.GET_ELEMENTS, {parameterName: '_id', profile: this.currentFHIRRes})
                .then(() => this.loadingFhir = false )
                .catch(() => {
                  this.loadingFhir = false
                  this.$notify.error(String(this.$t('ERROR.X_RESOURCE_ELEMENTS_COULDNT_BE_LOADED', {resource: this.currentFHIRRes})))
                })
            } else this.loadingFhir = false
          }
        })
        .catch(err => {
          this.loadingFhir = false
          this.$notify.error(String(this.$t('ERROR.X_RESOURCE_ELEMENTS_COULDNT_BE_LOADED', {resource: this.currentFHIRRes})))
        })
    }

    @Watch('currentFHIRProf')
    onFHIRProfileChanged (newVal: any): void {
      if (newVal) {
        ([this.tickedFHIRAttr, this.selectedElem, this.expanded, this.fhirElementList] = [[], null, [this.currentFHIRRes], []])
        this.loadingFhir = true
        this.$store.dispatch(types.Fhir.GET_ELEMENTS, {parameterName: 'url', profile: this.currentFHIRProf})
          .then(() => {
            this.loadingFhir = false
          })
          .catch(() => {
            this.loadingFhir = false
            this.$notify.error(String(this.$t('ERROR.X_PROFILE_ELEMENTS_COULDNT_BE_LOADED', {profile: this.currentFHIRProf})))
          })
      }
    }

    @Watch('selectedStr')
    onChangedSelectedStr () {
      if (this.selectedStr) this.splitterModel = 50
      else this.splitterModel = 100
    }

    @Watch('expandedTableInfo')
    onExpandedTableInfoChanged () {
      localStorage.setItem('expandedTableInfo', String(this.expandedTableInfo))
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
          this.$store.dispatch(types.Fhir.GET_DATA_TYPES, environment.datatypes[node.type?.length && node.type[0].value])
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

    updateElementList () {
      this.$store.commit(types.Fhir.SET_ELEMENT_LIST, this.fhirElementList)
    }

    openExternal (url: string) {
      shell.openExternal(url)
    }

    isFhirBaseResourceContent (element: fhir.ElementTree): boolean {
      return this.$_.includes(this.baseElementList, element.label)
    }

    sortProfiles (profiles: string[]) {
      return profiles.sort((p1, p2) => {
        const p1Name = p1.split('/').pop().toLowerCase()
        const p2Name = p2.split('/').pop().toLowerCase()
        return (p1Name > p2Name) ? 1 : ((p2Name > p1Name) ? -1 : 0)
      })
    }

    getTargetResourceOptions (node: fhir.ElementTree, subNode: fhir.ElementTree): string[] {
      // The reference resource constraints may come from current element node or its descendants.
      // So we need to take the intersection of these target resources/profiles.
      const mergedNodesToBeChecked = []
      // Final reference resource target list
      const targetList: string[] = []
      // Consider the current element node and sub element node
      mergedNodesToBeChecked.push(...[...node.type.filter(_ => _.value === 'Reference'), subNode, ...subNode.type])
      mergedNodesToBeChecked.forEach(type => {
        targetList.push(...(type?.targetProfile?.map(_ => {
          const resourceType = _.split('/').pop()
          if (resourceType !== 'Resource' && !targetList.includes(resourceType)) {
            return resourceType
          }
        }) || []).filter(_ => _))
      })
      // If the targetList is empty, list all resources
      if (!targetList.length) {
        return this.fhirResourceOptions
      } else {
        return targetList
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .fhir-table-height
    height 50vh
  .fhir-element-text:hover
    text-decoration underline
</style>
