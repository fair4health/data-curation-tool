
export class DbUtil {
  static getTablesQuery () {
    return `SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = \'public\' ORDER BY table_name`
  }

  static getColumnNamesQuery (table: string) {
    return `SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N\'${table}\'`
  }

  static getTop10EntriesQuery (table: string) {
    return `SELECT * FROM "${table}" limit 10`
  }

  static getEntriesQuery (table: string) {
    return `SELECT * FROM "${table}"`
  }
}
