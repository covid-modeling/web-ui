import {PropsWithChildren} from 'react'
import styles from './ApplicationComponent.module.css'

export default function ApplicationComponent(props: PropsWithChildren<{}>) {
  return (
    <div className={styles.Content}>
      <div className={styles.Heading}>
        <h3>Continuous application</h3>
        <p>Strategy is enforced for a specific period of time.</p>
      </div>
      {props.children}
    </div>
  )
}
