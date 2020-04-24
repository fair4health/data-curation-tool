import { Vue, Component } from 'vue-property-decorator'
import Status from '@/common/Status'

@Component
export default class StatusMixin extends Vue {

  public isSuccess (value: string): boolean {
    return value === Status.SUCCESS
  }

  public isWarning (value: string): boolean {
    return value === Status.WARNING
  }

  public isError (value: string): boolean {
    return value === Status.ERROR
  }

  public isInProgress (value: string): boolean {
    return value === Status.IN_PROGRESS
  }

  public isPending (value: string): boolean {
    return value === Status.PENDING
  }

  public isValidating (value: string): boolean {
    return value === Status.VALIDATING
  }

  public isTransforming (value: string): boolean {
    return value === Status.TRANSFORMING
  }

}
