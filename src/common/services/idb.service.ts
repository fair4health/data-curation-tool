
export class IDBService {

  private readonly DB_NAME: string = 'f4hResourceDB'
  private readonly DB_VERSION: number = 1
  private db: IDBDatabase

  constructor () {
    this.getDB()
      .then(db => this.db = db)
  }

  /**
   * Opens and returns the database
   */
  getDB (): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = () => reject('Error opening db')
      request.onsuccess = e => {
        const db: IDBDatabase = (e.target as IDBOpenDBRequest).result
        resolve(db)
      }

      request.onupgradeneeded = e => {
        const db: IDBDatabase = (e.target as IDBOpenDBRequest).result
        db.createObjectStore('resources', { autoIncrement: true, keyPath: 'resource' })
      }
    })
  }

  /**
   * Deletes the record with given key (resourceType)
   * @param resourceType
   */
  deleteResource (resourceType: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(['resources'], 'readwrite')

      transaction.onerror = () => reject('Error deleting resource')
      transaction.oncomplete = () => resolve()

      const store: IDBObjectStore = transaction.objectStore('resources')
      store.delete(resourceType)

    })

  }

  /**
   * Clears the db - object store
   */
  clearResources (): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(['resources'], 'readwrite')

      transaction.onerror = () => reject('Error clearing objectStore')
      transaction.oncomplete = () => resolve()

      const store: IDBObjectStore = transaction.objectStore('resources')
      store.clear()

    })

  }

  /**
   * Returns all resources in the db
   */
  getResources (): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(['resources'], 'readonly')

      transaction.onerror = () => reject('Error getting resources')
      transaction.oncomplete = () => resolve(resources)

      const store: IDBObjectStore = transaction.objectStore('resources')
      const resources: any[] = []

      store.openCursor().onsuccess = e => {
        const cursor = (e.target as IDBRequest).result
        if (cursor) {
          resources.push(cursor.value)
          cursor.continue()
        }
      }

    })
  }

  /**
   * Puts resource data into the db
   * @param resource
   */
  saveResource (resource: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(['resources'], 'readwrite')

      transaction.onerror = () => reject('Error saving resource')
      transaction.oncomplete = () => resolve()

      const store = transaction.objectStore('resources')
      store.put(resource)

    })

  }

}
