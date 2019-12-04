<template>
  <div>
    <q-card flat class="q-mb-xs">
      <q-card-section>
        <div class="row q-col-gutter-lg">
          <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12 q-col-gutter-y-md">
            <div class="row justify-start q-col-gutter-md">
              <div class="col-xl-6 col-lg-6 col-md-6 col-12">
                <q-item-label class="text-weight-bold">
                  <span><q-icon name="fas fa-file" size="xs" color="primary" class="q-mr-xs" /> Source File</span>
                </q-item-label>
                <q-separator spaced />
                <q-select outlined dense v-model="currentSource" :options="fileSourceList" label="Source File">
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section avatar>
                        <q-icon name="fas fa-file" size="xs" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-html="scope.opt.label" />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-12">
                <q-item-label class="text-weight-bold">
                  <span><q-icon name="far fa-file-alt" size="xs" color="primary" class="q-mr-xs" /> Sheets</span>
                </q-item-label>
                <q-separator spaced />
                <q-select outlined dense v-model="currentSheet" :options="sheets" label="Sheets" :disable="!sheets.length">
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section avatar>
                        <q-icon name="far fa-file-alt" size="xs" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-html="scope.opt.label" />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
          </div>
          <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12 q-col-gutter-y-md">
            <div class="row justify-start q-col-gutter-md">
              <div class="col-xl-6 col-lg-6 col-md-6 col-12">
                <q-item-label class="text-weight-bold">
                  <span><q-icon name="fas fa-fire" size="xs" color="primary" class="q-mr-xs" /> FHIR Resource</span>
                </q-item-label>
                <q-separator spaced />
                <q-select outlined dense v-model="currentFHIRRes" :options="fhirResourceList" label="FHIR Resource">
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
              <div class="col-xl-6 col-lg-6 col-md-6 col-12">
                <q-item-label class="text-weight-bold">
                  <span><q-icon name="far fa-file-alt" size="xs" color="primary" class="q-mr-xs" /> Profiles</span>
                </q-item-label>
                <q-separator spaced />
                <q-select outlined dense v-model="currentFHIRProf" :options="fhirProfileList" label="Profiles" :disable="!fhirProfileList.length">
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
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-card flat class="bg-grey-3">
      <div>
        <q-splitter v-model="splitPercentage" :limits="[20, 80]" separator-class="bg-grey-4"
                    separator-style="width: 12px" :horizontal="$q.screen.lt.sm">

          <!--Data Source Part-->
          <template v-slot:before>
            <DataSourceTable />
          </template>

          <!--Splitter Separator-->
          <template v-slot:separator>
            <q-icon color="grey-7" size="xs" name="drag_indicator" />
          </template>

          <!--FHIR Resource Part-->
          <template v-slot:after>
            <FhirResourceTable />
          </template>
        </q-splitter>
      </div>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { SourceDataElement, FileSource, Sheet } from '@/common/file-source'

  @Component({
    components: {
      DataSourceTable: () => import('./tables/DataSourceTable.vue'),
      FhirResourceTable: () => import('./tables/FhirResourceTable.vue')
    }
  })
  export default class MetadataMapper extends Vue {
    private splitPercentage: number = 50

    get fileSourceList (): FileSource[] { return this.$store.getters['file/sourceList'] }
    set fileSourceList (value) { this.$store.commit('file/updateSourceList', value) }

    get currentSource (): FileSource { return this.$store.getters['file/currentFile'] }
    set currentSource (value) { this.$store.commit('file/setCurrentFile', value) }

    get sheets (): Sheet[] { return this.$store.getters['file/sheets'] }
    set sheets (value) { this.$store.commit('file/setSheets', value) }

    get currentSheet (): Sheet | null { return this.$store.getters['file/currentSheet'] }
    set currentSheet (value) { this.$store.commit('file/setCurrentSheet', value) }

    get fhirResourceList (): string[] { return this.$store.getters['fhir/resourceList'] }
    get fhirProfileList (): string[] { return this.$store.getters['fhir/profileList'].map(r => r.id) }

    get currentFHIRRes (): string { return this.$store.getters['fhir/currentResource'] }
    set currentFHIRRes (value) { this.$store.commit('fhir/setCurrentResource', value) }

    get currentFHIRProf (): string { return this.$store.getters['fhir/currentProfile'] }
    set currentFHIRProf (value) { this.$store.commit('fhir/setCurrentProfile', value) }
  }
</script>

<style lang="stylus">
  .q-card
    border-radius 10px !important
  .disabledArea
    pointer-events none
    opacity 0.4
  .splitter-slot
    height 65vh
  .sticky-header-table
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th
      background-color #fff
    thead th
      position sticky
      top 0
      opacity 1
      z-index 1
</style>
