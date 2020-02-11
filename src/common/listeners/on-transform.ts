import * as Excel from 'xlsx'
import fs from 'fs'
import log from 'electron-log'
import 'isomorphic-fetch'
import { ipcMain } from 'electron'
import { workbookMap } from '../model/workbook'
import { TargetResource } from './../model/file-source'
import { FhirService } from './../services/fhir.service'
import { Patient, Practitioner, Condition, Observation } from './../model/resources'

/**
 * Start point of Transforming data to FHIR
 */
ipcMain.on('transform', (event, fhirBase: string, data: any) => {
  const fhirService: FhirService = new FhirService(fhirBase)
  const filePath = data.filePath

  const getWorkbooks = new Promise<Excel.WorkBook>(((resolve, reject) => {
    if (workbookMap.has(filePath)) {
      event.sender.send(`transforming-${filePath}`, [])
      resolve(workbookMap.get(filePath))
    } else {
      fs.readFile(filePath, (err, buffer) => {
        if (err) {
          reject(err)
          return
        }
        const workbook: Excel.WorkBook = Excel.read(buffer, {type: 'buffer', cellDates: true})
        // Save buffer workbook to map
        workbookMap.set(filePath, workbook)
        event.sender.send(`transforming-${filePath}`, [])
        resolve(workbook)
      })
    }
  }))
  getWorkbooks.then(workbook => {
    for (const sheet of Object.keys(data.sheets)) {
      const entries: any[] = Excel.utils.sheet_to_json(workbook.Sheets[sheet]) || []
      const sheetTargets = data.sheets[sheet]

      event.sender.send(`info-${filePath}-${sheet}`, {total: entries.length})
      log.info(`Starting transform ${sheet} in ${filePath}`)

      // Start transform action
      // Create records row by row in entries
      const resources: Map<string, fhir.Resource[]> = new Map<string, fhir.Resource[]>()

      Promise.all(entries.map(entry => {

        // For each row create resource instances
        const patientResource: fhir.Patient = {resourceType: 'Patient'}
        const practitionerResource: fhir.Practitioner = {resourceType: 'Practitioner'}
        const conditionMap: Map<string, fhir.Condition> = new Map<string, fhir.Condition>()
        const observationMap: Map<string, fhir.Observation> = new Map<string, fhir.Observation>()

        return Promise.all(sheetTargets.map(attr => {
          return Promise.all(attr.target?.map((target: TargetResource) => {
            return new Promise((resolve, reject) => {
              if (entry[attr.value!] !== null && entry[attr.value!] !== undefined && entry[attr.value!] !== '') {
                const [resource, field, ...subfields] = target.value.split('.')
                const payload: ResourceGenerator.Payload = {
                  value: String(entry[attr.value!]),
                  sourceType: attr.type,
                  targetField: field,
                  targetSubFields: subfields,
                  fhirType: target.type
                }
                switch (resource) {
                  case 'Patient':
                    Patient.generate(patientResource, payload)
                      .then(_ => resolve(true))
                      .catch(err => reject(err))
                    break
                  case 'Practitioner':
                    Practitioner.generate(practitionerResource, payload)
                      .then(_ => resolve(true))
                      .catch(err => reject(err))
                    break
                  case 'Condition':
                    if (!conditionMap.has(attr.recordId)) {
                      const conditionResource: fhir.Condition = {resourceType: 'Condition', subject: {}} as fhir.Condition
                      conditionMap.set(attr.recordId, conditionResource)
                    }
                    Condition.generate(conditionMap.get(attr.recordId)!, payload)
                      .then(_ => resolve(true))
                      .catch(err => reject(err))
                    break
                  case 'Observation':
                    // TODO
                    // const observationGroupIds = attr.group ? Object.keys(attr.group) : [uuid().slice(0, 8)]
                    // Promise.all(observationGroupIds.map(groupId => {
                    //   return new Promise((resolve1, reject1) => {
                    //     if (!observationMap.has(groupId)) {
                    //       const observationResource: fhir.Observation = {resourceType: 'Observation', status: 'final', subject: {}} as fhir.Observation
                    //       observationMap.set(groupId, observationResource)
                    //     }
                    //     Observation.generate(observationMap.get(groupId)!, payload)
                    //       .then(_ => resolve1(true))
                    //       .catch(err => reject1(err))
                    //   })
                    // }))
                    //   .then(_ => resolve(true))
                    //   .catch(err => reject(err))
                    break
                  default:
                    resolve(true)
                }
              } else {
                // log.warn(`${entry[attr.value!]} Empty field`)
                resolve(true)
              }
            })
          }) || [])
        }))
          .then((res) => {
            // End of transforming for one row

            // Patients
            if (patientResource.id) resources.set('Patient', [...(resources.get('Patient') || []), patientResource])
            // Practitioners
            if (practitionerResource.id) resources.set('Practitioner', [...(resources.get('Practitioner') || []), practitionerResource])
            // Conditions
            for (const conditionResource of Array.from(conditionMap.values()))
              resources.set('Condition', [...(resources.get('Condition') || []), conditionResource])

          })
          .catch(err => {
            // event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: `Transform error for sheet: ${sheet}`})
            log.error(`Transform error in one row for sheet: ${sheet} in ${filePath}: ${err.message}`)
          })
      }))
        .then(() => { // End of sheet
          if (entries.length) {

            Promise.all(Array.from(resources.keys()).map(resourceType => {
              const resourceList = resources.get(resourceType)
              return new Promise(((resolve, reject) => {
                // Batch upload resources
                // Max capacity 5000 resources
                const len = Math.ceil(resourceList!.length / 5000)

                const bulkPromiseList: Array<Promise<any>> = []

                for (let i = 0, p = Promise.resolve(); i < len; i++) {
                  bulkPromiseList.push(p.then(_ => new Promise((resolveBulk, rejectBulk) => {
                    fhirService.postBatch(resourceList!.slice(i * 5000, (i + 1) * 5000))
                      .then(() => resolveBulk())
                      .catch(err => {
                        log.warn(`Batch upload error: ${err}`)
                        rejectBulk(err)
                      })
                  })))
                }

                Promise.all(bulkPromiseList)
                  .then(res => {
                    log.info(`Batch upload completed for Resource: ${resourceType}`)
                    resolve()
                  })
                  .catch(err => {
                    reject(err)
                  })
              }))
            }))
              .then(res => {
                event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'done'})
                log.info(`Transform done ${sheet} in ${filePath}`)
              })
              .catch(err => {
                event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: `Batch upload error - ${err.message}`})
                // log.error(`BATCH ERROR ${filePath}-${sheet} - ${JSON.stringify(err)}`)
              })

          } else {
            event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'warning', description: 'Empty sheet'})
            log.warn(`Empty sheet: ${sheet} in ${filePath}`)
          }
        })
        .catch(err => {
          event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: `Transform error for sheet: ${sheet}`})
          log.error(`Transform error for sheet: ${sheet} in ${filePath}: ${err}`)
        })
    }
  })
    .catch(err => {
      event.sender.send(`transforming-${filePath}`, [])
      log.error(err)
      return
    })
})

ipcMain.on('delete-resource', (event, fhirBase: string, resourceType: string) => {
  const fhirService: FhirService = new FhirService(fhirBase)
  fhirService.deleteAll(resourceType)
    .then(_ => event.sender.send(`delete-resource-result`, true))
    .catch(_ => event.sender.send(`delete-resource-result`, false))
})
