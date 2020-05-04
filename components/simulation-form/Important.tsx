import {PropsWithChildren} from 'react'
import styles from './Important.module.css'

export default function Important(props: PropsWithChildren<{}>): JSX.Element {
  return <p className={styles.Important}>{props.children}</p>
}
