export class VuexStoreUtil {
  // Names of Getters, Mutations and Actions in Vuex Store, divided into modules

  // Getters
  public static DRAWER_OPEN = 'drawerOpen'
  public static DRAWER_MINI_STATE = 'drawerMiniState'
  public static CURATION_STEP = 'curationStep'
  public static MAPPING_LIST = 'mappingList'
  public static VALIDATION_STATUS = 'validationStatus'
  public static RESOURCES = 'resources'
  public static TRANSFORM_LIST = 'transformList'
  public static TRANSFORM_STATUS = 'transformStatus'
  public static TRANSFORM_OUTCOME_DETAILS = 'transformOutcomeDetails'
  public static DATA_SOURCE_TYPE = 'dataSourceType'
  public static DB_CONNECTION_STATUS = 'dbConnectionStatus'

  // Mutations
  public static SET_DRAWER_OPEN = 'setDrawerOpen'
  public static SET_DRAWER_MINI_STATE = 'setDrawerMiniState'
  public static INCREMENT_STEP = 'incrementStep'
  public static DECREMENT_STEP = 'decrementStep'
  public static SET_STEP = 'setStep'
  public static SET_MAPPING_LIST = 'setMappingList'
  public static SET_VALIDATION_STATUS = 'setValidationStatus'
  public static SET_RESOURCES = 'setResources'
  public static SET_TRANSFORM_LIST = 'setTransformList'
  public static SET_TRANSFORM_STATUS = 'setTransformStatus'
  public static SET_TRANSFORM_OUTCOME_DETAILS = 'setTransformOutcomeDetails'
  public static SET_DATA_SOURCE_TYPE = 'setDataSourceType'
  public static SET_DB_CONNECTION_STATUS = 'setDbConnectionStatus'

  // Actions
  // ...

  public static Fhir = class {

    // Getters
    public static RESOURCE_LIST = 'resourceList'
    public static PROFILE_LIST = 'profileList'
    public static ELEMENT_LIST = 'elementList'
    public static ELEMENT_LIST_FLAT = 'elementListFlat'
    public static CURRENT_RESOURCE = 'currentResource'
    public static CURRENT_PROFILE = 'currentProfile'
    public static SELECTED_FHIR_ELEMENTS = 'selectedFhirElements'
    public static FHIR_BASE = 'fhirBase'
    public static OUTCOME_DETAILS = 'outcomeDetails'
    public static FHIR_BASE_VERIFICATION_STATUS = 'fhirBaseVerificationStatus'
    public static FHIR_BASE_VERIFICATION_STATUS_DETAIL = 'fhirBaseVerificationStatusDetail'

    // Mutations
    public static SET_RESOURCE_LIST = 'setResourceList'
    public static SET_PROFILE_LIST = 'setProfileList'
    public static SET_ELEMENT_LIST = 'setElementList'
    public static SET_SELECTED_FHIR_ELEMENTS = 'setSelectedFhirElements'
    public static SET_CURRENT_RESOURCE = 'setCurrentResource'
    public static SET_CURRENT_PROFILE = 'setCurrentProfile'
    public static UPDATE_FHIR_BASE = 'updateFhirBase'
    public static SET_OUTCOME_DETAILS = 'setOutcomeDetails'
    public static SET_FHIR_BASE_VERIFICATION_STATUS = 'setFhirBaseVerificationStatus'
    public static SET_FHIR_BASE_VERIFICATION_STATUS_DETAIL = 'setFhirBaseVerificationStatusDetail'

    // Actions
    public static GET_RESOURCES = 'getResources'
    public static GET_PROFILES_BY_RES = 'getProfilesByRes'
    public static GET_ELEMENTS = 'getElements'
    public static VERIFY_FHIR = 'verifyFhir'
    public static GET_DATA_TYPES = 'getDataTypes'
    public static DELETE_ALL = 'deleteAll'

  }

  public static File = class {

    // Getters
    public static SOURCE_LIST = 'sourceList'
    public static CURRENT_FILE = 'currentFile'
    public static SHEETS = 'sheets'
    public static CURRENT_SHEET = 'currentSheet'
    public static SELECTED_HEADERS = 'selectedHeaders'
    public static BUFFER_SHEET_HEADERS = 'bufferSheetHeaders'
    public static SAVED_RECORDS = 'savedRecords'

    // Mutations
    public static UPDATE_SOURCE_LIST = 'updateSourceList'
    public static SET_CURRENT_FILE = 'setCurrentFile'
    public static SET_SHEETS = 'setSheets'
    public static SET_SHEET_HEADERS = 'setSheetHeaders'
    public static SET_CURRENT_SHEET = 'setCurrentSheet'
    public static ADD_FILE = 'addFile'
    public static SET_SELECTED_HEADERS = 'setSelectedHeaders'
    public static SET_BUFFER_SHEET_HEADERS = 'setBufferSheetHeaders'
    public static SETUP_BUFFER_SHEET_HEADERS = 'setupBufferSheetHeaders'
    public static SET_SAVED_RECORDS = 'setSavedRecords'

    // Actions
    public static INITIALIZE_STORE = 'initializeStore'
    public static DESTROY_STORE = 'destroyStore'

  }

  public static Terminology = class {

    // Getters
    public static TERMINOLOGY_BASE_URL = 'terminologyBaseUrl'
    public static CODE_SYSTEM_LIST = 'codeSystemList'
    public static T_BASE_VERIFICATION_STATUS = 'tBaseVerificationStatus'
    public static T_BASE_VERIFICATION_STATUS_DETAIL = 'tBaseVerificationStatusDetail'

    // Mutations
    public static UPDATE_TERMINOLOGY_BASE = 'updateTerminologyBase'
    public static SET_CODE_SYSTEM_LIST = 'setCodeSystemList'
    public static SET_T_BASE_VERIFICATION_STATUS = 'setTBaseVerificationStatus'
    public static SET_T_BASE_VERIFICATION_STATUS_DETAIL = 'setTBaseVerificationStatusDetail'

    // Actions
    public static VERIFY_TERMINOLOGY = 'verifyTerminology'
    public static GET_CODE_SYSTEMS = 'getCodeSystems'

  }

  public static IDB = class {

    // Getters
    // ..

    // Mutations
    // ..

    // Actions
    public static DELETE = 'idbDelete'
    public static CLEAR_ALL = 'idbClearAll'
    public static GET = 'idbGet'
    public static GET_ALL = 'idbGetAll'
    public static SAVE = 'idbSave'

  }

}
