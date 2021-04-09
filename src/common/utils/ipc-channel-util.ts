export class IpcChannelUtil {
  // IPC channel types (events)

  public static TO_ALL_BACKGROUND = 'to-all-background'
  public static TO_BACKGROUND = 'to-background'
  public static TO_RENDERER = 'to-renderer'
  public static READY = 'ready'
  public static SET_WORKBOOK_MAP = 'set-workbook-map'
  public static SET_DATA_SOURCE_TYPE = 'set-data-source-type'

  public static File = class {
    public static READ_FILE = 'read-file'
    public static READ_DONE = 'read-done'
    public static EXPORT_FILE = 'export-file'
    public static EXPORT_DONE = 'export-done'
    public static BROWSE_FILE = 'browse-file'
    public static SELECTED_FILES = 'selected-files'
    public static BROWSE_MAPPING = 'browse-mapping'
    public static SELECTED_MAPPING = 'selected-mapping'
    public static GET_TABLE_HEADERS = 'get-table-headers'
    public static READY_TABLE_HEADERS = 'ready-table-headers'
    public static PREPARE_SNAPSHOT_DATA = 'prepare-snapshot-data'
    public static READY_SNAPSHOT_DATA = 'ready-snapshot-data'
  }

  public static Database = class {
    public static CREATE_CONNECTION = 'create-connection'
    public static CLOSE_CONNECTION = 'close-connection'
    public static CLOSE_CONNECTION_RES = 'close-connection-res'
    public static CONNECTION_ESTABLISHED = 'connection-established'
    public static SELECT_DB = 'select-db'
  }

  public static ElectronStore = class {
    public static SET_ELECTRON_STORE = 'set-electron-store'
    public static GET_ELECTRON_STORE = 'get-electron-store'
    public static GOT_ELECTRON_STORE = 'got-electron-store'
  }

  public static Fhir = class {
    public static SET_FHIR_BASE = 'set-fhir-base'
    public static VALIDATE = 'validate'
    public static TRANSFORM = 'transform'
    public static TRANSFORM_RESULT = 'transform-result'
    public static ABORT_VALIDATION = 'abort-validation'
    public static VALIDATE_X = (fileName: string, sheetName: string) => `validate-${fileName}-${sheetName}`
    public static VALIDATE_READ_FILE_X = (fileName: string) => `validate-read-file-${fileName}`
    public static VALIDATE_ERROR_X = (fileName: string) => `validate-error-${fileName}`
    public static INFO_X = (fileName: string, sheetName: string) => `info-${fileName}-${sheetName}`
    public static GENERATED_RESOURCES_X = (fileName: string, sheetName: string) => `generated-resources-${fileName}-${sheetName}`
    public static TRANSFORM_X = (resourceType: string) => `transform-${resourceType}`
  }

  public static Terminology = class {
    public static SET_TERMINOLOGY_BASE_URL = 'set-terminology-base-url'
  }

}
