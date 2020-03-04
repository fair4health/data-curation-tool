import log from 'electron-log'
import { ipcMain } from 'electron'
import electronStore from './../electron-store'
import { FhirService } from './../services/fhir.service'

ipcMain.on('transform', (event, fhirBase: string) => {
  const fhirService: FhirService = new FhirService(fhirBase)

  let resources: Map<string, fhir.Resource[]> = new Map<string, fhir.Resource[]>()

  try {
    resources = new Map(Object.entries(electronStore.get('resources') || {}))
  } catch (e) {
    log.error('Electron store couldn\'t get the resource-generators')
  }

  Promise.all(Array.from(resources.keys()).map(resourceType => {
    const resourceList = resources.get(resourceType)
    return new Promise((resolve, reject) => {

      event.sender.send(`transform-${resourceType}`, {status: 'in-progress'} as OutcomeDetail)

      // Batch upload resource-generators
      // Max capacity 1000 resource-generators
      const len = Math.ceil(resourceList!.length / 1000)

      const batchPromiseList: Array<Promise<any>> = []

      for (let i = 0, p = Promise.resolve(); i < len; i++) {
        batchPromiseList.push(p.then(() => new Promise((resolveBatch, rejectBatch) => {
          fhirService.postBatch(resourceList!.slice(i * 1000, (i + 1) * 1000), 'PUT')
            .then(res => {
              const bundle: fhir.Bundle = res.data as fhir.Bundle
              const outcomeDetails: OutcomeDetail[] = []
              let hasError: boolean = false

              // Check batch bundle response for errors
              Promise.all(bundle.entry?.map(_ => {
                if (!_.resource) {
                  const operationOutcome: fhir.OperationOutcome = _.response!.outcome as fhir.OperationOutcome
                  operationOutcome.issue.map(issue => {
                    if (issue.severity === 'error') {
                      hasError = true
                      outcomeDetails.push({status: 'error', resourceType, message: `${issue.location} : ${issue.diagnostics}`} as OutcomeDetail)
                    } else if (issue.severity === 'information') {
                      outcomeDetails.push({status: 'success', resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
                    }
                  })
                } else {
                  outcomeDetails.push({status: 'success', resourceType, message: `Status: ${_.response?.status}`} as OutcomeDetail)
                }
              }) || [])
                .then(() => {
                  if (hasError) rejectBatch(outcomeDetails)
                  else resolveBatch(outcomeDetails)
                })
                .catch(err => rejectBatch(err))
            })
            .catch(err => {
              log.error(`Batch process error. ${err}`)
              rejectBatch(err)
            })
        }).catch(_ => _)))
      }

      Promise.all(batchPromiseList)
        .then(res => {
          const concatResult: OutcomeDetail[] = [].concat.apply([], res)
          log.info(`Batch process completed for Resource: ${resourceType}`)
          event.sender.send(`transform-${resourceType}`, {status: 'success', outcomeDetails: concatResult} as OutcomeDetail)
          resolve(concatResult)
        })
        .catch(err => {
          log.error(`Batch process error for Resource: ${resourceType}`)
          event.sender.send(`transform-${resourceType}`, {status: 'error'} as OutcomeDetail)
          reject(err)
        })

    }).catch(_ => _)

  }))
    .then((res: any[]) => {
      event.sender.send(`transform-result`, {status: 'success', outcomeDetails: [].concat.apply([], res)})
      log.info(`Transform completed`)
    })
    .catch(err => {
      event.sender.send(`transform-result`, {status: 'error', description: 'Transform error', outcomeDetails: err})
      log.error(`Transform error. ${err}`)
    })

})
