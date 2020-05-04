import Dot from '../svg/Dot.svg'
import Failure from '../svg/Failure.svg'
import StatusSpinner from '../svg/StatusSpinner.svg'
import Success from '../svg/Success.svg'
import styles from './StatusIcon.module.css'

interface Props {
  statusKey: string
}

export default function StatusIcon(props: Props) {
  switch (props.statusKey) {
    case 'pending':
      return (
        <div className="grid grid-cols-1">
          <Dot />
        </div>
      )
    case 'in-progress':
      return (
        <div className="grid grid-cols-1">
          <StatusSpinner className={styles['svg-rotate']} />
        </div>
      )
    case 'failed':
      return (
        <div className="grid grid-cols-1">
          <Failure />
        </div>
      )
    case 'complete':
      return (
        <div className="grid grid-cols-1">
          <Success />
        </div>
      )
    default:
      // no icon
      return <div className="grid grid-cols-1"></div>
  }
}
