
export class IDBService {

  private readonly DB_NAME: string = 'f4hResourceDB'
  private readonly DB_VERSION: number = 1
  private db: IDBDatabase

  constructor () {
    this.initDB()
      .then(db => this.db = db)
  }

  /**
   * Opens and returns the database
   */
  initDB (): Promise<IDBDatabase> {
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
  delete (resourceType: string): Promise<any> {
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
  clearAll (): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(['resources'], 'readwrite')

      transaction.onerror = () => reject('Error clearing objectStore')
      transaction.oncomplete = () => resolve()

      const store: IDBObjectStore = transaction.objectStore('resources')
      store.clear()

    })
  }

  /**
   * Returns resource value by resource type
   * @param resourceType
   */
  get (resourceType: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(['resources'], 'readonly')

      transaction.onerror = () => reject(`Error getting ${resourceType} resources`)
      transaction.oncomplete = () => resolve(result)

      const store: IDBObjectStore = transaction.objectStore('resources')
      let result: any

      const request: IDBRequest = store.get(resourceType)

      request.onerror = () => reject(`Error getting ${resourceType} resources`)
      request.onsuccess = () => result = request.result

    })
  }

  /**
   * Returns all resources in the db
   */
  getAll (): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(['resources'], 'readonly')

      transaction.onerror = () => reject('Error getting resources')
      transaction.oncomplete = () => resolve(resources)

      const store: IDBObjectStore = transaction.objectStore('resources')
      let resources: any[] = []

      const request: IDBRequest = store.getAll()

      request.onerror = () => reject('Error getting resources')
      request.onsuccess = () => resources = request.result || []

    })
  }

  /**
   * Puts resource data into the db
   * @param resource
   */
  save (resource: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(['resources'], 'readwrite')

      transaction.onerror = () => reject('Error saving resource')
      transaction.oncomplete = () => resolve()

      const store = transaction.objectStore('resources')
      store.put(resource)

    })
  }

}
