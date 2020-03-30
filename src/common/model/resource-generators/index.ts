import { Patient } from './Patient'
import { Practitioner } from './Practitioner'
import { Condition } from './Condition'
import { Medication } from './Medication'
import { MedicationStatement } from './MedicationStatement'
import { MedicationRequest } from './MedicationRequest'
import { Observation } from './Observation'
import { Device } from './Device'
import { Encounter } from './Encounter'

const generators: Map<string, any> = new Map<string, any>()
generators.set('Patient', new Patient())
generators.set('Practitioner', new Practitioner())
generators.set('Condition', new Condition())
generators.set('Medication', new Medication())
generators.set('MedicationStatement', new MedicationStatement())
generators.set('MedicationRequest', new MedicationRequest())
generators.set('Observation', new Observation())
generators.set('Device', new Device())
generators.set('Encounter', new Encounter())

export default generators
