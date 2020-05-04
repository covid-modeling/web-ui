import {PropsWithChildren} from 'react'
import styles from './StatusBlock.module.css'
import StatusIcon from './StatusIcon'

type Props = {
  statusKey: string
}

export default function StatusBlock(props: PropsWithChildren<Props>) {
  return (
    <div className={styles.loadingBlock}>
      <div className="mb-4">
        <StatusIcon statusKey={props.statusKey} />
      </div>
      <div>{props.children}</div>
    </div>
  )
}
