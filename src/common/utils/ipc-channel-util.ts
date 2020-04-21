export class IpcChannelUtil {
  // IPC channel types (events)

  public static TO_ALL_BACKGROUND = 'to-all-background'
  public static TO_BACKGROUND = 'to-background'
  public static TO_RENDERER = 'to-renderer'
  public static READY = 'ready'
  public static SET_WORKBOOK_MAP = 'set-workbook-map'

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
  }

}
