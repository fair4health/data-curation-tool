import * as Excel from 'xlsx'
import fs from 'fs'
import log from 'electron-log'
import 'isomorphic-fetch'
import { ipcMain } from 'electron'
import { workbookMap } from '../model/workbook'
import { SourceDataElement, Target } from './../model/file-source'
import { FhirService } from './../services/fhir.service'
import { Patient, Practitioner, Condition } from './../model/resources'
import { v4 as uuid } from 'uuid'

const fhirService: FhirService = new FhirService()

/**
 * Start point of Transforming data to FHIR
 */
ipcMain.on('transform', async (event, data) => {
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
    let timeout = 0
    for (const sheet of Object.keys(data.sheets)) {
      const entries: any[] = Excel.utils.sheet_to_json(workbook.Sheets[sheet]) || []
      const sheetTargets = data.sheets[sheet]

      event.sender.send(`info-${filePath}-${sheet}`, {total: entries.length})

      // Start transform action
      // Create records row by row in entries
      Promise.all(entries.map(entry => {

        // For each row create resource instances
        const patientResource: fhir.Patient = {resourceType: 'Patient'}
        const practitionerResource: fhir.Practitioner = {resourceType: 'Practitioner'}
        const conditions: Map<string, fhir.Condition> = new Map<string, fhir.Condition>()

        return Promise.all(sheetTargets.map((attr: SourceDataElement) => {
          return Promise.all(attr.target?.map((target: Target) => {
            return new Promise((resolve, reject) => {
              if (entry[attr.value!] !== null && entry[attr.value!] !== undefined && entry[attr.value!] !== '') {
                const [resource, field, ...subfields] = target.value.split('.')
                switch (resource) {
                  case 'Patient':
                    timeout += 5
                    setTimeout(() => {
                      Patient.generate(patientResource, field, attr.type, subfields, entry[attr.value!])
                        .then(_ => resolve(true))
                        .catch(err => reject(err))
                    }, timeout)
                    break
                  case 'Practitioner':
                    timeout += 5
                    setTimeout(() => {
                      Practitioner.generate(practitionerResource, field, attr.type, subfields, entry[attr.value!])
                        .then(_ => resolve(true))
                        .catch(err => reject(err))
                    }, timeout)
                    break
                  case 'Condition':
                    // TODO: Review group assignments
                    const groupIds = attr.group ? Object.keys(attr.group) : [uuid().slice(0, 8)]
                    Promise.all(groupIds.map(groupId => {
                      timeout += 5
                      return new Promise((resolve1, reject1) => {
                        if (!conditions.has(groupId)) {
                          const conditionResource: fhir.Condition = {resourceType: 'Condition', subject: {}} as fhir.Condition
                          conditions.set(groupId, conditionResource)
                        }
                        setTimeout(() => {
                          Condition.generate(conditions.get(groupId)!, field, attr.type, subfields, String(entry[attr.value!]))
                            .then(_ => {
                              resolve1(true)
                            })
                            .catch(err => {
                              reject1(err)
                            })
                        }, timeout)
                      })
                    }))
                      .then(_ => resolve(true))
                      .catch(err => reject(err))
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
            // Insert resources here

            if (patientResource.id) {
              fhirService.postResource(patientResource)
                .then(patientRes => {
                  log.info(`${patientRes.status} Resource created Patient/${patientRes.data.id} Identifier: ${patientResource.id}`)
                  for (const conditionResource of Array.from(conditions.values())) {
                    if (conditionResource.subject && conditionResource.subject.reference) {
                      fhirService.postResource(conditionResource)
                        .then(conditionRes => {
                          log.info(`${conditionRes.status} Resource created Condition/${conditionRes.data.id}`)
                        })
                        .catch(err => {
                          log.error(`ERROR ${err.status}: while creating resource Condition with Subject: ${patientResource.id}`)
                        })
                    } else {
                      conditionResource.subject = {reference: `Patient/${patientRes.data.id}`} as fhir.Reference
                      fhirService.postResource(conditionResource)
                        .then(conditionRes => {
                          log.info(`${conditionRes.status} Resource created Condition/${conditionRes.data.id}`)
                        })
                        .catch(err => {
                          log.error(`ERROR ${err.status}: while creating resource Condition with Subject: ${patientResource.id}`)
                        })
                    }
                  }
                })
                .catch(err => {
                  log.error(`ERROR ${err.status}: while creating resource Patient/${patientResource.id}`)
                })
            } else {
              for (const conditionResource of Array.from(conditions.values())) {
                if (conditionResource.subject && conditionResource.subject.reference) {
                  fhirService.postResource(conditionResource)
                    .then(conditionRes => {
                      log.info(`${conditionRes.status} Resource created Condition/${conditionRes.data.id}`)
                    })
                    .catch(err => {
                      log.error(`ERROR ${err.status}: while creating resource Condition with Subject: ${patientResource.id}`)
                    })
                } else {
                  log.error(`ERROR while creating resource Condition without Subject. Subject needed.`)
                }
              }
            }
          })
          .catch(err => {
            // event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: `Transform error for sheet: ${sheet}`})
            log.error(`Transform error in one row for sheet: ${sheet} in ${filePath}: ${err}`)
          })
      }))
        .then(() => { // End of sheet
          if (entries.length) {
            event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'done'})
            log.info(`Transform done ${sheet} in ${filePath}`)
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
